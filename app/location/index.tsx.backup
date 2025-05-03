import React, { useEffect, useState, useRef } from 'react';
import { View, TextInput, StyleSheet, Button, KeyboardAvoidingView, Platform, FlatList, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import WebView from 'react-native-webview';
import * as Location from 'expo-location';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RouteLoadingOverlay from '@/components/Animatedroute/animated-route';

const MapScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [gettingDirections, setGettingDirections] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Refs to store current state values that can be accessed in callbacks
  const webviewRef = useRef(null);
  const currentZoomRef = useRef(13);
  const currentRouteRef = useRef(null);
  const userLocationRef = useRef(null);
  const selectedLocationRef = useRef(null);

  // Initialize map and location tracking
  useEffect(() => {
    let locationSubscription = null;

    const setupLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
          return;
        }

        // Get initial location
        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });

        const locationObj = {
          lat: initialLocation.coords.latitude,
          lon: initialLocation.coords.longitude,
        };

        setUserLocation(locationObj);
        userLocationRef.current = locationObj;

        // Save to AsyncStorage
        await AsyncStorage.setItem('cached_location', JSON.stringify(locationObj));

        // Start watching location
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 15000, // 15 seconds
            distanceInterval: 100, // 100 meters
          },
          (location) => {
            const updatedLocation = {
              lat: location.coords.latitude,
              lon: location.coords.longitude,
            };

            // Update refs and state
            userLocationRef.current = updatedLocation;
            setUserLocation(updatedLocation);

            // Only update map if it's ready
            if (mapReady && webviewRef.current) {
              webviewRef.current.postMessage(
                JSON.stringify({
                  type: 'updateUserLocation',
                  start: updatedLocation,
                  currentZoom: currentZoomRef.current,
                  route: currentRouteRef.current
                })
              );
            }
          }
        );
      } catch (error) {
        console.error('Error setting up location:', error);
      }
    };

    setupLocation();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  // Handle search input changes and fetch suggestions
  const handleSearchChange = async (query) => {
    setSearchQuery(query);

    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`,
        {
          headers: {
            'User-Agent': 'YourAppName/1.0 (your-email@example.com)'
          }
        }
      );
      setSuggestions(response.data);
    } catch (error) {
      console.error("Failed to fetch search suggestions:", error);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = async (suggestion) => {
    const location = {
      lat: parseFloat(suggestion.lat),
      lon: parseFloat(suggestion.lon),
    };

    // Update refs and state
    selectedLocationRef.current = location;
    setSelectedLocation(location);
    setSearchQuery(suggestion.display_name);
    setSuggestions([]);

    if (!userLocationRef.current) return;

    await getDirections(userLocationRef.current, location);
  };

  // Get directions between two points
  const getDirections = async (start, end) => {
    if (!start || !end) return;

    setGettingDirections(true);

    try {
      const routeUrl = `https://routes.kodam.in/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson`;
      const routeRes = await axios.get(routeUrl);
      const routeData = routeRes.data;

      if (routeData.routes && routeData.routes.length > 0) {
        const route = routeData.routes[0];
        const distanceKm = (route.distance / 1000).toFixed(2);
        const durationMin = Math.ceil(route.duration / 60);

        // Store route in ref for persistence
        currentRouteRef.current = route.geometry.coordinates;

        // Update map with route
        if (webviewRef.current) {
          webviewRef.current.postMessage(
            JSON.stringify({
              type: 'showRoute',
              start: start,
              end: end,
              route: route.geometry.coordinates,
              currentZoom: currentZoomRef.current
            })
          );
        }

        // Display route info
        Alert.alert(
          'Route Info',
          `Distance: ${distanceKm} km\nEstimated Time: ${durationMin} min`
        );
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    } finally {
      setGettingDirections(false);
    }
  };

  // Handle search button press
  const handleSearch = async () => {
    if (!userLocationRef.current || !selectedLocationRef.current) return;
    await getDirections(userLocationRef.current, selectedLocationRef.current);
  };

  // Center map on user's location
  const handleMyLocation = async () => {
    try {
      setLoadingLocation(true);

      // Get fresh location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      const currentLocation = {
        lat: location.coords.latitude,
        lon: location.coords.longitude,
      };

      // Update state and refs
      setUserLocation(currentLocation);
      userLocationRef.current = currentLocation;

      // Save to AsyncStorage
      await AsyncStorage.setItem('cached_location', JSON.stringify(currentLocation));

      // Fixed zoom level (20) for "My Location" button
      if (webviewRef.current) {
        webviewRef.current.postMessage(
          JSON.stringify({
            type: 'centerOnUser',
            start: currentLocation,
            zoom: 20,
            route: currentRouteRef.current
          })
        );
      }

      // Update zoom ref
      currentZoomRef.current = 20;

    } catch (error) {
      console.error('Error fetching location:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

  // Handle messages from WebView
  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'mapReady') {
        setMapReady(true);

        // Initialize map with current data
        if (userLocationRef.current) {
          webviewRef.current?.postMessage(
            JSON.stringify({
              type: 'init',
              start: userLocationRef.current,
              zoom: currentZoomRef.current,
              route: currentRouteRef.current,
              end: selectedLocationRef.current
            })
          );
        }
      }

      if (data.type === 'zoomChanged') {
        currentZoomRef.current = data.zoom;
      }

    } catch (error) {
      console.error('Error processing WebView message:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <RouteLoadingOverlay visible={gettingDirections} />

      {(gettingDirections || loadingLocation) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}

      <View style={styles.mapContainer}>
        <WebView
          ref={webviewRef}
          originWhitelist={['*']}
          source={{ html: getMapHTML() }}
          javaScriptEnabled={true}
          onMessage={handleWebViewMessage}
        />

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter destination"
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
          <Button title="Go" onPress={handleSearch} disabled={!selectedLocation} />
        </View>

        {suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSuggestionSelect(item)}
              >
                <Text numberOfLines={2}>{item.display_name}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => index.toString()}
            style={styles.suggestionsList}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={handleMyLocation}
      >
        <Text style={styles.myLocationIcon}>📍</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const getMapHTML = () => `
<!DOCTYPE html>
<html>
<head>
  <title>Leaflet Map</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .leaflet-control-attribution { display: none !important; }
    
    .user-marker {
      width: 15px;
      height: 15px;
      background: #3b82f6;
      border-radius: 50%;
      border: 2px solid white;
      position: relative;
    }
    
    .user-marker::after {
      content: '';
      width: 100%;
      height: 100%;
      border-radius: 50%;
      position: absolute;
      top: 0;
      left: 0;
      background: rgba(59, 130, 246, 0.5);
      animation: pulse 1.5s ease-out infinite;
    }
    
    .destination-marker {
      width: 20px;
      height: 20px;
      background: #ef4444;
      border-radius: 50%;
      border: 2px solid white;
    }
    
    @keyframes pulse {
      0% { transform: scale(0.5); opacity: 1; }
      100% { transform: scale(2); opacity: 0; }
    }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  // Initialize variables
  let map;
  let userMarker = null;
  let destinationMarker = null;
  let routeLine = null;
  let currentZoom = 13;
  
  // Create custom icons
  function createUserIcon() {
    return L.divIcon({
      className: '',
      html: '<div class="user-marker"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  }
  
  function createDestinationIcon() {
    return L.divIcon({
      className: '',
      html: '<div class="destination-marker"></div>',
      iconSize: [25, 25],
      iconAnchor: [12.5, 12.5]
    });
  }
  
  // Initialize map
  function initMap(lat = 0, lon = 0, zoom = 13) {
    // Create map
    map = L.map('map', { 
      zoomControl: false,
      attributionControl: false
    }).setView([lat, lon], zoom);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);
    
    // Add zoom control to top right
    L.control.zoom({
      position: 'topright'
    }).addTo(map);
    
    // Add event listeners
    map.on('zoomend', function() {
      currentZoom = map.getZoom();
      sendToReactNative({
        type: 'zoomChanged',
        zoom: currentZoom
      });
    });
    
    // Notify React Native that map is ready
    setTimeout(() => {
      sendToReactNative({
        type: 'mapReady'
      });
    }, 500);
  }
  
  // Update or create user marker
  function updateUserMarker(lat, lon) {
    if (userMarker) {
      userMarker.setLatLng([lat, lon]);
    } else {
      userMarker = L.marker([lat, lon], {
        icon: createUserIcon(),
        zIndexOffset: 1000
      }).addTo(map);
    }
  }
  
  // Update or create destination marker
  function updateDestinationMarker(lat, lon) {
    if (destinationMarker) {
      destinationMarker.setLatLng([lat, lon]);
    } else {
      destinationMarker = L.marker([lat, lon], {
        icon: createDestinationIcon(),
        zIndexOffset: 900
      }).addTo(map);
    }
  }
  
  // Update or create route line
  function updateRouteLine(coordinates) {
    if (routeLine) {
      map.removeLayer(routeLine);
    }
    
    if (coordinates && coordinates.length > 0) {
      routeLine = L.polyline(
        coordinates.map(coord => [coord[1], coord[0]]), 
        {
          color: '#3b82f6',
          weight: 5,
          opacity: 0.7,
          lineJoin: 'round'
        }
      ).addTo(map);
    }
  }
  
  // Center map on location
  function centerMap(lat, lon, zoom) {
    if (map) {
      map.setView([lat, lon], zoom || currentZoom);
    }
  }
  
  // Fit map to route bounds
  function fitToRoute() {
    if (routeLine) {
      map.fitBounds(routeLine.getBounds(), { 
        padding: [50, 50],
        maxZoom: 16
      });
    }
  }
  
  // Send data to React Native
  function sendToReactNative(data) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(data));
    }
  }
  
  // Initialize map
  initMap();
  
  // Handle messages from React Native
  window.document.addEventListener('message', function(event) {
    try {
      const data = JSON.parse(event.data);
      
      switch(data.type) {
        case 'init':
          // Initialize with all data
          if (data.start) {
            updateUserMarker(data.start.lat, data.start.lon);
            centerMap(data.start.lat, data.start.lon, data.zoom);
          }
          
          if (data.end) {
            updateDestinationMarker(data.end.lat, data.end.lon);
          }
          
          if (data.route) {
            updateRouteLine(data.route);
            fitToRoute();
          }
          break;
          
        case 'updateUserLocation':
          // Update user location without changing zoom
          if (data.start) {
            updateUserMarker(data.start.lat, data.start.lon);
            
            // Keep route if it exists
            if (data.route) {
              updateRouteLine(data.route);
            }
          }
          break;
          
        case 'centerOnUser':
          // Center on user with specific zoom
          if (data.start) {
            updateUserMarker(data.start.lat, data.start.lon);
            centerMap(data.start.lat, data.start.lon, data.zoom);
            
            // Keep route if it exists
            if (data.route) {
              updateRouteLine(data.route);
            }
          }
          break;
          
        case 'showRoute':
          // Show route between points
          if (data.start && data.end && data.route) {
            updateUserMarker(data.start.lat, data.start.lon);
            updateDestinationMarker(data.end.lat, data.end.lon);
            updateRouteLine(data.route);
            fitToRoute();
          }
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });
</script>
</body>
</html>
`;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  searchContainer: {
    position: 'absolute',
    bottom: 30,
    left: 10,
    right: 10,
    flexDirection: 'row',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 10,
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  suggestionsList: {
    position: 'absolute',
    bottom: 100,
    left: 10,
    right: 10,
    backgroundColor: '#fff',
    maxHeight: 150,
    zIndex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    elevation: 5,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 140,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  myLocationIcon: {
    fontSize: 22,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  }
});

export default MapScreen;
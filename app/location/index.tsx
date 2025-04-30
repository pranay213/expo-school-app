import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    Keyboard
} from 'react-native';
import * as Location from 'expo-location';
import { Feather } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

// Type definitions
interface Coordinates {
    latitude: number;
    longitude: number;
}

interface RouteData {
    distance: number; // in meters
    duration: number; // in seconds
    geometry: {
        coordinates: [number, number][]; // [longitude, latitude] pairs
        type: string;
    };
}

interface SearchResult {
    id: string;
    place_name: string;
    center: [number, number]; // [longitude, latitude]
}

const LocationAndRouteMap: React.FC = () => {
    // State for locations
    const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
    const [destinationLocation, setDestinationLocation] = useState<Coordinates | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showResults, setShowResults] = useState(false);

    // State for route
    const [routeData, setRouteData] = useState<RouteData | null>(null);
    const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number, longitude: number }[]>([]);
    const [distance, setDistance] = useState<string>('');

    // State for UI
    const [loading, setLoading] = useState(false);

    // Refs
    const mapRef = useRef<MapView | null>(null);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    // Get location permissions and user's current location
    useEffect(() => {
        const requestLocationPermission = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();

                if (status === 'granted') {
                    getCurrentLocation();
                } else {
                    Alert.alert(
                        'Location Permission Required',
                        'Please enable location permissions to use this feature.',
                        [{ text: 'OK' }]
                    );
                }
            } catch (error) {
                console.error('Error requesting location permission:', error);
            }
        };

        requestLocationPermission();
    }, []);

    // Get current location method
    const getCurrentLocation = async () => {
        setLoading(true);

        try {
            const position = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High
            });

            const { latitude, longitude } = position.coords;
            setUserLocation({ latitude, longitude });

            // Move camera to user location
            if (mapRef.current && !destinationLocation) {
                mapRef.current.animateToRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01
                }, 1000);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error getting current location:', error);
            setLoading(false);
            Alert.alert('Error', 'Unable to get your current location.');
        }
    };

    // Search for locations
    const searchLocation = async (query: string) => {
        if (query.trim().length < 3) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        try {
            // Clear any pending search
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }

            // Debounce search to avoid too many API calls
            searchTimeout.current = setTimeout(async () => {
                setLoading(true);

                // Use a geocoding API (OpenStreetMap Nominatim or Mapbox API)
                // Replace with your preferred geocoding service
                const response = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=YOUR_MAPBOX_TOKEN&limit=5`
                );

                if (!response.ok) {
                    throw new Error('Geocoding API error');
                }

                const data = await response.json();
                setSearchResults(data.features || []);
                setShowResults(true);
                setLoading(false);
            }, 500);
        } catch (error) {
            console.error('Error searching for location:', error);
            setLoading(false);
            Alert.alert('Error', 'Failed to search for the location.');
        }
    };

    // Handle search result selection
    const handleSelectLocation = (result: SearchResult) => {
        const [longitude, latitude] = result.center;
        setDestinationLocation({ latitude, longitude });
        setSearchQuery(result.place_name);
        setShowResults(false);
        Keyboard.dismiss();

        // If we have both locations, calculate route
        if (userLocation) {
            fetchRouteData(userLocation, { latitude, longitude });

            // Fit map to show both points
            fitMapToPoints(userLocation, { latitude, longitude });
        }
    };

    // Fetch route data between two points
    const fetchRouteData = async (start: Coordinates, end: Coordinates) => {
        try {
            setLoading(true);

            // Using OSRM API for routing
            // Replace with your preferred routing API
            const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`
            );

            if (!response.ok) {
                throw new Error('Routing API error');
            }

            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                setRouteData(route);

                // Convert route coordinates from [lng, lat] to {latitude, longitude}
                const formattedCoordinates = route.geometry.coordinates.map(
                    ([longitude, latitude]) => ({ latitude, longitude })
                );

                setRouteCoordinates(formattedCoordinates);

                // Calculate distance in km with 1 decimal place
                const distanceInKm = (route.distance / 1000).toFixed(1);
                setDistance(`${distanceInKm} km`);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching route:', error);
            setLoading(false);
            Alert.alert('Error', 'Failed to fetch the route between locations.');
        }
    };

    // Fit map to show both points and route
    const fitMapToPoints = (start: Coordinates, end: Coordinates) => {
        if (mapRef.current) {
            // Calculate the bounding coordinates
            const minLat = Math.min(start.latitude, end.latitude);
            const maxLat = Math.max(start.latitude, end.latitude);
            const minLng = Math.min(start.longitude, end.longitude);
            const maxLng = Math.max(start.longitude, end.longitude);

            // Add some padding
            const PADDING = 0.1;
            const latDelta = (maxLat - minLat) + PADDING;
            const lngDelta = (maxLng - minLng) + PADDING;

            // Calculate the center point
            const centerLat = (minLat + maxLat) / 2;
            const centerLng = (minLng + maxLng) / 2;

            // Animate to the region
            mapRef.current.animateToRegion({
                latitude: centerLat,
                longitude: centerLng,
                latitudeDelta: Math.max(latDelta, 0.01),
                longitudeDelta: Math.max(lngDelta, 0.01)
            }, 1000);
        }
    };

    // Clear the route and destination
    const clearRoute = () => {
        setDestinationLocation(null);
        setRouteData(null);
        setRouteCoordinates([]);
        setDistance('');
        setSearchQuery('');

        // Center map on user location
        if (userLocation && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
            }, 1000);
        }
    };

    // The final TSX component
    return (
        <View style={styles.container}>
            {/* React Native Maps View (instead of MapLibre) */}
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE} // Use Google Maps
                initialRegion={{
                    latitude: 40.7128,  // Default to NYC
                    longitude: -74.006,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                showsUserLocation={false} // We'll handle user location ourselves
                showsMyLocationButton={false}
                zoomEnabled={true}
                zoomControlEnabled={true}
            >
                {/* User Location Marker */}
                {userLocation && (
                    <Marker
                        coordinate={{
                            latitude: userLocation.latitude,
                            longitude: userLocation.longitude
                        }}
                    >
                        <View style={styles.userMarker}>
                            <View style={styles.userMarkerCore} />
                        </View>
                    </Marker>
                )}

                {/* Destination Location Marker */}
                {destinationLocation && (
                    <Marker
                        coordinate={{
                            latitude: destinationLocation.latitude,
                            longitude: destinationLocation.longitude
                        }}
                        pinColor="red"
                    >
                        <View style={styles.destinationMarker} />
                    </Marker>
                )}

                {/* Route Line */}
                {routeCoordinates.length > 0 && (
                    <Polyline
                        coordinates={routeCoordinates}
                        strokeWidth={4}
                        strokeColor="#3b82f6"
                    />
                )}
            </MapView>

            {/* Search and Location UI */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for a destination..."
                        value={searchQuery}
                        onChangeText={(text) => {
                            setSearchQuery(text);
                            searchLocation(text);
                        }}
                        onFocus={() => setShowResults(true)}
                    />
                    {searchQuery ? (
                        <TouchableOpacity style={styles.clearButton} onPress={() => {
                            setSearchQuery('');
                            setSearchResults([]);
                            setShowResults(false);
                        }}>
                            <Feather name="x" size={20} color="#666" />
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* Search Results */}
                {showResults && searchResults.length > 0 && (
                    <ScrollView style={styles.resultsContainer}>
                        {searchResults.map((result) => (
                            <TouchableOpacity
                                key={result.id}
                                style={styles.resultItem}
                                onPress={() => handleSelectLocation(result)}
                            >
                                <Feather name="map-pin" size={16} color="#666" style={styles.resultIcon} />
                                <Text style={styles.resultText} numberOfLines={2}>
                                    {result.place_name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            {/* Route Info Panel */}
            {distance ? (
                <View style={styles.routeInfoPanel}>
                    <Text style={styles.distanceText}>Distance: {distance}</Text>
                    <TouchableOpacity style={styles.clearRouteButton} onPress={clearRoute}>
                        <Text style={styles.clearRouteButtonText}>Clear Route</Text>
                    </TouchableOpacity>
                </View>
            ) : null}

            {/* My Location Button */}
            <TouchableOpacity style={styles.myLocationButton} onPress={getCurrentLocation}>
                <Feather name="crosshair" size={24} color="#0066cc" />
            </TouchableOpacity>

            {/* Loading Indicator */}
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0066cc" />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    map: {
        flex: 1,
    },
    searchContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 30,
        left: 20,
        right: 20,
        zIndex: 10,
    },
    searchBar: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: Platform.OS === 'ios' ? 12 : 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    clearButton: {
        padding: 5,
    },
    resultsContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        marginTop: 5,
        maxHeight: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    resultIcon: {
        marginRight: 10,
    },
    resultText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    routeInfoPanel: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    distanceText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    clearRouteButton: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
    },
    clearRouteButtonText: {
        color: '#666',
        fontWeight: '500',
    },
    myLocationButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 50,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    userMarker: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(0, 102, 204, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userMarkerCore: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#0066cc',
    },
    destinationMarker: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#e53935',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
});

export default LocationAndRouteMap;
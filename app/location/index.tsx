import { View, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Text, Animated, Easing } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import React, { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { throttle } from 'lodash'

interface LocationProps {
    latitude: number | null;
    longitude: number | null;
}

export default function LocationScreen() {
    const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
    const [destination, setDestination] = useState<string>(''); // Destination for search
    const [directions, setDirections] = useState<any>(null); // To store directions data
    const [loading, setLoading] = useState<boolean>(false); // Loading state
    const [error, setError] = useState<string | null>(null); // Error state
    const mapRef = useRef<MapView | null>(null); // Set MapView ref to possibly be null
    const [speed, setSpeed] = useState<number>(0); // Spe

    const [animatedSpeed] = useState(new Animated.Value(0)); // Animated value for smooth transition

    const throttledSetSpeed = throttle((newSpeed: number) => {
        // Update speed with throttling
        setSpeed(newSpeed);
    }, 500); // Update speed every 500ms (throttle)



    const OSM_API_KEY = 'uYnTROaxqfZ60YWqV1fEfPN1e9epDSv2LP-eWR0TVvM'; // Replace with your OpenRouteService API key

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission to access location was denied');
                return;
            }

            const locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    distanceInterval: 1, // Trigger update every 1 meter
                    timeInterval: 1000, // Update every 1 second
                },
                (location: any) => {
                    setLocation(location.coords);
                    setSpeed(location.coords.speed); // Speed in m/s

                    // Animate the map to the new location
                    if (mapRef.current) {
                        mapRef.current.animateToRegion({
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }, 500); // 500ms for smooth animation
                    }
                }
            );

            return () => {
                locationSubscription.remove(); // Clean up the subscription when component unmounts
            };
        })();
    }, []);

    // Smooth animation for speed change
    useEffect(() => {
        Animated.timing(animatedSpeed, {
            toValue: speed * 3.6, // Convert speed to km/h
            duration: 500, // Duration for smooth transition
            useNativeDriver: false,
            easing: Easing.ease, // Apply easing for smooth animation
        }).start();
    }, [speed]);


    const moveToMyLocation = async () => {
        if (!location || !mapRef.current) return;

        mapRef.current.animateToRegion({
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        });
    };

    const handleSearch = async () => {
        if (!destination || !location) return;

        setLoading(true);
        setError(null);

        try {
            // Step 1: Geocode the destination using Nominatim
            const geocodeResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
                params: {
                    q: destination,
                    format: 'json',
                },
                headers: {
                    'User-Agent': 'YourAppName/1.0',
                },
            });

            const destinationLocation = geocodeResponse.data[0];
            if (!destinationLocation) {
                setError('Destination not found');
                setLoading(false);
                return;
            }

            const lat = parseFloat(destinationLocation.lat);
            const lon = parseFloat(destinationLocation.lon);

            // Step 2: Fetch directions using OpenRouteService
            const orsUrl = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';

            const orsResponse = await axios.post(orsUrl, {
                coordinates: [
                    [location.longitude, location.latitude], // start
                    [lon, lat], // end
                ],
            }, {
                headers: {
                    Authorization: '5b3ce3597851110001cf62484ab00e7830644091a4213d0a3b56008c', // 🔥 Replace with your ORS API key
                    'Content-Type': 'application/json',
                },
            });

            const routeData = orsResponse.data.features[0];

            setDirections(routeData);
            setLoading(false);

            // Focus map on route
            mapRef.current?.fitToCoordinates(
                routeData.geometry.coordinates.map(([lon, lat]) => ({
                    latitude: lat,
                    longitude: lon,
                })),
                {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true,
                }
            );

        } catch (error) {
            console.error(error);
            setLoading(false);
            setError('Failed to fetch route');
        }
    };

    if (!location) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} title="You are here" />

                {/* Show destination marker */}
                {directions && (
                    <Marker
                        coordinate={{
                            latitude: directions.geometry.coordinates[directions.geometry.coordinates.length - 1][1],
                            longitude: directions.geometry.coordinates[directions.geometry.coordinates.length - 1][0],
                        }}
                        title="Destination"
                    />
                )}

                {/* Show the route */}
                {directions && (
                    <Polyline
                        coordinates={directions.geometry.coordinates.map(([lon, lat]) => ({
                            latitude: lat,
                            longitude: lon,
                        }))}
                        strokeColor="#0000FF"
                        strokeWidth={4}
                    />
                )}
            </MapView>

            {/* Search Input */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Enter destination"
                    value={destination}
                    onChangeText={setDestination}
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Text style={styles.searchButtonText}>Search</Text>
                </TouchableOpacity>
            </View>

            {/* My Location Button */}
            <TouchableOpacity style={styles.myLocationButton} onPress={moveToMyLocation}>
                <Ionicons name="locate" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.speedContainer}>
                <Text style={styles.speedText}>
                    Speed: {speed ? (speed * 3.6).toFixed(2) : '0'} km/h
                </Text>
            </View>


            {/* Loading Indicator */}
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            )}

            {/* Error Handling */}
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    searchContainer: {
        position: 'absolute',
        top: 40,
        left: 20,
        right: 20,
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 30,
        paddingHorizontal: 10,
        elevation: 5,
    },
    searchInput: {
        flex: 1,
        height: 40,
    },
    searchButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 30,
    },
    searchButtonText: {
        color: 'white',
    },
    myLocationButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#007bff',
        padding: 12,
        borderRadius: 30,
        elevation: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
    },
    errorText: {
        color: 'white',
    },
    speedContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 20,
        elevation: 5,
    },
    speedText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

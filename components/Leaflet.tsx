// App.js or MapScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    Alert,
    ActivityIndicator,
    Platform,
    PermissionsAndroid,
    Animated,
} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';

// Set your Mapbox access token
Mapbox.setAccessToken('YOUR_MAPBOX_ACCESS_TOKEN');

const MapScreen = () => {
    const [route, setRoute] = useState(null);
    const [loading, setLoading] = useState(false);
    const [startPoint, setStartPoint] = useState(null);
    const [endPoint, setEndPoint] = useState(null);
    const mapRef = useRef(null);
    const [is3DMode, setIs3DMode] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [isLocationEnabled, setIsLocationEnabled] = useState(false);
    const [compassHeading, setCompassHeading] = useState(0);
    const [locationWatcher, setLocationWatcher] = useState(null);

    const blinkAnimation = useRef(new Animated.Value(1)).current;
    const rotateAnimation = useRef(new Animated.Value(0)).current;

    // Custom style JSON for your tile server
    const customStyle = {
        version: 8,
        sources: {
            'kodam-tiles': {
                type: 'raster',
                tiles: ['https://maps.kodam.in/styles/osm-bright/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 18,
            },
        },
        layers: [
            {
                id: 'kodam-layer',
                type: 'raster',
                source: 'kodam-tiles',
                minzoom: 0,
                maxzoom: 22,
            },
        ],
    };

    // Location and sensor effects
    useEffect(() => {
        // Start blinking animation for location dot
        if (isLocationEnabled) {
            const blinkLoop = Animated.loop(
                Animated.sequence([
                    Animated.timing(blinkAnimation, {
                        toValue: 0.3,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(blinkAnimation, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    })
                ])
            );
            blinkLoop.start();

            return () => blinkLoop.stop();
        }
    }, [isLocationEnabled]);

    // Magnetometer sensor setup (removed DeviceMotion to avoid compatibility issues)
    useEffect(() => {
        let magnetometerSubscription = null;

        if (isLocationEnabled) {
            const initializeMagnetometer = async () => {
                try {
                    // Check if magnetometer is available
                    const isAvailable = await Magnetometer.isAvailableAsync();
                    if (isAvailable) {
                        Magnetometer.setUpdateInterval(500); // Increased interval for better performance
                        magnetometerSubscription = Magnetometer.addListener((data) => {
                            const { x, y } = data;
                            // Calculate heading from magnetometer data
                            let angle = Math.atan2(y, x) * (180 / Math.PI);
                            // Normalize to 0-360 degrees
                            const heading = (angle + 360) % 360;
                            setCompassHeading(heading);

                            // Smooth compass rotation animation
                            Animated.timing(rotateAnimation, {
                                toValue: heading,
                                duration: 500,
                                useNativeDriver: true,
                            }).start();
                        });
                    } else {
                        console.warn('Magnetometer not available on this device');
                    }
                } catch (error) {
                    console.warn('Magnetometer initialization error:', error);
                }
            };

            initializeMagnetometer();
        }

        return () => {
            if (magnetometerSubscription) {
                magnetometerSubscription.remove();
            }
        };
    }, [isLocationEnabled, rotateAnimation]);

    // Cleanup location watcher on unmount
    useEffect(() => {
        return () => {
            if (locationWatcher) {
                locationWatcher.remove();
            }
        };
    }, [locationWatcher]);

    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Permission',
                        message: 'This app needs access to your location to show your position on the map.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        } else {
            // For iOS, use expo-location
            const { status } = await Location.requestForegroundPermissionsAsync();
            return status === 'granted';
        }
    };

    const getCurrentLocation = async () => {
        try {
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
                timeout: 10000,
                maximumAge: 5000,
            });

            const { latitude, longitude } = location.coords;
            setUserLocation([longitude, latitude]);

            // Center map on user location
            if (mapRef.current) {
                mapRef.current.setCamera({
                    centerCoordinate: [longitude, latitude],
                    zoomLevel: is3DMode ? 8 : 15,
                    animationDuration: 1500,
                });
            }
        } catch (error) {
            console.error('Location error:', error);
            Alert.alert(
                'Location Error',
                'Unable to get your current location. Please check your GPS settings.',
                [{ text: 'OK' }]
            );
        }
    };

    const toggleMyLocation = async () => {
        if (!isLocationEnabled) {
            const hasPermission = await requestLocationPermission();
            if (hasPermission) {
                setIsLocationEnabled(true);
                await getCurrentLocation();

                // Start watching position with improved settings
                try {
                    const watcher = await Location.watchPositionAsync(
                        {
                            accuracy: Location.Accuracy.High,
                            timeInterval: 3000, // Update every 3 seconds
                            distanceInterval: 5, // Update every 5 meters
                        },
                        (location) => {
                            const { latitude, longitude } = location.coords;
                            setUserLocation([longitude, latitude]);
                        }
                    );
                    setLocationWatcher(watcher);
                } catch (error) {
                    console.error('Watch location error:', error);
                }
            } else {
                Alert.alert(
                    'Permission Denied',
                    'Location permission is required to show your position on the map.',
                    [{ text: 'OK' }]
                );
            }
        } else {
            setIsLocationEnabled(false);
            setUserLocation(null);

            // Stop watching location
            if (locationWatcher) {
                locationWatcher.remove();
                setLocationWatcher(null);
            }
        }
    };

    // Function to get route from your direction API
    const getRoute = async (start, end) => {
        try {
            setLoading(true);
            const coordinates = `${start[0]},${start[1]};${end[0]},${end[1]}`;

            // Using OSRM format - adjust based on your API
            const response = await fetch(
                `https://routes.kodam.in/route/v1/driving/${coordinates}?geometries=geojson&overview=full`,
                {
                    timeout: 10000, // 10 second timeout
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const routeGeoJSON = {
                    type: 'Feature',
                    geometry: data.routes[0].geometry,
                    properties: {
                        duration: data.routes[0].duration,
                        distance: data.routes[0].distance,
                    },
                };

                setRoute(routeGeoJSON);

                // Show route info
                const duration = Math.round(data.routes[0].duration / 60);
                const distance = (data.routes[0].distance / 1000).toFixed(2);
                Alert.alert(
                    'Route Found',
                    `Distance: ${distance} km\nDuration: ${duration} minutes`
                );

                // Fit route bounds
                if (mapRef.current && routeGeoJSON.geometry.coordinates) {
                    const coordinates = routeGeoJSON.geometry.coordinates;
                    if (coordinates.length > 0) {
                        mapRef.current.fitBounds(
                            [coordinates[0], coordinates[coordinates.length - 1]],
                            [50, 50, 50, 50], // padding
                            1500 // animation duration
                        );
                    }
                }
            } else {
                Alert.alert('No Route', 'No route found between the selected points');
            }
        } catch (error) {
            console.error('Error getting route:', error);
            Alert.alert('Error', 'Failed to get route. Please check your internet connection.');
        } finally {
            setLoading(false);
        }
    };

    const switch2D = () => {
        setIs3DMode(false);
        if (mapRef.current) {
            mapRef.current.setCamera({
                pitch: 0,
                zoomLevel: 10,
                animationDuration: 1500,
            });
        }
    };

    const switch3D = () => {
        setIs3DMode(true);
        if (mapRef.current) {
            mapRef.current.setCamera({
                pitch: 45,
                zoomLevel: 2,
                animationDuration: 1500,
            });
        }
    };

    // Add point selection on map press
    const onMapPress = (feature) => {
        const coordinates = feature.geometry.coordinates;

        if (!startPoint) {
            setStartPoint(coordinates);
            Alert.alert('Start Point Set', 'Tap another location to set the destination');
        } else if (!endPoint) {
            setEndPoint(coordinates);
            // Automatically get route when both points are set
            getRoute(startPoint, coordinates);
        } else {
            // Reset and set new start point
            setStartPoint(coordinates);
            setEndPoint(null);
            setRoute(null);
            Alert.alert('Start Point Reset', 'Tap another location to set the destination');
        }
    };

    const clearRoute = () => {
        setStartPoint(null);
        setEndPoint(null);
        setRoute(null);
    };

    return (
        <View style={styles.container}>
            {/* Loading Indicator */}
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3887be" />
                    <Text style={styles.loadingText}>Getting route...</Text>
                </View>
            )}

            {/* 2D/3D Toggle Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.toggleButton, !is3DMode && styles.activeButton]}
                    onPress={switch2D}
                >
                    <Text style={[styles.buttonText, !is3DMode && styles.activeButtonText]}>2D</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleButton, is3DMode && styles.activeButton]}
                    onPress={switch3D}
                >
                    <Text style={[styles.buttonText, is3DMode && styles.activeButtonText]}>3D</Text>
                </TouchableOpacity>
            </View>

            {/* My Location Button */}
            <TouchableOpacity
                style={styles.locationButton}
                onPress={toggleMyLocation}
            >
                <View style={[styles.locationIcon, isLocationEnabled && styles.locationIconActive]}>
                    <Text style={styles.locationIconText}>📍</Text>
                </View>
            </TouchableOpacity>

            {/* Clear Route Button */}
            {route && (
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={clearRoute}
                >
                    <Text style={styles.clearButtonText}>Clear Route</Text>
                </TouchableOpacity>
            )}

            <Mapbox.MapView
                ref={mapRef}
                style={styles.map}
                styleJSON={JSON.stringify(customStyle)}
                projection={is3DMode ? "globe" : "mercator"}
                compassEnabled={true}
                rotateEnabled={true}
                pitchEnabled={is3DMode}
                scrollEnabled={true}
                zoomEnabled={true}
                onPress={onMapPress}
            >
                <Mapbox.Camera
                    zoomLevel={is3DMode ? 2 : 10}
                    centerCoordinate={[82.547, 20.813]}
                    pitch={is3DMode ? 45 : 0}
                    heading={0}
                    minZoomLevel={is3DMode ? 0.5 : 1}
                    maxZoomLevel={18}
                    animationDuration={2000}
                />

                {/* Atmosphere/Sky Layer for globe effect - only in 3D mode */}
                {is3DMode && (
                    <Mapbox.SkyLayer
                        id="sky"
                        style={{
                            skyType: 'atmosphere',
                            skyAtmosphereSun: [0.0, 0.0],
                            skyAtmosphereSunIntensity: 15.0
                        }}
                    />
                )}

                {/* User Location Marker with Blinking Effect and Compass */}
                {userLocation && isLocationEnabled && (
                    <Mapbox.PointAnnotation
                        id="user-location"
                        coordinate={userLocation}
                    >
                        <Animated.View style={[
                            styles.userLocationContainer,
                            { opacity: blinkAnimation }
                        ]}>
                            {/* Pulsing Circle */}
                            <View style={styles.userLocationPulse} />

                            {/* Main Location Dot */}
                            <View style={styles.userLocationDot} />

                            {/* Compass Direction Indicator */}
                            <Animated.View
                                style={[
                                    styles.compassArrow,
                                    {
                                        transform: [{
                                            rotate: rotateAnimation.interpolate({
                                                inputRange: [0, 360],
                                                outputRange: ['0deg', '360deg']
                                            })
                                        }]
                                    }
                                ]}
                            >
                                <View style={styles.arrow} />
                            </Animated.View>
                        </Animated.View>
                    </Mapbox.PointAnnotation>
                )}

                {/* Start Point Marker */}
                {startPoint && (
                    <Mapbox.PointAnnotation
                        id="start-point"
                        coordinate={startPoint}
                    >
                        <View style={styles.startMarker}>
                            <Text style={styles.markerText}>S</Text>
                        </View>
                    </Mapbox.PointAnnotation>
                )}

                {/* End Point Marker */}
                {endPoint && (
                    <Mapbox.PointAnnotation
                        id="end-point"
                        coordinate={endPoint}
                    >
                        <View style={styles.endMarker}>
                            <Text style={styles.markerText}>E</Text>
                        </View>
                    </Mapbox.PointAnnotation>
                )}

                {/* Route Line */}
                {route && (
                    <Mapbox.ShapeSource id="route-source" shape={route}>
                        <Mapbox.LineLayer
                            id="route-layer"
                            style={{
                                lineColor: '#3887be',
                                lineWidth: 5,
                                lineOpacity: 0.84,
                                lineCap: 'round',
                                lineJoin: 'round',
                            }}
                        />
                    </Mapbox.ShapeSource>
                )}
            </Mapbox.MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    loadingContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -50 }, { translateY: -50 }],
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        zIndex: 2000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    buttonContainer: {
        position: 'absolute',
        top: 50,
        right: 20,
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 25,
        padding: 5,
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    toggleButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginHorizontal: 2,
    },
    activeButton: {
        backgroundColor: '#3887be',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    activeButtonText: {
        color: '#fff',
    },
    locationButton: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1000,
    },
    locationIcon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationIconActive: {
        backgroundColor: '#4CAF50',
    },
    locationIconText: {
        fontSize: 20,
    },
    clearButton: {
        position: 'absolute',
        bottom: 160,
        right: 20,
        backgroundColor: '#F44336',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1000,
    },
    clearButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    userLocationContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userLocationPulse: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(66, 165, 245, 0.3)',
        borderWidth: 2,
        borderColor: 'rgba(66, 165, 245, 0.5)',
    },
    userLocationDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#42A5F5',
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3,
    },
    compassArrow: {
        position: 'absolute',
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrow: {
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderBottomWidth: 20,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#FF5722',
        marginTop: -25,
    },
    startMarker: {
        backgroundColor: '#4CAF50',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    endMarker: {
        backgroundColor: '#F44336',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    markerText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MapScreen;
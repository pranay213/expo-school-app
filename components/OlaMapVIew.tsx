import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Button, requireNativeComponent, Platform } from 'react-native';
import OlaMap from './NativeModuleWrapper';

// Import the native OlaMapView component
const NativeOlaMapView = requireNativeComponent('OlaMapView');

const OlaMapView = ({ apiKey }) => {
    const [error, setError] = useState(null);

    if (Platform.OS !== 'android') {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>OlaMapSdk is only available on Android</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Ola Map SDK</Text>

            {error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.mapContainer}>
                <NativeOlaMapView
                    style={styles.map}
                    apiKey={apiKey}
                    centerCoordinate="12.9716,77.5946" // Default: Bangalore
                    zoomLevel={15}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    mapContainer: {
        width: '100%',
        height: 400,
        marginVertical: 20,
        borderRadius: 8,
        overflow: 'hidden',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    error: {
        color: 'red',
        marginVertical: 10,
        textAlign: 'center',
    },
});

export default OlaMapView;

export default OlaMapView;
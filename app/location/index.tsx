import MapView, { UrlTile, Marker } from 'react-native-maps';
import React from 'react';
import { View, StyleSheet } from 'react-native';

const MAP_TILER_API_KEY = 'n50VzlfBnZLRmz1HxFR5';
export default function MapScreen() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.7749,
          longitude: -122.4194,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        <UrlTile
          urlTemplate={`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAP_TILER_API_KEY}`}
          maximumZ={19}
          flipY={false}
        />
        <Marker
          coordinate={{ latitude: 37.7749, longitude: -122.4194 }}
          title="San Francisco"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    flex: 1
  }
});

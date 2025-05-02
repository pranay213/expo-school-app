import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Platform } from 'react-native';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';

export default function App() {
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let loc = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 1 },
                (pos) => {
                    setLocation({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                    });
                }
            );
        })();
    }, []);

    const generateHTML = (lat: number, lon: number) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link href="https://unpkg.com/maplibre-gl@3.4.0/dist/maplibre-gl.css" rel="stylesheet" />
      <script src="https://unpkg.com/maplibre-gl@3.4.0/dist/maplibre-gl.js"></script>
      <script src="https://unpkg.com/@turf/turf@6.5.0/turf.min.js"></script>
      <style>
        html, body, #map { height: 100%; margin: 0; }
        #search {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 10;
          width: 80%;
          font-size: 16px;
          padding: 8px;
        }
        #distance {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: white;
          padding: 6px;
          font-size: 16px;
          z-index: 10;
        }
      </style>
    </head>
    <body>
      <input id="search" type="text" placeholder="Search place..." />
      <div id="map"></div>
      <div id="distance"></div>
      <script>
        let userCoords = [${lon}, ${lat}];

        const map = new maplibregl.Map({
          container: 'map',
          style: 'https://maps.kodam.in/styles/klokantech-basic/style.json',
          center: userCoords,
          zoom: 14
        });

        new maplibregl.Marker({ color: '#FF5733' }).setLngLat(userCoords).addTo(map);
        map.addControl(new maplibregl.NavigationControl());

        document.getElementById('search').addEventListener('keydown', async (e) => {
          if (e.key === 'Enter') {
            const query = e.target.value;
            const response = await fetch(\`https://nominatim.openstreetmap.org/search?q=\${query}&format=json&limit=1\`);
            const result = await response.json();

            if (result.length === 0) {
              alert("Place not found");
              return;
            }

            const dest = [parseFloat(result[0].lon), parseFloat(result[0].lat)];

            new maplibregl.Marker({ color: 'green' }).setLngLat(dest).addTo(map);

            map.flyTo({ center: dest });

            const osrmUrl = \`https://routes.kodam.in/route/v1/driving/\${userCoords[0]},\${userCoords[1]};\${dest[0]},\${dest[1]}?overview=full&geometries=geojson\`;

            const routeRes = await fetch(osrmUrl);
            const routeData = await routeRes.json();
            const routeGeo = routeData.routes[0].geometry;

            if (map.getSource('route')) map.removeLayer('route'), map.removeSource('route');

            map.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: routeGeo
              }
            });

            map.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              paint: {
                'line-color': '#0074D9',
                'line-width': 4
              }
            });

            const distance = turf.distance(
              turf.point(userCoords),
              turf.point(dest),
              { units: 'kilometers' }
            );

            document.getElementById('distance').innerText = \`Distance: \${distance.toFixed(2)} km\`;
          }
        });
      </script>
    </body>
    </html>
  `;

    if (errorMsg) {
        return <View style={styles.center}><Text>{errorMsg}</Text></View>;
    }

    if (!location) {
        return <View style={styles.center}><ActivityIndicator size="large" /></View>;
    }

    return (
        <WebView
            originWhitelist={['*']}
            source={{ html: generateHTML(location.latitude, location.longitude) }}
            style={{ flex: 1 }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scalesPageToFit={Platform.OS === 'android'}
        />
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

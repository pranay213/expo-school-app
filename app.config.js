import 'dotenv/config';

export default {
  expo: {
    name: "school-app-tracking",
    slug: "school-app-tracking",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.pranay.schoolapptracking",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: 'com.pranay.schoolapptracking',
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      [
        "@rnmapbox/maps",
        {
          "RNMapboxMapsVersion": "10.16.2",
          "RNMapboxMapsDownloadToken": "n50VzlfBnZLRmz1HxFR5"
        }
      ],
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "Show current location on map."
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: 'a805a44e-9c80-402a-8edb-e7201d3c81ad',
      },
      API_URL: process.env.API_URL,
    },
  },
};
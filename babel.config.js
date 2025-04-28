module.exports = {
    presets: ['babel-preset-expo'],
    plugins: [
        [
            'module:react-native-dotenv', // Include the dotenv plugin
            {
                moduleName: 'react-native-dotenv', // Define module name
                path: '.env', // Define the path to your .env file
            },
        ],
    ],
};

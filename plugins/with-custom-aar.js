const { withProjectBuildGradle } = require('@expo/config-plugins');
const fs = require('fs');

module.exports = function withCustomAAR(config) {
    return withProjectBuildGradle(config, (config) => {
        const buildGradlePath = config.modResults.path;
        let contents = config.modResults.contents;

        // Add flatDir repositories
        if (!contents.includes("flatDir")) {
            contents = contents.replace(
                /allprojects\s*{[\s\S]*?repositories\s*{/,
                (match) => `${match}\n        flatDir {\n            dirs 'libs'\n        }`
            );
        }

        config.modResults.contents = contents;
        return config;
    });
};

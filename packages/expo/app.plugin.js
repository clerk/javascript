const { createRunOncePlugin } = require('@expo/config-plugins');

/**
 * Expo config plugin for @clerk/clerk-expo.
 *
 * This plugin is currently a no-op because the native Android module is
 * automatically linked via expo-module.config.json and Expo autolinking.
 *
 * The native Google Sign-In module is included in the android/ folder of
 * the package, and Expo autolinking automatically handles the Gradle
 * configuration needed to include it in Android builds.
 */
function withClerkGoogleSignIn(config) {
  // No-op: Expo autolinking handles the android module via expo-module.config.json
  return config;
}

module.exports = createRunOncePlugin(withClerkGoogleSignIn, '@clerk/clerk-expo', '1.0.0');

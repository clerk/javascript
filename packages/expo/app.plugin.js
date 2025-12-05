const { createRunOncePlugin, withInfoPlist } = require('@expo/config-plugins');

/**
 * Expo config plugin for @clerk/clerk-expo.
 *
 * This plugin configures the iOS URL scheme required for Google Sign-In.
 * The native Android module is automatically linked via expo-module.config.json.
 */
function withClerkGoogleSignIn(config) {
  // Get the iOS URL scheme from environment or config.extra
  // We capture it here before entering the mod callback
  const iosUrlScheme =
    process.env.EXPO_PUBLIC_CLERK_GOOGLE_IOS_URL_SCHEME || config.extra?.EXPO_PUBLIC_CLERK_GOOGLE_IOS_URL_SCHEME;

  if (!iosUrlScheme) {
    // No URL scheme configured, skip iOS configuration
    return config;
  }

  // Add iOS URL scheme for Google Sign-In
  config = withInfoPlist(config, modConfig => {
    if (!Array.isArray(modConfig.modResults.CFBundleURLTypes)) {
      modConfig.modResults.CFBundleURLTypes = [];
    }

    // Check if the scheme is already added to avoid duplicates
    const schemeExists = modConfig.modResults.CFBundleURLTypes.some(urlType =>
      urlType.CFBundleURLSchemes?.includes(iosUrlScheme),
    );

    if (!schemeExists) {
      // Add Google Sign-In URL scheme
      modConfig.modResults.CFBundleURLTypes.push({
        CFBundleURLSchemes: [iosUrlScheme],
      });
    }

    return modConfig;
  });

  return config;
}

module.exports = createRunOncePlugin(withClerkGoogleSignIn, '@clerk/clerk-expo', '1.0.0');

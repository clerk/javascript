import { type ConfigPlugin, createRunOncePlugin, withInfoPlist } from '@expo/config-plugins';

const pkg = require('../../package.json');

/**
 * Expo config plugin for @clerk/expo.
 *
 * This plugin configures the iOS URL scheme required for Google Sign-In.
 * The native Android module is automatically linked via expo-module.config.json.
 */
const withClerkGoogleSignIn: ConfigPlugin = config => {
  // Get the iOS URL scheme from environment or config.extra
  // We capture it here before entering the mod callback
  const iosUrlScheme =
    process.env.EXPO_PUBLIC_CLERK_GOOGLE_IOS_URL_SCHEME ||
    (config as { extra?: Record<string, string> }).extra?.EXPO_PUBLIC_CLERK_GOOGLE_IOS_URL_SCHEME;

  if (!iosUrlScheme) {
    // No URL scheme configured, skip iOS configuration
    return config;
  }

  // Add iOS URL scheme for Google Sign-In
  return withInfoPlist(config, modConfig => {
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
};

export default createRunOncePlugin(withClerkGoogleSignIn, pkg.name, pkg.version);

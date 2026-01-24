import { type ConfigPlugin, createRunOncePlugin, withInfoPlist, withAppBuildGradle } from '@expo/config-plugins';

import pkg from '../../package.json';

/**
 * Add packaging exclusions to Android app build.gradle to resolve
 * duplicate META-INF file conflicts from clerk-android dependencies.
 */
const withClerkAndroidPackaging: ConfigPlugin = config => {
  return withAppBuildGradle(config, modConfig => {
    let buildGradle = modConfig.modResults.contents;

    // Check if exclusion already exists
    if (buildGradle.includes('META-INF/versions/9/OSGI-INF/MANIFEST.MF')) {
      console.log('✅ Clerk Android packaging exclusions already configured');
      return modConfig;
    }

    // Find the existing packagingOptions block and add resources.excludes
    const packagingOptionsMatch = buildGradle.match(/packagingOptions\s*\{/);
    if (packagingOptionsMatch) {
      // Add resources block inside packagingOptions
      const resourcesExclude = `packagingOptions {
        // Clerk Android SDK: exclude duplicate META-INF files
        resources {
            excludes += ['META-INF/versions/9/OSGI-INF/MANIFEST.MF']
        }`;

      buildGradle = buildGradle.replace(/packagingOptions\s*\{/, resourcesExclude);
      modConfig.modResults.contents = buildGradle;
      console.log('✅ Clerk Android packaging exclusions added');
    } else {
      console.warn('⚠️ Could not find packagingOptions block in build.gradle');
    }

    return modConfig;
  });
};

/**
 * Expo config plugin for @clerk/expo.
 *
 * This plugin configures:
 * - iOS: URL scheme required for Google Sign-In
 * - Android: Packaging exclusions to resolve dependency conflicts
 *
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

/**
 * Combined plugin that applies all Clerk configurations
 */
const withClerkExpo: ConfigPlugin = config => {
  config = withClerkGoogleSignIn(config);
  config = withClerkAndroidPackaging(config);
  return config;
};

export default createRunOncePlugin(withClerkExpo, pkg.name, pkg.version);

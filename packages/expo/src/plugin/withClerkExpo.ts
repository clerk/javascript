import {
  type ConfigPlugin,
  createRunOncePlugin,
  withInfoPlist,
  withAppBuildGradle,
  withDangerousMod,
} from '@expo/config-plugins';
import * as fs from 'fs';
import * as path from 'path';

import pkg from '../../package.json';

/**
 * The native module configuration that gets enabled when the plugin is used.
 * This is written to expo-module.config.json to enable autolinking of native modules.
 */
const NATIVE_MODULE_CONFIG = {
  platforms: ['android', 'ios'],
  android: {
    modules: ['expo.modules.clerk.ClerkExpoModule', 'expo.modules.clerk.googlesignin.ClerkGoogleSignInModule'],
  },
  ios: {
    modules: ['ClerkExpoModule', 'ClerkGoogleSignInModule'],
  },
};

/**
 * Enable native modules by writing the full expo-module.config.json.
 *
 * By default, @clerk/expo ships with an empty config ({ "platforms": [] }) so that
 * users who don't need native features can use the package without native dependencies.
 *
 * When the plugin is configured, this function writes the real config to enable
 * autolinking of the native modules (ClerkExpoModule, ClerkGoogleSignInModule).
 */
const withClerkNativeModules: ConfigPlugin = config => {
  return withDangerousMod(config, [
    'ios',
    async modConfig => {
      try {
        // Find the @clerk/expo package directory
        const packageJsonPath = require.resolve('@clerk/expo/package.json');
        const packageDir = path.dirname(packageJsonPath);
        const configPath = path.join(packageDir, 'expo-module.config.json');

        // Write the config that enables native modules
        fs.writeFileSync(configPath, JSON.stringify(NATIVE_MODULE_CONFIG, null, 2) + '\n');

        console.log('✅ Clerk native modules enabled');
      } catch (error) {
        console.warn('⚠️ Could not enable Clerk native modules:', error);
      }

      return modConfig;
    },
  ]);
};

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
 * Combined plugin that applies all Clerk configurations.
 *
 * When this plugin is used, it:
 * 1. Enables native modules by writing the full expo-module.config.json
 * 2. Configures iOS URL scheme for Google Sign-In (if env var is set)
 * 3. Adds Android packaging exclusions to resolve dependency conflicts
 */
const withClerkExpo: ConfigPlugin = config => {
  // Enable native modules first (writes expo-module.config.json)
  config = withClerkNativeModules(config);
  config = withClerkGoogleSignIn(config);
  config = withClerkAndroidPackaging(config);
  return config;
};

export default createRunOncePlugin(withClerkExpo, pkg.name, pkg.version);

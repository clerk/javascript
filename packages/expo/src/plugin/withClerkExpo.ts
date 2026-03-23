import { type ConfigPlugin, createRunOncePlugin, withAppBuildGradle, withInfoPlist } from '@expo/config-plugins';

import pkg from '../../package.json';

/**
 * Add packaging exclusions to Android app build.gradle to resolve
 * duplicate META-INF file conflicts from clerk-android dependencies.
 */
const withClerkAndroidPackaging: ConfigPlugin = config => {
  return withAppBuildGradle(config, modConfig => {
    let buildGradle = modConfig.modResults.contents;

    // --- META-INF exclusion ---
    if (!buildGradle.includes('META-INF/versions/9/OSGI-INF/MANIFEST.MF')) {
      // AGP 8+ uses `packaging` DSL, older versions use `packagingOptions`
      const packagingMatch = buildGradle.match(/packaging\s*\{/) || buildGradle.match(/packagingOptions\s*\{/);
      if (packagingMatch) {
        const blockName = packagingMatch[0].trim().replace(/\s*\{$/, '');
        const resourcesExclude = `${blockName} {
        // Clerk Android SDK: exclude duplicate META-INF files
        resources {
            excludes += ['META-INF/versions/9/OSGI-INF/MANIFEST.MF']
        }`;

        buildGradle = buildGradle.replace(new RegExp(`${blockName}\\s*\\{`), resourcesExclude);
      } else {
        // No packaging block found; append one at the end of the android block
        const androidBlockEnd = buildGradle.lastIndexOf('}');
        if (androidBlockEnd !== -1) {
          const packagingBlock = `\n    packaging {\n        resources {\n            excludes += ['META-INF/versions/9/OSGI-INF/MANIFEST.MF']\n        }\n    }\n`;
          buildGradle = buildGradle.slice(0, androidBlockEnd) + packagingBlock + buildGradle.slice(androidBlockEnd);
        }
      }
    }

    modConfig.modResults.contents = buildGradle;
    return modConfig;
  });
};

/**
 * Configures iOS URL scheme for Google Sign-In.
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
 * 1. Configures iOS URL scheme for Google Sign-In (if env var is set)
 * 2. Adds Android packaging exclusions to resolve dependency conflicts
 *
 * Native modules are registered via react-native.config.js and standard
 * React Native autolinking (RCTViewManager / ReactPackage).
 */
const withClerkExpo: ConfigPlugin = config => {
  config = withClerkGoogleSignIn(config);
  config = withClerkAndroidPackaging(config);
  return config;
};

export default createRunOncePlugin(withClerkExpo, pkg.name, pkg.version);

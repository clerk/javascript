/**
 * Expo config plugin for @clerk/expo-native-components
 * Configures iOS and Android for the Clerk native SDKs (clerk-ios / clerk-android)
 *
 * When this plugin is used:
 * 1. iOS is configured with the required deployment target and metadata
 * 2. Android is configured with packaging exclusions for dependencies
 *
 * Native modules and views are registered via Expo Modules autolinking.
 */
const {
  createRunOncePlugin,
  withXcodeProject,
  withDangerousMod,
  withInfoPlist,
  withAppBuildGradle,
  withGradleProperties,
} = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');
const packageJson = require('./package.json');

const CLERK_MIN_IOS_VERSION = '17.0';
const HOST_SDK_VERSION_GRADLE_PROPERTY = 'clerkExpo.hostSdkVersion';

const resolveClerkExpo = projectRoot => {
  try {
    const paths = [projectRoot, process.cwd()].filter(Boolean);
    const clerkExpoPackageJsonPath = require.resolve('@clerk/expo/package.json', { paths });
    return {
      dir: path.dirname(clerkExpoPackageJsonPath),
      version: require(clerkExpoPackageJsonPath).version,
    };
  } catch {
    return null;
  }
};

const withClerkIOS = (config, hostSdkVersion) => {
  console.log('✅ Clerk iOS plugin loaded');

  // IMPORTANT: Set iOS deployment target in Podfile.properties.json BEFORE pod install
  // This ensures ClerkExpo pod gets installed (it requires iOS 17.0)
  config = withDangerousMod(config, [
    'ios',
    async config => {
      const podfilePropertiesPath = path.join(config.modRequest.platformProjectRoot, 'Podfile.properties.json');

      let properties = {};
      if (fs.existsSync(podfilePropertiesPath)) {
        try {
          properties = JSON.parse(fs.readFileSync(podfilePropertiesPath, 'utf8'));
        } catch {
          // If file exists but is invalid JSON, start fresh
        }
      }

      // Set the iOS deployment target
      if (
        !properties['ios.deploymentTarget'] ||
        parseFloat(properties['ios.deploymentTarget']) < parseFloat(CLERK_MIN_IOS_VERSION)
      ) {
        properties['ios.deploymentTarget'] = CLERK_MIN_IOS_VERSION;
        fs.writeFileSync(podfilePropertiesPath, JSON.stringify(properties, null, 2) + '\n');
        console.log(`✅ Set ios.deploymentTarget to ${CLERK_MIN_IOS_VERSION} in Podfile.properties.json`);
      }

      return config;
    },
  ]);

  // First update the iOS deployment target to 17.0 (required by Clerk iOS SDK)
  config = withXcodeProject(config, config => {
    const xcodeProject = config.modResults;

    try {
      // Update deployment target in all build configurations
      const buildConfigs = xcodeProject.hash.project.objects.XCBuildConfiguration || {};

      for (const [uuid, buildConfig] of Object.entries(buildConfigs)) {
        if (buildConfig && buildConfig.buildSettings) {
          const currentTarget = buildConfig.buildSettings.IPHONEOS_DEPLOYMENT_TARGET;
          if (currentTarget && parseFloat(currentTarget) < parseFloat(CLERK_MIN_IOS_VERSION)) {
            buildConfig.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = CLERK_MIN_IOS_VERSION;
          }
        }
      }

      console.log(`✅ Updated iOS deployment target to ${CLERK_MIN_IOS_VERSION}`);
    } catch (error) {
      console.error('❌ Error updating deployment target:', error.message);
    }

    return config;
  });

  config = withInfoPlist(config, modConfig => {
    modConfig.modResults.ClerkExpoVersion = hostSdkVersion;
    return modConfig;
  });

  return config;
};

/**
 * Add packaging exclusions to Android app build.gradle to resolve
 * duplicate META-INF file conflicts from clerk-android dependencies.
 */
const withClerkAndroid = (config, hostSdkVersion) => {
  console.log('✅ Clerk Android plugin loaded');

  config = withGradleProperties(config, modConfig => {
    modConfig.modResults = modConfig.modResults.filter(
      item => !(item.type === 'property' && item.key === HOST_SDK_VERSION_GRADLE_PROPERTY),
    );
    modConfig.modResults.push({ type: 'property', key: HOST_SDK_VERSION_GRADLE_PROPERTY, value: hostSdkVersion });
    return modConfig;
  });

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
      console.log('✅ Clerk Android packaging exclusions added');
    }

    // --- Kotlin metadata version check skip ---
    if (!buildGradle.includes('-Xskip-metadata-version-check')) {
      const kotlinOptionsMatch = buildGradle.match(/kotlinOptions\s*\{/);
      if (kotlinOptionsMatch) {
        buildGradle = buildGradle.replace(
          /kotlinOptions\s*\{/,
          `kotlinOptions {\n        // Clerk: allow reading metadata from newer Kotlin versions\n        freeCompilerArgs += ['-Xskip-metadata-version-check']`,
        );
      } else {
        const androidMatch = buildGradle.match(/android\s*\{/);
        if (androidMatch) {
          buildGradle = buildGradle.replace(
            /android\s*\{/,
            `android {\n    kotlinOptions {\n        // Clerk: allow reading metadata from newer Kotlin versions\n        freeCompilerArgs += ['-Xskip-metadata-version-check']\n    }`,
          );
        }
      }
      console.log('✅ Clerk Android Kotlin metadata version check skip added');
    }

    modConfig.modResults.contents = buildGradle;
    return modConfig;
  });
};

/**
 * Write ClerkKeychainService to Info.plist when keychainService is provided.
 * This allows extension apps (watch, widget, app clip) to share the same
 * keychain entry as the main app by using a custom service identifier.
 */
const withClerkKeychainService = (config, { keychainService } = {}) => {
  if (!keychainService) {
    return config;
  }

  return withInfoPlist(config, modConfig => {
    modConfig.modResults.ClerkKeychainService = keychainService;
    console.log(`✅ Set ClerkKeychainService in Info.plist: ${keychainService}`);
    return modConfig;
  });
};

/**
 * Apply a custom theme to Clerk native components (iOS + Android).
 *
 * Accepts a `theme` prop pointing to a JSON file with optional keys:
 *   - colors: { primary, background, input, danger, success, warning,
 *               foreground, mutedForeground, primaryForeground, inputForeground,
 *               neutral, border, ring, muted, shadow, secondaryButtonBackground,
 *               secondaryButtonForeground }  (hex color strings)
 *   - darkColors: same keys as colors (for dark mode)
 *   - design: { fontFamily: string, borderRadius: number }
 *
 * iOS: Embeds the parsed JSON into Info.plist under key "ClerkTheme".
 * Android: Copies the JSON file to android/app/src/main/assets/clerk_theme.json.
 */
const VALID_COLOR_KEYS = [
  'primary',
  'background',
  'input',
  'danger',
  'success',
  'warning',
  'foreground',
  'mutedForeground',
  'primaryForeground',
  'inputForeground',
  'neutral',
  'border',
  'ring',
  'muted',
  'shadow',
  'secondaryButtonBackground',
  'secondaryButtonForeground',
];

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateThemeJson(theme) {
  if (!isPlainObject(theme)) {
    throw new Error('Clerk theme: theme JSON must be a plain object');
  }

  const validateColors = (colors, label) => {
    if (!isPlainObject(colors)) {
      throw new Error(`Clerk theme: ${label} must be an object`);
    }
    for (const [key, value] of Object.entries(colors)) {
      if (!VALID_COLOR_KEYS.includes(key)) {
        console.warn(`⚠️  Clerk theme: unknown color key "${key}" in ${label}, ignoring`);
        continue;
      }
      if (typeof value !== 'string' || !HEX_COLOR_REGEX.test(value)) {
        throw new Error(`Clerk theme: invalid hex color for ${label}.${key}: "${value}"`);
      }
    }
  };

  if (theme.colors != null) validateColors(theme.colors, 'colors');
  if (theme.darkColors != null) validateColors(theme.darkColors, 'darkColors');

  if (theme.design != null) {
    if (!isPlainObject(theme.design)) {
      throw new Error(`Clerk theme: design must be an object`);
    }
    if (theme.design.fontFamily != null && typeof theme.design.fontFamily !== 'string') {
      throw new Error(`Clerk theme: design.fontFamily must be a string`);
    }
    if (theme.design.borderRadius != null && typeof theme.design.borderRadius !== 'number') {
      throw new Error(`Clerk theme: design.borderRadius must be a number`);
    }
  }
}

const withClerkTheme = (config, props = {}) => {
  const { theme } = props;
  if (!theme) return config;

  // Resolve the theme file path relative to the project root
  const themePath = path.resolve(theme);
  if (!fs.existsSync(themePath)) {
    console.warn(`⚠️  Clerk theme file not found: ${themePath}, skipping theme`);
    return config;
  }

  let themeJson;
  try {
    themeJson = JSON.parse(fs.readFileSync(themePath, 'utf8'));
    validateThemeJson(themeJson);
  } catch (e) {
    throw new Error(`Clerk theme: failed to parse ${themePath}: ${e.message}`);
  }

  // iOS: Embed theme in Info.plist under "ClerkTheme"
  config = withInfoPlist(config, modConfig => {
    modConfig.modResults.ClerkTheme = themeJson;
    console.log('✅ Embedded Clerk theme in Info.plist');
    return modConfig;
  });

  // Android: Copy theme JSON to assets
  config = withDangerousMod(config, [
    'android',
    async config => {
      const assetsDir = path.join(config.modRequest.platformProjectRoot, 'app', 'src', 'main', 'assets');
      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
      }
      const destPath = path.join(assetsDir, 'clerk_theme.json');
      fs.writeFileSync(destPath, JSON.stringify(themeJson, null, 2) + '\n');
      console.log('✅ Copied Clerk theme to Android assets');
      return config;
    },
  ]);

  return config;
};

const withClerkExpoNativeComponents = (config, props = {}, resolve = resolveClerkExpo) => {
  const clerkExpo = resolve(config._internal?.projectRoot);
  if (clerkExpo && fs.existsSync(path.join(clerkExpo.dir, 'expo-module.config.json'))) {
    throw new Error(
      `Clerk: @clerk/expo@${clerkExpo.version} still bundles the Clerk native module, which conflicts with @clerk/expo-native-components. Upgrade @clerk/expo to a version that supports @clerk/expo-native-components.`,
    );
  }
  // Native requests report the @clerk/expo version in the x-clerk-host-sdk-version header.
  const hostSdkVersion = clerkExpo?.version ?? packageJson.version;

  config = withClerkIOS(config, hostSdkVersion);
  config = withClerkAndroid(config, hostSdkVersion);
  config = withClerkKeychainService(config, props);
  config = withClerkTheme(config, props);
  return config;
};

module.exports = createRunOncePlugin(withClerkExpoNativeComponents, packageJson.name, packageJson.version);
module.exports._testing = {
  withClerkExpoNativeComponents,
  validateThemeJson,
  isPlainObject,
  VALID_COLOR_KEYS,
  HEX_COLOR_REGEX,
};

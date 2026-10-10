/**
 * Expo config plugin for @clerk/expo
 *
 * When this plugin is used:
 * 1. Android registers the hosted auth callback intent filter
 * 2. iOS gets the Sign in with Apple entitlement and, when configured, the Face ID usage description
 * 3. If @clerk/expo-native-components is installed, its config plugin is applied for the Clerk native SDKs
 */
const { AndroidConfig, withAndroidManifest, withEntitlementsPlist, withInfoPlist } = require('@expo/config-plugins');

const CLERK_EXPO_NATIVE = '@clerk/expo-native-components';
const CLERK_EXPO_NATIVE_OPTIONS = ['keychainService', 'theme'];

const addHostedAuthIntentFilter = (mainActivity, packageName) => {
  const callbackHost = `${packageName}.hosted-callback`;
  const intentFilters = mainActivity['intent-filter'] || [];
  const hasAndroidName = (entries, name) => entries?.some(entry => entry.$?.['android:name'] === name);
  const callbackIsRegistered = intentFilters.some(
    intentFilter =>
      hasAndroidName(intentFilter.action, 'android.intent.action.VIEW') &&
      hasAndroidName(intentFilter.category, 'android.intent.category.DEFAULT') &&
      hasAndroidName(intentFilter.category, 'android.intent.category.BROWSABLE') &&
      intentFilter.data?.some(
        data => data.$?.['android:scheme'] === 'clerk' && data.$?.['android:host'] === callbackHost,
      ),
  );

  if (callbackIsRegistered) {
    return;
  }

  intentFilters.push({
    action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
    category: [
      { $: { 'android:name': 'android.intent.category.DEFAULT' } },
      { $: { 'android:name': 'android.intent.category.BROWSABLE' } },
    ],
    data: [{ $: { 'android:scheme': 'clerk', 'android:host': callbackHost } }],
  });
  mainActivity['intent-filter'] = intentFilters;
};

const withClerkHostedAuthCallback = config => {
  return withAndroidManifest(config, modConfig => {
    const packageName = config.android?.package;
    if (packageName) {
      const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(modConfig.modResults);
      addHostedAuthIntentFilter(mainActivity, packageName);
    }
    return modConfig;
  });
};

const withClerkFaceIDPermission = (config, { faceIDPermission } = {}) => {
  if (faceIDPermission === undefined) {
    return config;
  }

  if (typeof faceIDPermission !== 'string' || faceIDPermission.trim().length === 0) {
    throw new Error('Clerk: faceIDPermission must be a non-empty string');
  }

  return withInfoPlist(config, modConfig => {
    if (!Object.hasOwn(modConfig.modResults, 'NSFaceIDUsageDescription')) {
      modConfig.modResults.NSFaceIDUsageDescription = faceIDPermission;
    }
    return modConfig;
  });
};

/**
 * Add Sign in with Apple entitlement to the iOS app.
 * Required for the native Apple Sign In flow via ASAuthorizationController.
 */
const withClerkAppleSignIn = config => {
  return withEntitlementsPlist(config, modConfig => {
    if (!modConfig.modResults['com.apple.developer.applesignin']) {
      modConfig.modResults['com.apple.developer.applesignin'] = ['Default'];
      console.log('✅ Added Sign in with Apple entitlement');
    }
    return modConfig;
  });
};

const resolveClerkExpoNativePlugin = config => {
  try {
    const paths = [config._internal?.projectRoot, process.cwd()].filter(Boolean);
    return require(require.resolve(`${CLERK_EXPO_NATIVE}/app.plugin.js`, { paths }));
  } catch {
    return null;
  }
};

const getListedPluginProps = (config, name) => {
  for (const entry of config.plugins || []) {
    if (entry === name) {
      return {};
    }
    if (Array.isArray(entry) && entry[0] === name) {
      return entry[1] || {};
    }
  }
  return {};
};

/**
 * Apply the @clerk/expo-native-components config plugin when it is installed, so apps that only list
 * "@clerk/expo" keep the iOS deployment target and native SDK configuration they need.
 */
const withClerkExpoNativeComponents = (config, props = {}, resolvePlugin = resolveClerkExpoNativePlugin) => {
  const nativeProps = Object.fromEntries(
    CLERK_EXPO_NATIVE_OPTIONS.filter(option => props[option] !== undefined).map(option => [option, props[option]]),
  );
  const nativeOptionNames = Object.keys(nativeProps)
    .map(option => `"${option}"`)
    .join(', ');

  if (config._internal?.pluginHistory?.[CLERK_EXPO_NATIVE]) {
    if (nativeOptionNames) {
      console.warn(
        `⚠️  Clerk: The following "@clerk/expo" plugin options are ignored because the "${CLERK_EXPO_NATIVE}" plugin already ran: ${nativeOptionNames}. Pass them to the "${CLERK_EXPO_NATIVE}" plugin instead.`,
      );
    }
    return config;
  }

  const clerkExpoNativePlugin = resolvePlugin(config);
  if (!clerkExpoNativePlugin) {
    if (nativeOptionNames) {
      console.warn(
        `⚠️  Clerk: The following "@clerk/expo" plugin options require ${CLERK_EXPO_NATIVE} and are ignored: ${nativeOptionNames}. Install it with \`npx expo install ${CLERK_EXPO_NATIVE}\` and add "${CLERK_EXPO_NATIVE}" to the plugins array in your app config.`,
      );
    }
    return config;
  }

  return clerkExpoNativePlugin(config, { ...nativeProps, ...getListedPluginProps(config, CLERK_EXPO_NATIVE) });
};

const withClerkExpo = (config, props = {}) => {
  const { appleSignIn = true } = props;
  if (appleSignIn !== false) {
    config = withClerkAppleSignIn(config);
  }
  config = withClerkHostedAuthCallback(config);
  config = withClerkFaceIDPermission(config, props);
  config = withClerkExpoNativeComponents(config, props);
  return config;
};

module.exports = withClerkExpo;
module.exports._testing = {
  addHostedAuthIntentFilter,
  withClerkExpoNativeComponents,
  withClerkFaceIDPermission,
};

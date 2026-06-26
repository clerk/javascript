const { withInfoPlist, createRunOncePlugin } = require('@expo/config-plugins');
const pkg = require('./package.json');

const withClerkExpoGoogleSignIn = config => {
  const iosUrlScheme =
    process.env.EXPO_PUBLIC_CLERK_GOOGLE_IOS_URL_SCHEME ||
    (config.extra && config.extra.EXPO_PUBLIC_CLERK_GOOGLE_IOS_URL_SCHEME);

  if (!iosUrlScheme) {
    return config;
  }

  return withInfoPlist(config, modConfig => {
    if (!Array.isArray(modConfig.modResults.CFBundleURLTypes)) {
      modConfig.modResults.CFBundleURLTypes = [];
    }

    const schemeExists = modConfig.modResults.CFBundleURLTypes.some(urlType =>
      urlType.CFBundleURLSchemes?.includes(iosUrlScheme),
    );

    if (!schemeExists) {
      modConfig.modResults.CFBundleURLTypes.push({
        CFBundleURLSchemes: [iosUrlScheme],
      });
    }

    return modConfig;
  });
};

module.exports = createRunOncePlugin(withClerkExpoGoogleSignIn, pkg.name, pkg.version);

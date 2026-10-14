const { version: expoVersion } = require('expo/package.json');

module.exports = ({ config }) =>
  expoVersion.startsWith('57.')
    ? { ...config, plugins: [...config.plugins, ['expo-build-properties', { ios: { enableSceneSupport: true } }]] }
    : config;

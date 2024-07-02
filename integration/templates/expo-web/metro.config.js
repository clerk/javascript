// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = {
  ...getDefaultConfig(__dirname),
  watchFolders: [require('node:path').resolve(__dirname, '..')],
  resolver: {
    sourceExts: ['js', 'json', 'ts', 'tsx', 'cjs', 'mjs'],
  },
};

module.exports = {
  ...config,
};

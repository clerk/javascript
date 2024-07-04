// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const packageJson = require('./package.json');
const path = require('node:path');

const getClerkExpoPath = () => {
  const clerkExpoPath = packageJson.dependencies['@clerk/clerk-expo'];

  if (clerkExpoPath?.startsWith('file:')) {
    return path.resolve(clerkExpoPath.replace('file:', '').replace(/\/packages\/expo$/, ''));
  }

  return undefined;
};

const clerkMonorepo = getClerkExpoPath();

/** @type {import('expo/metro-config').MetroConfig} */
const config = {
  ...getDefaultConfig(__dirname),
  watchFolders: [clerkMonorepo],
  resolver: {
    sourceExts: ['js', 'json', 'ts', 'tsx', 'cjs', 'mjs'],
    unstable_enableSymlinks: true,
    nodeModulesPaths: [path.resolve(__dirname, 'node_modules'), `${clerkMonorepo}/node_modules`],
  },
};

module.exports = {
  ...config,
};

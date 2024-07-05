/**
 * DO NOT EDIT THIS FILE UNLESS YOU DEFINITELY KNWO WHAT YOU ARE DOING.
 * THIS ENSURES THAT INTEGRATION TESTS ARE LOADING THE CORRECT DEPENDENCIES.
 */
const { getDefaultConfig } = require('expo/metro-config');
const packageJson = require('./package.json');
const path = require('node:path');

/** @type {() => string | undefined} */
const getClerkExpoPath = () => {
  const clerkExpoPath = packageJson.dependencies['@clerk/clerk-expo'];

  if (clerkExpoPath?.startsWith('file:')) {
    return clerkExpoPath.replace('file:', '');
  }

  return undefined;
};

const clerkExpoPath = getClerkExpoPath();
const clerkMonorepoPath = clerkExpoPath?.replace(/\/packages\/expo$/, '');

/** @type {import('expo/metro-config').MetroConfig} */
const config = {
  ...getDefaultConfig(__dirname),
  watchFolders: [clerkMonorepoPath],
  resolver: {
    sourceExts: ['js', 'json', 'ts', 'tsx', 'cjs', 'mjs'],
    unstable_enableSymlinks: !!clerkExpoPath,
    unstable_enablePackageExports: !!clerkExpoPath,
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      clerkExpoPath && `${clerkMonorepoPath}/node_modules`,
      clerkExpoPath && `${clerkExpoPath}/node_modules`,
    ],
    // This is a workaround for a to prevent multiple versions of react and react-native from being loaded.
    // https://github.com/expo/expo/pull/26209
    blockList: [
      clerkExpoPath && new RegExp(`${clerkMonorepoPath}/node_modules/react`),
      clerkExpoPath && new RegExp(`${clerkMonorepoPath}/node_modules/react-native`),
    ],
  },
};

module.exports = {
  ...config,
};

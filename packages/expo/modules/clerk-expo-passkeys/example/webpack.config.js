/* eslint-disable no-undef */
const createConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async (env, argv) => {
  const config = await createConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['clerk-expo-passkeys'],
      },
    },
    argv,
  );
  config.resolve.modules = [path.resolve(__dirname, './node_modules'), path.resolve(__dirname, '../node_modules')];

  return config;
};

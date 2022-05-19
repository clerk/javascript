/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack');
const packageJSON = require('./package.json');
const path = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = env => {
  const mode = env.prod ? 'production' : 'development';
  const isProduction = mode === 'production';

  return {
    mode,
    plugins: [
      new ReactRefreshWebpackPlugin({ overlay: { sockHost: 'js.lclclerk.com' } }),
      ...defineConstants({ mode, packageJSON }),
    ],
    devtool: isProduction ? undefined : 'eval-cheap-source-map',
    entry: './src/index.browser.v4.ts',
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    module: {
      rules: [loadSvgs, loadTypescriptWithESBuild],
    },
    ...devServerOutput,
  };
};

const loadTypescriptWithESBuild = {
  test: /\.(ts|js)x?$/,
  exclude: /node_modules/,
  use: [
    {
      loader: 'esbuild-loader',
      options: {
        loader: 'tsx',
        target: 'ES2019',
      },
    },
  ],
};

const loadSvgs = {
  test: /\.svg$/,
  use: ['@svgr/webpack'],
};

const defineConstants = ({ mode, packageJSON }) => [
  new webpack.DefinePlugin({
    __DEV__: mode !== 'production',
    __CLERKJS_VERSION__: JSON.stringify(packageJSON.version),
  }),
  new webpack.EnvironmentPlugin({
    CLERK_ENV: mode,
  }),
];

const devServerOutput = {
  output: {
    publicPath: 'https://js.lclclerk.com/npm/',
    crossOriginLoading: 'anonymous',
    filename: 'clerk.browser.js',
    libraryTarget: 'umd',
  },
  devServer: {
    allowedHosts: ['all'],
    headers: { 'Access-Control-Allow-Origin': '*' },
    host: '0.0.0.0',
    port: 4000,
    hot: true,
    liveReload: false,
    client: {
      webSocketURL: 'auto://js.lclclerk.com/ws',
    },
  },
};

const bundleOutput = {
  output: {
    filename: 'index.browser.v4.js',
    path: path.resolve(__dirname, 'dist'),
  },
};

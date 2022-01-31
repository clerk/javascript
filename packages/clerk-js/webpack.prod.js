/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      CLERK_ENV: 'production',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.module.scss$/, // Matches only local scss module files e.g. Component.module.scss coming from @clerk/shared
        use: [
          'style-loader', // creates style nodes from JS strings
          'css-loader', // translates CSS into CommonJS
          'sass-loader', // compiles Sass to CSS, using Node Sass by default
        ],
      },
    ],
  },
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000, // in bytes
    maxAssetSize: 512000, // in bytes
  },
});

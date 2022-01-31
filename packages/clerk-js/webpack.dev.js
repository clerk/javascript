/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require('webpack-merge');
const webpack = require('webpack');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  plugins: [
    new ReactRefreshWebpackPlugin({ overlay: { sockHost: 'js.lclclerk.com' } }),
    new webpack.EnvironmentPlugin({
      CLERK_ENV: 'development',
    }),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              sourceMaps: true,
              presets: [
                '@babel/preset-env',
                [
                  '@babel/preset-typescript',
                  {
                    onlyRemoveTypeImports: true, // this is important for proper files watching
                  },
                ],
                '@babel/preset-react',
              ],
              plugins: [
                '@babel/proposal-class-properties',
                '@babel/proposal-object-rest-spread',
                'react-refresh/babel',
              ],
            },
          },
        ],
      },
      {
        test: /\.module.scss$/, // Matches only local scss module files e.g. Component.module.scss coming from @clerk/shared
        use: [
          'style-loader', // creates style nodes from JS strings
          // translates CSS into CommonJS
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: 'shared__[name]__[local]--[hash:base64:5]',
              },
            },
          },
          'sass-loader', // compiles Sass to CSS, using Node Sass by default
        ],
      },
    ],
  },
  output: {
    publicPath: 'https://js.lclclerk.com/npm/',
    crossOriginLoading: 'anonymous',
  },
  devtool: 'cheap-source-map',
  devServer: {
    allowedHosts: ['all'],
    headers: { 'Access-Control-Allow-Origin': '*' },
    host: '0.0.0.0',
    port: 4000,
    client: {
      webSocketURL: 'auto://js.lclclerk.com/ws',
    },
  },
});

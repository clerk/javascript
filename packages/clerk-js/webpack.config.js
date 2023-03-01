/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack');
const packageJSON = require('./package.json');
const path = require('path');
const { merge } = require('webpack-merge');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ReactRefreshTypeScript = require('react-refresh-typescript');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const isProduction = mode => mode === 'production';
const isDevelopment = mode => !isProduction(mode);

/** @type { () => import('webpack').Configuration } */
const common = ({ mode }) => {
  return {
    mode,
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    plugins: [
      new webpack.DefinePlugin({
        __DEV__: isDevelopment(mode),
        __PKG_VERSION__: JSON.stringify(packageJSON.version),
        __PKG_NAME__: JSON.stringify(packageJSON.name),
      }),
      new webpack.EnvironmentPlugin({
        CLERK_ENV: mode,
        NODE_ENV: mode,
      }),
    ],
  };
};

const svgLoader = () => {
  return {
    test: /\.svg$/,
    use: ['@svgr/webpack'],
  };
};

const typescriptLoaderProd = () => {
  return {
    test: /\.(ts|js)x?$/,
    exclude: /node_modules/,
    use: [
      {
        loader: 'ts-loader',
        options: { transpileOnly: true },
      },
    ],
  };
};

const typescriptLoaderDev = () => {
  return {
    test: /\.(ts|js)x?$/,
    exclude: /node_modules/,
    use: [
      {
        loader: 'ts-loader',
        options: {
          configFile: 'tsconfig.dev.json',
          transpileOnly: true,
          getCustomTransformers: () => ({
            before: [ReactRefreshTypeScript()],
          }),
        },
      },
    ],
  };
};

/** @type { () => (import('webpack').Configuration) } */
const commonForProd = () => {
  return {
    devtool: undefined,
    module: {
      rules: [svgLoader(), typescriptLoaderProd()],
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      libraryTarget: 'umd',
      globalObject: 'globalThis',
    },
  };
};
/** @type { () => (import('webpack').Configuration) } */
const externalsForHeadless = () => {
  return {
    externals: {
      react: 'react',
      'react-dom': 'react-dom',
    },
  };
};

/** @type { () => (import('webpack').Configuration)[] } */
const prodConfig = ({ mode }) => {
  const entryToSourceMap = {
    clerk: './src/index.ts',
    'clerk.browser': './src/index.browser.ts',
    'clerk.headless': './src/index.headless.ts',
    'clerk.headless.browser': './src/index.headless.browser.ts',
  };

  const entryToConfigMap = {
    clerk: {
      ...common({ mode }),
      ...commonForProd(),
    },
    'clerk.browser': {
      ...common({ mode }),
      ...commonForProd(),
    },
    'clerk.headless': {
      ...common({ mode }),
      ...commonForProd(),
      ...externalsForHeadless(),
    },
    'clerk.headless.browser': {
      ...common({ mode }),
      ...commonForProd(),
      ...externalsForHeadless(),
    },
  };

  const configs = [];

  for (const entry of Object.keys(entryToSourceMap)) {
    console.log('Will build for ', entry);
    configs.push({
      ...entryToConfigMap[entry],
      entry: {
        [entry]: entryToSourceMap[entry],
      },
    });
  }

  return configs;
};

const devServerOutput = () => {
  return {
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
      client: { webSocketURL: 'auto://js.lclclerk.com/ws' },
    },
  };
};

/** @type { () => import('webpack').Configuration } */
const devConfig = ({ mode, env }) => {
  return merge(
    common({ mode }),
    {
      module: {
        rules: [svgLoader(), typescriptLoaderDev()],
      },
      plugins: [
        new ReactRefreshWebpackPlugin({ overlay: { sockHost: 'js.lclclerk.com' } }),
        ...(env.serveAnalyzer ? [new BundleAnalyzerPlugin()] : []),
      ],
      devtool: 'eval-cheap-source-map',
      entry: './src/index.browser.ts',
    },
    devServerOutput(),
  );
};

module.exports = env => {
  const mode = env.production ? 'production' : 'development';
  return isProduction(mode) ? prodConfig({ mode }) : devConfig({ mode, env });
};

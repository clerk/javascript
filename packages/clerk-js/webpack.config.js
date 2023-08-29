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

const variants = {
  clerk: 'clerk',
  clerkBrowser: 'clerk.browser',
  clerkHeadless: 'clerk.headless',
  clerkHeadlessBrowser: 'clerk.headless.browser',
};

const variantToSourceFile = {
  [variants.clerk]: './src/index.ts',
  [variants.clerkBrowser]: './src/index.browser.ts',
  [variants.clerkHeadless]: './src/index.headless.ts',
  [variants.clerkHeadlessBrowser]: './src/index.headless.browser.ts',
};

/** @returns { import('webpack').Configuration } */
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
    output: {
      chunkFilename: `[name]_[fullhash:6]_${packageJSON.version}.js`,
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          zxcvbnTSCoreVendor: {
            test: /[\\/]node_modules[\\/](@zxcvbn-ts)[\\/](core)[\\/]/,
            name: 'zxcvbn-ts-core',
            chunks: 'all',
          },
          zxcvbnTSCommonVendor: {
            test: /[\\/]node_modules[\\/](@zxcvbn-ts)[\\/](language-common)[\\/]/,
            name: 'zxcvbn-common',
            chunks: 'all',
          },
          common: {
            minChunks: 1,
            name: 'ui-common',
            priority: -20,
            test: module => module.resource && !module.resource.includes('/ui/components'),
          },
          defaultVendors: {
            minChunks: 1,
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
          },
        },
      },
    },
  };
};

/** @type { () => (import('webpack').RuleSetRule) }  */
const svgLoader = () => {
  return {
    test: /\.svg$/,
    resolve: {
      fullySpecified: false,
    },
    use: {
      loader: '@svgr/webpack',
      options: {
        svgo: true,
        svgoConfig: {
          floatPrecision: 3,
          transformPrecision: 1,
          plugins: ['preset-default', 'removeDimensions', 'removeStyleElement'],
        },
      },
    },
  };
};

/** @type { () => (import('webpack').RuleSetRule) } */
const typescriptLoaderProd = () => {
  return {
    test: /\.(ts|js)x?$/,
    exclude: /node_modules/,
    resolve: {
      fullySpecified: false,
    },
    use: [
      {
        loader: 'ts-loader',
        options: { transpileOnly: true },
      },
    ],
  };
};

/** @type { () => (import('webpack').RuleSetRule) } */
const typescriptLoaderDev = () => {
  return {
    test: /\.(ts|js)x?$/,
    exclude: /node_modules/,
    resolve: {
      fullySpecified: false,
    },
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
    plugins: [
      // new webpack.optimize.LimitChunkCountPlugin({
      //   maxChunks: 5,
      // }),
      // new webpack.optimize.MinChunkSizePlugin({
      //   minChunkSize: 10000,
      // })
    ],
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

const entryForVariant = variant => {
  return { entry: { [variant]: variantToSourceFile[variant] } };
};

/** @type { () => (import('webpack').Configuration)[] } */
const prodConfig = ({ mode, env }) => {
  const clerkBrowser = merge(entryForVariant(variants.clerkBrowser), common({ mode }), commonForProd());

  const clerkHeadless = merge(
    entryForVariant(variants.clerkHeadless),
    common({ mode }),
    commonForProd(),
    // externalsForHeadless(),
  );

  const clerkHeadlessBrowser = merge(
    entryForVariant(variants.clerkHeadlessBrowser),
    common({ mode }),
    commonForProd(),
    // externalsForHeadless(),
  );

  const clerkEsm = merge(entryForVariant(variants.clerk), common({ mode }), commonForProd(), {
    experiments: {
      outputModule: true,
    },
    output: {
      filename: '[name].mjs',
      libraryTarget: 'module',
    },
    plugins: [
      // Include the lazy chunks in the bundle as well
      // so that the final bundle can be imported and bundled again
      // by a different bundler, eg the webpack instance used by react-scripts
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
    ],
  });

  const clerkCjs = merge(clerkEsm, {
    output: {
      filename: '[name].js',
      libraryTarget: 'commonjs',
    },
  });

  return [clerkBrowser, clerkHeadless, clerkHeadlessBrowser, clerkEsm, clerkCjs];
};

const devConfig = ({ mode, env }) => {
  const variant = env.variant || variants.clerkBrowser;
  // accept an optional devOrigin environment option to change the origin of the dev server.
  // By default we use https://js.lclclerk.com which is what our local dev proxy looks for.
  const devUrl = new URL(env.devOrigin || 'https://js.lclclerk.com');

  const commonForDev = () => {
    return {
      module: {
        rules: [svgLoader(), typescriptLoaderDev()],
      },
      plugins: [
        new ReactRefreshWebpackPlugin({ overlay: { sockHost: devUrl.host } }),
        ...(env.serveAnalyzer ? [new BundleAnalyzerPlugin()] : []),
      ],
      devtool: 'eval-cheap-source-map',
      output: {
        publicPath: `${devUrl.origin}/npm`,
        crossOriginLoading: 'anonymous',
        filename: `${variant}.js`,
        libraryTarget: 'umd',
      },
      optimization: {
        minimize: false,
      },
      devServer: {
        allowedHosts: ['all'],
        headers: { 'Access-Control-Allow-Origin': '*' },
        host: '0.0.0.0',
        port: 4000,
        hot: true,
        liveReload: false,
        client: { webSocketURL: `auto://${devUrl.host}/ws` },
      },
    };
  };

  const entryToConfigMap = {
    // prettier-ignore
    [variants.clerk]: merge(
      entryForVariant(variants.clerk),
      common({ mode }),
      commonForDev(),
    ),
    // prettier-ignore
    [variants.clerkBrowser]: merge(
      entryForVariant(variants.clerkBrowser),
      common({ mode }),
      commonForDev(),
    ),
    [variants.clerkHeadless]: merge(
      entryForVariant(variants.clerkHeadless),
      common({ mode }),
      commonForDev(),
      // externalsForHeadless(),
    ),
    [variants.clerkHeadlessBrowser]: merge(
      entryForVariant(variants.clerkHeadlessBrowser),
      common({ mode }),
      commonForDev(),
      // externalsForHeadless(),
    ),
  };

  if (!entryToConfigMap[variant]) {
    throw new Error('Clerk variant does not exist in config');
  }

  return entryToConfigMap[variant];
};

module.exports = env => {
  const mode = env.production ? 'production' : 'development';
  return isProduction(mode) ? prodConfig({ mode, env }) : devConfig({ mode, env });
};

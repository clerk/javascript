// @ts-check
const rspack = require('@rspack/core');
const packageJSON = require('./package.json');
const path = require('path');
const { merge } = require('webpack-merge');
const ReactRefreshPlugin = require('@rspack/plugin-react-refresh');
const { svgLoader, typescriptLoaderProd, typescriptLoaderDev } = require('../../scripts/rspack-common');

const isProduction = mode => mode === 'production';
const isDevelopment = mode => !isProduction(mode);

const variants = {
  uiBrowser: 'ui.browser',
  ui: 'ui',
};

const variantToSourceFile = {
  [variants.uiBrowser]: './src/index.browser.ts',
  [variants.ui]: './src/index.ts',
};

/**
 * Common configuration for all builds
 * @param {object} config
 * @param {'development'|'production'} config.mode
 * @param {string} config.variant
 * @returns {import('@rspack/core').Configuration}
 */
const common = ({ mode, variant }) => {
  return {
    mode,
    resolve: {
      alias: {
        '@/ui': path.resolve(__dirname, './src'),
        '@': path.resolve(__dirname, './src'),
      },
      extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx'],
    },
    plugins: [
      new rspack.DefinePlugin({
        __DEV__: isDevelopment(mode),
        PACKAGE_VERSION: JSON.stringify(packageJSON.version),
        __PKG_VERSION__: JSON.stringify(packageJSON.version),
        PACKAGE_NAME: JSON.stringify(packageJSON.name),
      }),
      new rspack.EnvironmentPlugin({
        NODE_ENV: mode,
      }),
    ].filter(Boolean),
    output: {
      chunkFilename: `[name]_ui_[fullhash:6]_${packageJSON.version}.js`,
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          zxcvbnTSCoreVendor: {
            test: /[\\/]node_modules[\\/](@zxcvbn-ts\/core|fastest-levenshtein)[\\/]/,
            name: 'zxcvbn-ts-core',
            chunks: 'all',
          },
          zxcvbnTSCommonVendor: {
            test: /[\\/]node_modules[\\/](@zxcvbn-ts)[\\/](language-common)[\\/]/,
            name: 'zxcvbn-common',
            chunks: 'all',
          },
          baseAccountSDKVendor: {
            test: /[\\/]node_modules[\\/](@base-org\/account|@noble\/curves|abitype|ox|preact|eventemitter3|viem|zustand)[\\/]/,
            name: 'base-account-sdk',
            chunks: 'all',
          },
          coinbaseWalletSDKVendor: {
            test: /[\\/]node_modules[\\/](@coinbase\/wallet-sdk|preact|eventemitter3|@noble\/hashes)[\\/]/,
            name: 'coinbase-wallet-sdk',
            chunks: 'all',
          },
          stripeVendor: {
            test: /[\\/]node_modules[\\/](@stripe\/stripe-js)[\\/]/,
            name: 'stripe-vendors',
            chunks: 'all',
            enforce: true,
          },
          /**
           * Sign up is shared between the SignUp component and the SignIn component.
           */
          signUp: {
            minChunks: 1,
            name: 'signup',
            test: module => !!(module.resource && module.resource.includes('/ui/components/SignUp')),
          },
          common: {
            minChunks: 1,
            name: 'ui-common',
            priority: -20,
            test: module => !!(module.resource && !module.resource.includes('/ui/components')),
          },
          defaultVendors: {
            minChunks: 1,
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
          },
          react: {
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react-dom|scheduler)[\\/]/,
            name: 'framework',
            priority: 40,
            enforce: true,
          },
        },
      },
    },
    // Disable Rspack's warnings since we use bundlewatch
    ignoreWarnings: [/entrypoint size limit/, /asset size limit/, /Rspack performance recommendations/],
  };
};

/**
 * Helper to create entry configuration for a variant
 * @param {string} variant
 * @returns {import('@rspack/core').Configuration}
 */
const entryForVariant = variant => {
  return { entry: { [variant]: variantToSourceFile[variant] } };
};

/**
 * Common production configuration for chunked browser builds
 * @returns {import('@rspack/core').Configuration}
 */
const commonForProdBrowser = () => {
  return {
    devtool: false,
    output: {
      path: path.resolve(__dirname, 'dist/browser'),
      filename: '[name].js',
      libraryTarget: 'umd',
      globalObject: 'globalThis',
    },
    module: {
      rules: [svgLoader(), ...typescriptLoaderProd({ targets: 'last 2 years' })],
    },
    optimization: {
      minimize: true,
      minimizer: [
        new rspack.SwcJsMinimizerRspackPlugin({
          minimizerOptions: {
            compress: {
              unused: true,
              dead_code: true,
              passes: 2,
            },
            mangle: {
              safari10: true,
            },
          },
        }),
      ],
    },
  };
};

/**
 * Common production configuration for bundled module builds (no chunks)
 * @returns {import('@rspack/core').Configuration}
 */
const commonForProdBundled = () => {
  return {
    devtool: false,
    output: {
      path: path.resolve(__dirname, 'dist'),
      publicPath: '',
    },
    module: {
      rules: [svgLoader(), ...typescriptLoaderProd({ targets: 'last 2 years' })],
    },
    optimization: {
      minimize: true,
      minimizer: [
        new rspack.SwcJsMinimizerRspackPlugin({
          minimizerOptions: {
            compress: {
              unused: true,
              dead_code: true,
              passes: 2,
            },
            mangle: {
              safari10: true,
            },
          },
        }),
      ],
    },
  };
};

/**
 * Production configuration - builds multiple variants
 * @param {'development'|'production'} mode
 * @returns {(import('@rspack/core').Configuration)[]}
 */
const prodConfig = mode => {
  // Browser bundle with chunks (UMD)
  const uiBrowser = merge(
    entryForVariant(variants.uiBrowser),
    common({ mode, variant: variants.uiBrowser }),
    commonForProdBrowser(),
  );

  // ESM module bundle (no chunks)
  const uiEsm = merge(entryForVariant(variants.ui), common({ mode, variant: variants.ui }), commonForProdBundled(), {
    experiments: {
      outputModule: true,
    },
    output: {
      filename: '[name].mjs',
      libraryTarget: 'module',
    },
    plugins: [
      // Bundle everything into a single file for ESM
      new rspack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
    ],
    optimization: {
      splitChunks: false,
    },
  });

  // CJS module bundle (no chunks)
  const uiCjs = merge(entryForVariant(variants.ui), common({ mode, variant: variants.ui }), commonForProdBundled(), {
    output: {
      filename: '[name].js',
      libraryTarget: 'commonjs',
    },
    plugins: [
      // Bundle everything into a single file for CJS
      new rspack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
    ],
    optimization: {
      splitChunks: false,
    },
  });

  return [uiBrowser, uiEsm, uiCjs];
};

/**
 * Development configuration - only builds browser bundle with dev server
 * @param {'development'|'production'} mode
 * @param {object} env
 * @returns {import('@rspack/core').Configuration}
 */
const devConfig = (mode, env) => {
  const devUrl = new URL(env.devOrigin || 'https://ui.lclclerk.com');
  const port = Number(new URL(env.devOrigin ?? 'http://localhost:4001').port || 4001);

  return merge(entryForVariant(variants.uiBrowser), common({ mode, variant: variants.uiBrowser }), {
    module: {
      rules: [svgLoader(), ...typescriptLoaderDev()],
    },
    plugins: [new ReactRefreshPlugin({ overlay: { sockHost: devUrl.host } })],
    // devtool: 'eval-cheap-source-map',
    devtool: false,
    output: {
      publicPath: `${devUrl.origin}/npm/`,
      crossOriginLoading: 'anonymous',
      filename: `[name].js`,
      libraryTarget: 'umd',
    },
    optimization: {
      minimize: false,
    },
    devServer: {
      allowedHosts: ['all'],
      headers: { 'Access-Control-Allow-Origin': '*' },
      host: '0.0.0.0',
      port,
      hot: true,
      liveReload: false,
      client: { webSocketURL: `auto://${devUrl.host}/ws` },
    },
    cache: false,
    experiments: {
      cache: {
        type: 'memory',
      },
    },
  });
};

module.exports = env => {
  const mode = env.production ? 'production' : 'development';
  return isProduction(mode) ? prodConfig(mode) : devConfig(mode, env);
};

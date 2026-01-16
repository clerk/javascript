// @ts-check
import rspack from '@rspack/core';
import packageJSON from './package.json' with { type: 'json' };
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { merge } from 'webpack-merge';
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';
import { svgLoader, typescriptLoaderProd, typescriptLoaderDev } from '../../scripts/rspack-common.js';

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = mode => mode === 'production';
const isDevelopment = mode => !isProduction(mode);

/**
 * Externals handler for the shared variant that reads React from globalThis.__clerkSharedModules.
 * This allows the host application's React to be shared with @clerk/ui.
 * @type {import('@rspack/core').ExternalItemFunctionData}
 */
const sharedReactExternalsHandler = ({ request }, callback) => {
  if (request === 'react') {
    return callback(null, ['__clerkSharedModules', 'react'], 'root');
  }
  if (request === 'react-dom') {
    return callback(null, ['__clerkSharedModules', 'react-dom'], 'root');
  }
  if (request === 'react/jsx-runtime') {
    return callback(null, ['__clerkSharedModules', 'react/jsx-runtime'], 'root');
  }
  callback();
};

const variants = {
  uiBrowser: 'ui.browser',
  uiLegacyBrowser: 'ui.legacy.browser',
  uiSharedBrowser: 'ui.shared.browser',
};

const variantToSourceFile = {
  [variants.uiBrowser]: './src/index.browser.ts',
  [variants.uiLegacyBrowser]: './src/index.legacy.browser.ts',
  [variants.uiSharedBrowser]: './src/index.browser.ts', // Same entry, different externals
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
        __BUILD_DISABLE_RHC__: JSON.stringify(false),
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
          /**
           * Sign up is shared between the SignUp component and the SignIn component.
           */
          signUp: {
            minChunks: 1,
            name: 'signup',
            test: module =>
              !!(
                module instanceof rspack.NormalModule &&
                module.resource &&
                module.resource.includes('/components/SignUp')
              ),
          },
          common: {
            minChunks: 1,
            name: 'ui-common',
            priority: -20,
            test: module =>
              !!(
                module instanceof rspack.NormalModule &&
                module.resource &&
                !module.resource.includes('/components') &&
                !module.resource.includes('node_modules')
              ),
          },
          defaultVendors: {
            minChunks: 1,
            test: module => {
              if (!(module instanceof rspack.NormalModule) || !module.resource) {
                return false;
              }
              // Exclude Solana packages and their known transitive dependencies
              if (
                /[\\/]node_modules[\\/](@solana|@solana-mobile|@wallet-standard|bn\.js|borsh|buffer|superstruct|bs58|jayson|rpc-websockets|qrcode)[\\/]/.test(
                  module.resource,
                )
              ) {
                return false;
              }
              return /[\\/]node_modules[\\/]/.test(module.resource);
            },
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
 * @param {object} [options]
 * @param {string} [options.targets] - Browserslist targets
 * @param {boolean} [options.useCoreJs] - Whether to use core-js polyfills
 * @returns {import('@rspack/core').Configuration}
 */
const commonForProdBrowser = ({ targets = 'last 2 years', useCoreJs = false } = {}) => {
  return {
    devtool: false,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      libraryTarget: 'umd',
      globalObject: 'globalThis',
    },
    module: {
      rules: [svgLoader(), ...typescriptLoaderProd({ targets, useCoreJs })],
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
    ...(useCoreJs
      ? {
          resolve: {
            alias: {
              'core-js': path.dirname(require.resolve('core-js/package.json')),
            },
          },
        }
      : {}),
  };
};

/**
 * Production configuration - builds UMD browser variants
 * @param {'development'|'production'} mode
 * @returns {import('@rspack/core').Configuration[]}
 */
const prodConfig = mode => {
  // Browser bundle with chunks (UMD)
  const uiBrowser = merge(
    entryForVariant(variants.uiBrowser),
    common({ mode, variant: variants.uiBrowser }),
    commonForProdBrowser(),
  );

  // Legacy browser bundle with chunks (UMD) for Safari 12 support
  const uiLegacyBrowser = merge(
    entryForVariant(variants.uiLegacyBrowser),
    common({ mode, variant: variants.uiLegacyBrowser }),
    commonForProdBrowser({ targets: packageJSON.browserslistLegacy, useCoreJs: true }),
  );

  // Shared variant - externalizes react/react-dom to use host app's versions
  // Expects host to provide these via globalThis.__clerkSharedModules
  const uiSharedBrowser = merge(
    entryForVariant(variants.uiSharedBrowser),
    common({ mode, variant: variants.uiSharedBrowser }),
    commonForProdBrowser(),
    {
      externals: [sharedReactExternalsHandler],
    },
  );

  return [uiBrowser, uiLegacyBrowser, uiSharedBrowser];
};

/**
 * Development configuration - only builds browser bundle with dev server
 * @param {'development'|'production'} mode
 * @param {object} env
 * @param {boolean} [env.shared] - If true, externalize React to globalThis.__clerkSharedModules (for use with @clerk/react).
 *                                  If false/unset, bundle React normally (for standalone or non-React framework usage).
 * @returns {import('@rspack/core').Configuration}
 */
const devConfig = (mode, env) => {
  const devUrl = new URL(env.devOrigin || 'https://ui.lclclerk.com');
  const port = Number(new URL(env.devOrigin ?? 'http://localhost:4011').port || 4011);
  const useSharedReact = Boolean(env.shared);

  return merge(entryForVariant(variants.uiBrowser), common({ mode, variant: variants.uiBrowser }), {
    module: {
      rules: [svgLoader(), ...typescriptLoaderDev()],
    },
    plugins: [new ReactRefreshPlugin({ overlay: { sockHost: devUrl.host } })],
    devtool: 'eval-source-map',
    output: {
      publicPath: `${devUrl.origin}/npm/`,
      crossOriginLoading: 'anonymous',
      filename: `[name].js`,
      libraryTarget: 'umd',
    },
    optimization: {
      minimize: false,
      usedExports: false,
      providedExports: false,
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
    // Only externalize React when using the shared variant (e.g., with @clerk/react).
    // For standalone usage or non-React frameworks, bundle React normally.
    ...(useSharedReact ? { externals: [sharedReactExternalsHandler] } : {}),
  });
};

export default env => {
  const mode = env.production ? 'production' : 'development';
  return isProduction(mode) ? prodConfig(mode) : devConfig(mode, env);
};

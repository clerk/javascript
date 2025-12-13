// @ts-check
import rspack from '@rspack/core';
import packageJSON from './package.json' with { type: 'json' };
import path from 'path';
import { fileURLToPath } from 'url';
import { merge } from 'webpack-merge';
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';
import { svgLoader, typescriptLoaderProd, typescriptLoaderDev } from '../../scripts/rspack-common.js';

const isRsdoctorEnabled = !!process.env.RSDOCTOR;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = mode => mode === 'production';
const isDevelopment = mode => !isProduction(mode);

const variants = {
  uiBrowser: 'ui.browser',
};

const variantToSourceFile = {
  [variants.uiBrowser]: './src/index.browser.ts',
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
          common: {
            minChunks: 1,
            name: 'ui-common',
            priority: -20,
            test: module =>
              !!(module instanceof rspack.NormalModule && module.resource && !module.resource.includes('/components')),
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
      path: path.resolve(__dirname, 'dist'),
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
 * Production configuration - builds UMD browser variant only
 * @param {'development'|'production'} mode
 * @returns {Promise<import('@rspack/core').Configuration>}
 */
const prodConfig = async mode => {
  /** @type {import('@rspack/core').Configuration['plugins']} */
  const plugins = [];

  if (isRsdoctorEnabled) {
    const { RsdoctorRspackPlugin } = await import('@rsdoctor/rspack-plugin');
    plugins.push(
      new RsdoctorRspackPlugin({
        supports: {
          generateTileGraph: true,
        },
        linter: {
          rules: {
            'ecma-version-check': 'off',
          },
        },
      }),
    );
  }

  // Browser bundle with chunks (UMD)
  const uiBrowser = merge(
    entryForVariant(variants.uiBrowser),
    common({ mode, variant: variants.uiBrowser }),
    commonForProdBrowser(),
    { plugins },
  );

  return uiBrowser;
};

/**
 * Development configuration - only builds browser bundle with dev server
 * @param {'development'|'production'} mode
 * @param {object} env
 * @returns {import('@rspack/core').Configuration}
 */
const devConfig = (mode, env) => {
  const devUrl = new URL(env.devOrigin || 'https://ui.lclclerk.com');
  const port = Number(new URL(env.devOrigin ?? 'http://localhost:4011').port || 4011);

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
      client: {
        overlay: {
          errors: true,
          warnings: true,
          runtimeErrors: false,
        },
        webSocketURL: `auto://${devUrl.host}/ws`,
      },
    },
    cache: false,
    experiments: {
      cache: {
        type: 'memory',
      },
    },
  });
};

export default async env => {
  const mode = env.production ? 'production' : 'development';
  return isProduction(mode) ? prodConfig(mode) : devConfig(mode, env);
};

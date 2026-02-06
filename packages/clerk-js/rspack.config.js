// @ts-check
const rspack = require('@rspack/core');
const packageJSON = require('./package.json');
const path = require('path');
const { merge } = require('webpack-merge');
const ReactRefreshPlugin = require('@rspack/plugin-react-refresh');
const { RsdoctorRspackPlugin } = require('@rsdoctor/rspack-plugin');

const isProduction = mode => mode === 'production';
const isDevelopment = mode => !isProduction(mode);

const variants = {
  clerk: 'clerk',
  clerkBrowser: 'clerk.browser',
  clerkBrowserNoRHC: 'clerk.browser.no-rhc',
  clerkCHIPS: 'clerk.chips.browser',
  clerkChannelBrowser: 'clerk.channel.browser',
  clerkExperimentalBrowser: 'clerk.experimental.browser',

  clerkNative: 'clerk.native', // For React Native (no chunk splitting)
  clerkLegacyBrowser: 'clerk.legacy.browser',
  clerkNoRHC: 'clerk.no-rhc', // Omit Remotely Hosted Code
};

const variantToSourceFile = {
  [variants.clerk]: './src/index.ts',
  [variants.clerkBrowser]: './src/index.browser.ts',
  [variants.clerkBrowserNoRHC]: './src/index.browser.ts',
  [variants.clerkCHIPS]: './src/index.browser.ts',
  [variants.clerkChannelBrowser]: './src/index.browser.ts',
  [variants.clerkExperimentalBrowser]: './src/index.browser.ts',

  [variants.clerkNative]: './src/index.ts',
  [variants.clerkLegacyBrowser]: './src/index.legacy.browser.ts',
  [variants.clerkNoRHC]: './src/index.ts',
};

/**
 *
 * @param {object} config
 * @param {'development'|'production'} config.mode
 * @param {string} config.variant
 * @param {boolean} [config.disableRHC=false]
 * @returns { import('@rspack/cli').Configuration }
 */
const common = ({ mode, variant, disableRHC = false }) => {
  return {
    mode,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      // Attempt to resolve these extensions in order
      // @see https://webpack.js.org/configuration/resolve/#resolveextensions
      extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx'],
    },
    plugins: [
      new rspack.DefinePlugin({
        /**
         * Build time feature flags.
         */
        __BUILD_DISABLE_RHC__: JSON.stringify(disableRHC),
        __BUILD_FLAG_KEYLESS_UI__: isDevelopment(mode),
        __BUILD_VARIANT_CHANNEL__: variant === variants.clerkChannelBrowser,
        __BUILD_VARIANT_CHIPS__: variant === variants.clerkCHIPS,
        __BUILD_VARIANT_EXPERIMENTAL__: variant === variants.clerkExperimentalBrowser,
        __DEV__: isDevelopment(mode),
        __PKG_NAME__: JSON.stringify(packageJSON.name),
        __PKG_VERSION__: JSON.stringify(packageJSON.version),
      }),
      new rspack.EnvironmentPlugin({
        CLERK_ENV: mode,
        NODE_ENV: mode,
      }),
      process.env.RSDOCTOR &&
        new RsdoctorRspackPlugin({
          mode: process.env.RSDOCTOR === 'brief' ? 'brief' : 'normal',
          disableClientServer: process.env.RSDOCTOR === 'brief',
          supports: {
            generateTileGraph: true,
          },
        }),
    ].filter(Boolean),
    output: {
      chunkFilename: `[name]_${variant}_[fullhash:6]_${packageJSON.version}.js`,
    },
    /**
     * Remove the Stripe dependencies from the bundle, if RHC is disabled.
     * Necessary to prevent the Stripe dependencies from being bundled into
     * SDKs such as Browser Extensions.
     */
    // TODO: @COMMERCE:  Do we still need this?
    externals: disableRHC
      ? ['@stripe/stripe-js', '@stripe/react-stripe-js', '@coinbase/wallet-sdk', '@base-org/account']
      : undefined,
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
          queryCoreVendor: {
            test: /[\\/]node_modules[\\/](@tanstack\/query-core)[\\/]/,
            name: 'query-core-vendors',
            chunks: 'all',
            enforce: true,
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

/** @type { () => (import('@rspack/core').RuleSetRule) }  */
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

/** @type { () => (import('@rspack/core').RuleSetRule) }  */
const workerLoader = () => {
  return {
    test: /\.worker\.ts$/,
    type: 'asset/source',
    use: {
      loader: 'builtin:swc-loader',
      options: {
        jsc: {
          parser: {
            syntax: 'typescript',
          },
          minify: {
            compress: true,
            mangle: true,
          },
        },
        minify: true,
      },
    },
  };
};

/** @type { (opts?: { targets?: string, useCoreJs?: boolean }) => (import('@rspack/core').RuleSetRule[]) } */
const typescriptLoaderProd = (
  { targets = packageJSON.browserslist, useCoreJs = false } = { targets: packageJSON.browserslist, useCoreJs: false },
) => {
  return [
    {
      test: /\.(jsx?|tsx?)$/,
      exclude: [/node_modules/, /\.worker\.ts$/],
      use: {
        loader: 'builtin:swc-loader',
        options: {
          env: {
            targets,
            ...(useCoreJs
              ? {
                  mode: 'usage',
                  coreJs: require('core-js/package.json').version,
                }
              : {}),
          },
          jsc: {
            parser: {
              syntax: 'typescript',
              tsx: true,
            },
            externalHelpers: true,
            transform: {
              react: {
                runtime: 'automatic',
                importSource: '@emotion/react',
                development: false,
                refresh: false,
              },
            },
          },
        },
      },
    },
    {
      test: /\.m?js$/,
      exclude: /node_modules[\\/]core-js/,
      use: {
        loader: 'builtin:swc-loader',
        options: {
          env: {
            targets,
            ...(useCoreJs
              ? {
                  mode: 'usage',
                  coreJs: '3.41.0',
                }
              : {}),
          },
          isModule: 'unknown',
        },
      },
    },
  ];
};

/** @type { () => (import('@rspack/core').RuleSetRule[]) } */
const typescriptLoaderDev = () => {
  return [
    {
      test: /\.(jsx?|tsx?)$/,
      exclude: [/node_modules/, /\.worker\.ts$/],
      loader: 'builtin:swc-loader',
      options: {
        jsc: {
          target: 'esnext',
          parser: {
            syntax: 'typescript',
            tsx: true,
          },
          externalHelpers: true,
          transform: {
            react: {
              runtime: 'automatic',
              importSource: '@emotion/react',
              development: true,
              refresh: true,
            },
          },
        },
      },
    },
  ];
};

/**
 * Used for production builds that have dynamicly loaded chunks.
 * @type { (opts?: { targets?: string, useCoreJs?: boolean }) => (import('@rspack/core').Configuration) }
 * */
const commonForProdChunked = (
  { targets = packageJSON.browserslist, useCoreJs = false } = { targets: packageJSON.browserslist, useCoreJs: false },
) => {
  return {
    module: {
      rules: [workerLoader(), svgLoader(), ...typescriptLoaderProd({ targets, useCoreJs })],
    },
  };
};

/**
 * Used for production builds that combine all files into one single file (such as for Chrome Extensions).
 * @type { (opts?: { targets?: string, useCoreJs?: boolean }) => (import('@rspack/core').Configuration) }
 * */
const commonForProdBundled = (
  { targets = packageJSON.browserslist, useCoreJs = false } = { targets: packageJSON.browserslist, useCoreJs: false },
) => {
  return {
    module: {
      rules: [workerLoader(), svgLoader(), ...typescriptLoaderProd({ targets, useCoreJs })],
    },
  };
};

/** @type { () => (import('@rspack/core').Configuration) } */
const commonForProd = () => {
  return {
    devtool: false,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      libraryTarget: 'umd',
      globalObject: 'globalThis',
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
    plugins: [
      // new webpack.optimize.LimitChunkCountPlugin({
      //   maxChunks: 5,
      // }),
      // new webpack.optimize.MinChunkSizePlugin({
      //   minChunkSize: 10000,
      // })
    ],
    resolve: {
      alias: {
        // SWC will inject imports to `core-js` into the source files that utilize polyfilled functions. Because we
        // use pnpm, imports from other packages (like `packages/shared`) will not resolve. This alias forces rspack
        // to resolve all `core-js` imports to the version we have installed in `clerk-js`.
        'core-js': path.dirname(require.resolve('core-js/package.json')),
      },
    },
  };
};

/**
 *
 * @param {string} variant
 * @returns {import('@rspack/core').Configuration}
 */
const entryForVariant = variant => {
  return { entry: { [variant]: variantToSourceFile[variant] } };
};

/**
 *
 * @param {object} config
 * @param {'development'|'production'} config.mode
 * @param {boolean} config.analysis
 * @param {object} config.env
 * @returns {(import('@rspack/core').Configuration)[]}
 */
const prodConfig = ({ mode, env, analysis }) => {
  const isSandbox = !!env.sandbox;

  const clerkBrowser = merge(
    entryForVariant(variants.clerkBrowser),
    isSandbox
      ? {
          entry: { sandbox: './sandbox/app.ts' },
          plugins: [
            new rspack.CopyRspackPlugin({
              patterns: [{ from: path.resolve(__dirname, '../ui/dist/*.js'), to: '[name][ext]' }],
            }),
            new rspack.HtmlRspackPlugin({
              minify: false,
              template: './sandbox/template.html',
              inject: false,
              hash: true,
              templateParameters: {
                uiScriptUrl: './ui.browser.js',
              },
            }),
          ],
        }
      : {},
    common({ mode, variant: variants.clerkBrowser }),
    commonForProd(),
    commonForProdChunked(),
  );

  const clerkExperimentalBrowser = merge(
    entryForVariant(variants.clerkExperimentalBrowser),
    common({ mode, variant: variants.clerkExperimentalBrowser }),
    commonForProd(),
    commonForProdChunked(),
  );

  const clerkLegacyBrowser = merge(
    entryForVariant(variants.clerkLegacyBrowser),
    common({ mode, variant: variants.clerkLegacyBrowser }),
    commonForProd(),
    commonForProdChunked({ targets: packageJSON.browserslistLegacy, useCoreJs: true }),
  );

  const clerkNative = merge(
    entryForVariant(variants.clerkNative),
    common({ mode, variant: variants.clerkNative }),
    commonForProd(),
    commonForProdChunked(),
    // Disable chunking for the native variant, since it's meant to be used in React Native
    // where dynamic chunk loading is not supported.
    {
      output: {
        publicPath: '',
      },
      optimization: {
        splitChunks: false,
      },
    },
  );

  const clerkCHIPS = merge(
    entryForVariant(variants.clerkCHIPS),
    common({ mode, variant: variants.clerkCHIPS }),
    commonForProd(),
    commonForProdChunked(),
  );

  const clerkEsm = merge(
    entryForVariant(variants.clerk),
    common({ mode, variant: variants.clerk }),
    commonForProd(),
    commonForProdBundled(),
    {
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
        new rspack.optimize.LimitChunkCountPlugin({
          maxChunks: 1,
        }),
      ],
      optimization: {
        splitChunks: false,
      },
    },
  );

  const clerkCjs = merge(
    entryForVariant(variants.clerk),
    common({ mode, variant: variants.clerk }),
    commonForProd(),
    commonForProdBundled(),
    {
      output: {
        filename: '[name].js',
        libraryTarget: 'commonjs',
      },
      plugins: [
        // Include the lazy chunks in the bundle as well
        // so that the final bundle can be imported and bundled again
        // by a different bundler, eg the webpack instance used by react-scripts
        new rspack.optimize.LimitChunkCountPlugin({
          maxChunks: 1,
        }),
      ],
      optimization: {
        splitChunks: false,
      },
    },
  );

  /** @type { () => (import('@rspack/core').Configuration) } */
  const commonForNoRHC = () => ({
    plugins: [
      new rspack.IgnorePlugin({
        resourceRegExp: /^@stripe\/stripe-js$/,
      }),
      new rspack.IgnorePlugin({
        resourceRegExp: /^@coinbase\/wallet-sdk$/,
      }),
      new rspack.IgnorePlugin({
        resourceRegExp: /^@base-org\/account$/,
      }),
      new rspack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
    ],
    optimization: {
      splitChunks: false,
    },
  });

  const clerkEsmNoRHC = merge(
    entryForVariant(variants.clerkNoRHC),
    common({ mode, disableRHC: true, variant: variants.clerkNoRHC }),
    commonForProd(),
    commonForProdBundled(),
    commonForNoRHC(),
    {
      experiments: {
        outputModule: true,
      },
      output: {
        filename: '[name].mjs',
        libraryTarget: 'module',
      },
    },
  );

  const clerkCjsNoRHC = merge(
    entryForVariant(variants.clerkNoRHC),
    common({ mode, disableRHC: true, variant: variants.clerkNoRHC }),
    commonForProd(),
    commonForProdBundled(),
    commonForNoRHC(),
    {
      output: {
        filename: '[name].js',
        libraryTarget: 'commonjs',
      },
    },
  );

  // webpack-bundle-analyzer only supports a single build, use clerkBrowser as that's the default build we serve
  if (analysis) {
    return [clerkBrowser];
  }

  return [
    clerkBrowser,
    clerkExperimentalBrowser,
    clerkLegacyBrowser,
    clerkNative,
    clerkCHIPS,
    clerkEsm,
    clerkEsmNoRHC,
    clerkCjs,
    clerkCjsNoRHC,
  ];
};

/**
 *
 * @param {object} config
 * @param {'development'|'production'} config.mode
 * @param {object} config.env
 * @returns
 */
const devConfig = ({ mode, env }) => {
  const variant = env.variant || variants.clerkBrowser;
  // accept an optional devOrigin environment option to change the origin of the dev server.
  // By default we use https://js.lclclerk.com which is what our local dev proxy looks for.
  const devUrl = new URL(env.devOrigin || 'https://js.lclclerk.com');
  const isSandbox = !!env.sandbox;
  const port = Number(new URL(env.devOrigin ?? 'http://localhost:4000').port || 4000);

  /** @type {() => import('@rspack/core').Configuration} */
  const commonForDev = () => {
    return {
      module: {
        rules: [workerLoader(), svgLoader(), ...typescriptLoaderDev()],
      },
      plugins: [
        new ReactRefreshPlugin(/** @type {any} **/ ({ overlay: { sockHost: devUrl.host } })),
        isSandbox &&
          new rspack.HtmlRspackPlugin({
            minify: false,
            template: './sandbox/template.html',
            inject: false,
            templateParameters: {
              uiScriptUrl: 'http://localhost:4011/npm/ui.browser.js',
            },
          }),
      ].filter(Boolean),
      devtool: 'eval-cheap-source-map',
      output: {
        publicPath: isSandbox ? `` : `${devUrl.origin}/npm`,
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
        ...(isSandbox
          ? {
              historyApiFallback: true,
              static: ['sandbox/public'],
            }
          : {}),
      },
      cache: true,
      experiments: {
        cache: {
          type: 'memory',
        },
      },
    };
  };

  const entryToConfigMap = {
    // prettier-ignore
    [variants.clerk]: merge(
      entryForVariant(variants.clerk),
      common({ mode, variant: variants.clerk }),
      commonForDev(),
    ),
    // prettier-ignore
    [variants.clerkBrowser]: merge(
      entryForVariant(variants.clerkBrowser),
      isSandbox ? { entry: { sandbox: './sandbox/app.ts' } } : {},
      common({ mode, variant: variants.clerkBrowser }),
      commonForDev(),
    ),
    // prettier-ignore
    [variants.clerkBrowserNoRHC]: merge(
      entryForVariant(variants.clerkBrowserNoRHC),
      common({ mode, disableRHC: true, variant: variants.clerkBrowserNoRHC }),
      commonForDev(),
    ),
    [variants.clerkCHIPS]: merge(
      entryForVariant(variants.clerkCHIPS),
      common({ mode, variant: variants.clerkCHIPS }),
      commonForDev(),
    ),
    [variants.clerkChannelBrowser]: merge(
      entryForVariant(variants.clerkChannelBrowser),
      common({ mode, variant: variants.clerkChannelBrowser }),
      commonForDev(),
    ),
    [variants.clerkExperimentalBrowser]: merge(
      entryForVariant(variants.clerkExperimentalBrowser),
      common({ mode, variant: variants.clerkExperimentalBrowser }),
      commonForDev(),
    ),

    [variants.clerkNative]: merge(
      entryForVariant(variants.clerkNative),
      common({ mode, variant: variants.clerkNative }),
      commonForDev(),
    ),
  };

  if (!entryToConfigMap[variant]) {
    throw new Error('Clerk variant does not exist in config');
  }

  return entryToConfigMap[variant];
};

module.exports = env => {
  const mode = env.production ? 'production' : 'development';
  const analysis = !!env.analysis;

  return isProduction(mode) ? prodConfig({ mode, env, analysis }) : devConfig({ mode, env });
};

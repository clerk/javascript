// @ts-check
/**
 * Common rspack configuration utilities shared between packages
 */

/**
 * SVG loader configuration using SVGR
 * @returns {import('@rspack/core').RuleSetRule}
 */
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

/**
 * TypeScript loader for production builds
 * @param {object} [options]
 * @param {string} [options.targets] - Browserslist targets
 * @param {boolean} [options.useCoreJs] - Whether to use core-js polyfills
 * @returns {import('@rspack/core').RuleSetRule[]}
 */
const typescriptLoaderProd = ({ targets, useCoreJs = false } = {}) => {
  return [
    {
      test: /\.(jsx?|tsx?)$/,
      exclude: /node_modules/,
      use: {
        loader: 'builtin:swc-loader',
        options: {
          env: {
            ...(targets ? { targets } : {}),
            ...(useCoreJs
              ? {
                  mode: 'usage',
                  // eslint-disable-next-line @typescript-eslint/no-require-imports
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
            ...(targets ? { targets } : {}),
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

/**
 * TypeScript loader for development builds
 * @returns {import('@rspack/core').RuleSetRule[]}
 */
const typescriptLoaderDev = () => {
  return [
    {
      test: /\.(jsx?|tsx?)$/,
      exclude: /node_modules/,
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

module.exports = {
  svgLoader,
  typescriptLoaderProd,
  typescriptLoaderDev,
};

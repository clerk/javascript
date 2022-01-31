/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = {
  entry: {
    clerk: './src/index.ts',
    'clerk.browser': './src/index.browser.ts',
    'clerk.nocomponents': './src/index.nocomponents.ts',
    'clerk.nocomponents.browser': './src/index.nocomponents.browser.ts',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    fallback: {
      querystring: require.resolve('querystring-es3'),
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    corejs: 3,
                    useBuiltIns: 'usage',
                  },
                ],
                '@babel/preset-typescript',
                '@babel/preset-react',
              ],
              plugins: [
                [
                  'module-resolver',
                  {
                    alias: {
                      core: './src/core',
                      ui: './src/ui',
                      utils: './src/utils',
                    },
                  },
                ],
                '@babel/proposal-class-properties',
                '@babel/proposal-object-rest-spread',
              ],
            },
          },
        ],
      },
      {
        test: /\.scss$/, // Matches only global scss files for Clerk components e.g. main.scss, _button.scss, etc...
        exclude: /\.module.scss$/,
        use: [
          'style-loader', // creates style nodes from JS strings
          'css-loader', // translates CSS into CommonJS
          {
            loader: 'postcss-loader', // namespace styles
            options: {
              postcssOptions: {
                plugins: [
                  require('postcss-prefixer')({
                    prefix: 'cl-',
                  }),
                  require('autoprefixer'),
                ],
              },
            },
          },
          'sass-loader', // compiles Sass to CSS, using Node Sass by default
        ],
      },
    ],
  },
};

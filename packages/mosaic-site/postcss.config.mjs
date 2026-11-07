import { createRequire } from 'module';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

const mosaicRoot = resolve(__dirname, '../mosaic');
const isDev = process.env.NODE_ENV !== 'production';

const stylexExtraction = {
  '@stylexjs/postcss-plugin': {
    include: [resolve(mosaicRoot, 'src/**/*.{ts,tsx}')],
    useCSSLayers: true,
    babelConfig: {
      babelrc: false,
      configFile: false,
      presets: [require('@babel/preset-typescript')],
      plugins: [
        require('@babel/plugin-syntax-jsx'),
        [
          require('@stylexjs/babel-plugin'),
          {
            dev: isDev,
            runtimeInjection: false,
            unstable_moduleResolution: { type: 'commonJS', rootDir: mosaicRoot },
            aliases: { '@clerk/mosaic/*': [resolve(mosaicRoot, 'src/*')] },
          },
        ],
      ],
    },
  },
};

export default {
  plugins: {
    ...stylexExtraction,
    '@tailwindcss/postcss': {},
  },
};

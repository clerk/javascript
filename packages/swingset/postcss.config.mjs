import { createRequire } from 'module';
import { resolve } from 'path';

const require = createRequire(import.meta.url);
const __dirname = process.cwd();

const mosaicRoot = resolve(__dirname, '../mosaic');
const isDev = process.env.NODE_ENV !== 'production';

// Extract token defaults and atoms from the Mosaic and Swingset sources
// Keep the Babel options aligned with next.config.mjs so class names match
// Watch the token module directly so edits rebuild the generated defaults
const stylexExtraction = {
  '@stylexjs/postcss-plugin': {
    include: [
      resolve(__dirname, 'src/**/*.{ts,tsx}'),
      resolve(mosaicRoot, 'src/**/*.{ts,tsx}'),
      resolve(mosaicRoot, 'src/tokens.stylex.ts'),
    ],
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

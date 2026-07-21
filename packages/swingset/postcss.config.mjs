import { createRequire } from 'module';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

// StyleX CSS extraction. The `@stylexjs/postcss-plugin` scans the Mosaic source, runs the
// StyleX babel transform itself, and replaces the `@stylex;` directive in `globals.css` with
// the generated CSS (token `:root` defaults + atoms). This is the CSS half of the setup; the
// JS half is the unplugin in `next.config.mjs`. Both must use the SAME StyleX babel version
// and options (`dev`, `rootDir`) so the atom class hashes line up.
const uiRoot = resolve(__dirname, '../ui');

export default {
  plugins: {
    '@stylexjs/postcss-plugin': {
      // `../ui/src/mosaic` is consumed from source (aliased), so point the scanner at it
      // explicitly — auto-discovery only walks the package's own tree and direct deps.
      include: [resolve(uiRoot, 'src/mosaic/**/*.{ts,tsx}')],
      useCSSLayers: false,
      babelConfig: {
        babelrc: false,
        configFile: false,
        presets: [require('@babel/preset-typescript')],
        plugins: [
          require('@babel/plugin-syntax-jsx'),
          [
            require('@stylexjs/babel-plugin'),
            {
              dev: process.env.NODE_ENV !== 'production',
              runtimeInjection: false,
              unstable_moduleResolution: { type: 'commonJS', rootDir: uiRoot },
            },
          ],
        ],
      },
    },
    '@tailwindcss/postcss': {},
  },
};

import { createRequire } from 'module';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

const uiRoot = resolve(__dirname, '../ui');
const isDev = process.env.NODE_ENV !== 'production';

// StyleX CSS: two mutually-exclusive strategies by env, so editing Mosaic source hot-reloads.
//
// - Prod: `@stylexjs/postcss-plugin` scans the Mosaic source, runs the StyleX babel transform,
//   and replaces the `@stylex;` directive in `globals.css` with the generated CSS (token `:root`
//   defaults + atoms). Static, layered, no runtime. Its babel `dev`/`rootDir` must match the
//   unplugin in `next.config.mjs` so atom hashes line up.
// - Dev: this plugin is OMITTED. Next never re-runs the `globals.css` PostCSS pass when a
//   `.styles.ts` file (outside the CSS import graph) changes, so the extracted sheet goes stale.
//   Instead the unplugin injects StyleX at runtime (`runtimeInjection`, see `next.config.mjs`),
//   which HMR tracks. The leftover `@stylex;` directive is harmlessly consumed by Tailwind.
const stylexExtraction = isDev
  ? {}
  : {
      '@stylexjs/postcss-plugin': {
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
                dev: false,
                runtimeInjection: false,
                unstable_moduleResolution: { type: 'commonJS', rootDir: uiRoot },
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

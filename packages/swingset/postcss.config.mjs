import { createRequire } from 'module';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

const uiRoot = resolve(__dirname, '../ui');
const isDev = process.env.NODE_ENV !== 'production';

// StyleX CSS. `@stylexjs/postcss-plugin` scans the Mosaic source, runs the StyleX babel
// transform, and replaces the `@stylex;` directive in `globals.css` with the generated CSS:
// the token `:root { --cl-* }` defaults *and* the atoms. This runs in BOTH dev and prod
// because it is the only thing that emits the `:root` token defaults — StyleX's `defineVars`
// is compile-time-only (its runtime export throws), so `runtimeInjection` alone leaves every
// `var(--cl-*)` unresolved (unstyled). Its babel `dev`/`rootDir` must match the unplugin in
// `next.config.mjs` so atom hashes line up.
//
// In dev this sheet goes stale on `.styles.ts` edits (Next won't re-run the `globals.css`
// PostCSS pass for files outside the CSS import graph), but that's fine: the unplugin's
// `runtimeInjection` (see `next.config.mjs`) injects the *fresh* atom at runtime under a new
// content hash, which HMR tracks. The stale extracted atom is dead CSS; the `:root` token
// defaults never change mid-session, so they stay correct.
const stylexExtraction = {
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
            dev: isDev,
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

import stylexPlugin from '@stylexjs/unplugin/webpack';
import createMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { mosaicLightningCssTargets } from '../ui/stylex-lightningcss.config.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      [
        rehypeRaw,
        {
          passThrough: ['mdxjsEsm', 'mdxJsxFlowElement', 'mdxJsxTextElement', 'mdxFlowExpression', 'mdxTextExpression'],
        },
      ],
    ],
    allowDangerousHtml: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['tsx', 'ts', 'mdx'],
  webpack(config) {
    // `import src from './foo.stories.tsx?raw'` must return the file's *untransformed* text.
    // Next's SWC loader matches by extension and ignores the `?raw` query, so on its own it
    // would compile the file before our `asset/source` rule captures it (yielding `_jsxDEV(…)`
    // output instead of source). Exclude `?raw` from every existing loader, then emit the raw
    // bytes ourselves. Story modules self-import this way to expose `__source` for the
    // `<Story>` code footer.
    const excludeRawQuery = rules => {
      for (const rule of rules) {
        if (!rule || typeof rule !== 'object') {
          continue;
        }
        if (Array.isArray(rule.oneOf)) {
          excludeRawQuery(rule.oneOf);
        }
        if (Array.isArray(rule.rules)) {
          excludeRawQuery(rule.rules);
        }
        if (rule.oneOf || rule.rules || rule.type === 'asset/source') {
          continue;
        }
        if (!rule.resourceQuery) {
          rule.resourceQuery = { not: [/raw/] };
        } else if (rule.resourceQuery.not) {
          rule.resourceQuery.not.push(/raw/);
        }
      }
    };
    excludeRawQuery(config.module.rules);
    config.module.rules.push({ resourceQuery: /raw/, type: 'asset/source' });

    // Swingset consumes Mosaic from source, so StyleX (`defineVars`/`create`/`props`) must be
    // compiled here — otherwise the calls hit the runtime and throw. The unplugin transforms the
    // StyleX *JS only*, keeping SWC intact so `next/font` and the Emotion transform keep working.
    //
    // The `@stylexjs/postcss-plugin` (see `postcss.config.mjs`) is what extracts the CSS — the
    // token `:root { --cl-* }` defaults and the atoms — in both dev and prod. This unplugin only
    // transforms the StyleX *calls* in the JS. `runtimeInjection` forks by env:
    // - Prod: `false`. Atoms are static class refs resolved against the extracted sheet.
    // - Dev: `true`. On top of the extracted sheet, StyleX also injects each atom at runtime under
    //   its content hash, so editing a `.styles.ts` file hot-reloads a fresh atom (the extracted
    //   sheet goes stale because Next won't re-run the `globals.css` PostCSS pass on Mosaic-source
    //   edits). The `:root` token defaults come from the extraction and never change mid-session,
    //   so they stay correct — `runtimeInjection` can't emit them (`defineVars` is compile-only).
    // Both passes share the same babel version/options so atom hashes match.
    const isDev = process.env.NODE_ENV !== 'production';
    config.plugins.push(
      stylexPlugin({
        dev: isDev,
        runtimeInjection: isDev,
        unstable_moduleResolution: { type: 'commonJS', rootDir: resolve(__dirname, '../ui') },
        useCSSLayers: true,
        lightningcssOptions: { targets: mosaicLightningCssTargets },
      }),
    );

    config.resolve.alias['@clerk/ui/mosaic'] = resolve(__dirname, '../ui/src/mosaic');
    // Consume @clerk/headless primitives from source (no dist build needed), mirroring Mosaic.
    // `/hooks` and `/utils` live outside `primitives/`, so alias them first (more specific wins).
    config.resolve.alias['@clerk/headless/hooks'] = resolve(__dirname, '../headless/src/hooks');
    config.resolve.alias['@clerk/headless/utils'] = resolve(__dirname, '../headless/src/utils');
    config.resolve.alias['@clerk/headless'] = resolve(__dirname, '../headless/src/primitives');
    return config;
  },
};

export default withMDX(nextConfig);

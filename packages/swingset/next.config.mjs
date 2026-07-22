import stylexPlugin from '@stylexjs/unplugin/webpack';
import createMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Match the isolated `@clerk/ui` mosaic build: pin browsers that natively support
// `light-dark()`/`oklch()` so lightningcss keeps the token colors verbatim instead of
// down-leveling them into an invalid polyfill. Encoding is (major << 16) | (minor << 8).
const version = (major, minor = 0) => (major << 16) | (minor << 8);
const stylexTargets = {
  chrome: version(123),
  edge: version(123),
  firefox: version(120),
  safari: version(17, 5),
  ios_saf: version(17, 5),
};

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
  compiler: {
    emotion: true,
  },
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
    // compiled here — otherwise the calls hit the runtime and throw. The plugin transforms the
    // aliased `../ui/src/mosaic` files and appends the collected CSS into `globals.css`. Match the
    // published build (`tsdown.mosaic.config.mts`): `useCSSLayers: true` so atoms carry StyleX's
    // `@layer priorityN` precedence, the same CSS real consumers import.
    // The unplugin only compiles the StyleX *JS* here (turns `defineVars`/`create`/`props`
    // into static atom references so nothing hits the runtime). It keeps SWC intact, so
    // `next/font` and the Emotion transform keep working. The actual CSS is emitted by the
    // `@stylexjs/postcss-plugin` into `globals.css` (`@stylex`), which is why this runs in
    // extraction mode (no `runtimeInjection`) — the two share the same StyleX babel version
    // and options, so the atom hashes match. The plugin's dev "no CSS asset" warning is
    // expected and harmless: CSS delivery is postcss's job, not the bundler's.
    config.plugins.push(
      stylexPlugin({
        dev: process.env.NODE_ENV !== 'production',
        unstable_moduleResolution: { type: 'commonJS', rootDir: resolve(__dirname, '../ui') },
        useCSSLayers: true,
        lightningcssOptions: { targets: stylexTargets },
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

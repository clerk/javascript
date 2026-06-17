import createMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

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

    config.module.rules.push({
      test: /\.svg$/,
      resourceQuery: { not: [/raw/] },
      use: [
        {
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
      ],
    });

    config.resolve.alias['@clerk/ui/mosaic'] = resolve(__dirname, '../ui/src/mosaic');
    // Consume @clerk/headless primitives from source (no dist build needed), mirroring Mosaic.
    // `/utils` lives outside `primitives/`, so alias it first (more specific wins).
    config.resolve.alias['@clerk/headless/utils'] = resolve(__dirname, '../headless/src/utils');
    config.resolve.alias['@clerk/headless'] = resolve(__dirname, '../headless/src/primitives');
    return config;
  },
};

export default withMDX(nextConfig);

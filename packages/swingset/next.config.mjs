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
    config.resolve.alias['@clerk/ui/mosaic'] = resolve(__dirname, '../ui/src/mosaic');
    // Consume @clerk/headless primitives from source (no dist build needed), mirroring Mosaic.
    // `/utils` lives outside `primitives/`, so alias it first (more specific wins).
    config.resolve.alias['@clerk/headless/utils'] = resolve(__dirname, '../headless/src/utils');
    config.resolve.alias['@clerk/headless'] = resolve(__dirname, '../headless/src/primitives');
    // `import src from './x?raw'` returns the file's untransformed source as a string —
    // powers the `<Story>` "Code" footer. Registered as a `pre` loader so it runs first and
    // sees the original bytes; the downstream SWC pass only re-emits the resulting string
    // literal, so the source survives intact. See scripts/raw-loader.cjs.
    config.module.rules.push({
      resourceQuery: /raw/,
      enforce: 'pre',
      use: [{ loader: resolve(__dirname, 'scripts/raw-loader.cjs') }],
    });
    return config;
  },
};

export default withMDX(nextConfig);

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
    config.resolve.alias['@clerk/headless'] = resolve(__dirname, '../headless/src/primitives');
    return config;
  },
};

export default withMDX(nextConfig);

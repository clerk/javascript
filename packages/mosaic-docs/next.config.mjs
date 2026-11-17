import { fileURLToPath } from 'node:url';

import createMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  rewrites() {
    return [
      { source: '/docs.md', destination: '/llms.mdx/docs' },
      { source: '/docs/:path*.md', destination: '/llms.mdx/docs/:path*' },
    ];
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [fileURLToPath(new URL('./src/mdx/remark-headings.ts', import.meta.url))],
  },
});

export default withMDX(nextConfig);

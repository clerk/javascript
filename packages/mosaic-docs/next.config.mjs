import { fileURLToPath } from 'node:url';

import createMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  redirects() {
    return [
      { source: '/docs', destination: '/docs/setup', permanent: true },
      { source: '/docs.md', destination: '/docs/setup.md', permanent: true },
    ];
  },
  rewrites() {
    return [{ source: '/docs/:path*.md', destination: '/llms.mdx/docs/:path*' }];
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [fileURLToPath(new URL('./src/core/remark-headings.ts', import.meta.url))],
  },
});

export default withMDX(nextConfig);

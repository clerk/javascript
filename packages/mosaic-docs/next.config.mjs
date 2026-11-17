/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites() {
    return [
      { source: '/docs.md', destination: '/llms.mdx/docs' },
      { source: '/docs/:path*.md', destination: '/llms.mdx/docs/:path*' },
    ];
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Served at clerk.com/mosaic.
  basePath: '/mosaic',
  outputFileTracingIncludes: { '/**': ['./.content/**/*.json'] },
};

export default nextConfig;

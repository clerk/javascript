/** @type {import('next').NextConfig} */
const nextConfig = {
  // Served from the root of mosaic.clerk.com.
  outputFileTracingIncludes: { '/**': ['./.content/**/*.json'] },
};

export default nextConfig;

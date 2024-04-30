/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable React strict mode when using the state machine inspector
  reactStrictMode: process.env['NEXT_PUBLIC_CLERK_ELEMENTS_DEBUG'] !== 'true',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;

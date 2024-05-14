/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable React strict mode when using the state machine inspector
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;

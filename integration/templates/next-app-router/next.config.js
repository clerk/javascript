/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: true,
    authInterrupts: true,
  },
  outputFileTracingRoot: '/',
};

module.exports = nextConfig;

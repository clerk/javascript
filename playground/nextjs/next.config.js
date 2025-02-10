/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configure webpack NOT to ignore node_modules changes for HMR
  webpack: config => {
    config.snapshot = {
      ...(config.snapshot ?? {}),
      // Add all node_modules but @next module to managedPaths
      // Allows for hot refresh of changes to @next module
      managedPaths: [/^(.+?[\\/]node_modules[\\/])(?!@next)/],
    };
    return config;
  },
};

module.exports = nextConfig;

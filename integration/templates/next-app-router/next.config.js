const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  outputFileTracingRoot: path.resolve(__dirname, '../../../'),
  webpack: config => {
    // Exclude macOS .Trash directory and other system directories to prevent permission errors
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/.Trash/**', '**/node_modules/**', '**/.git/**'],
    };
    return config;
  },
};

module.exports = nextConfig;

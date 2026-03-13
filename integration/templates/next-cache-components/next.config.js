const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.resolve(__dirname, '../../../'),
  cacheComponents: true,
};

module.exports = nextConfig;

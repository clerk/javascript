import stylexPlugin from '@stylexjs/unplugin/webpack';
import { createRequire } from 'module';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import { mosaicLightningCssTargets } from '../mosaic/stylex-lightningcss.config.mjs';

const require = createRequire(import.meta.url);
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const swingsetSrc = resolve(__dirname, '../swingset/src');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    const isDev = process.env.NODE_ENV !== 'production';
    config.plugins.push(
      stylexPlugin({
        dev: isDev,
        runtimeInjection: isDev,
        unstable_moduleResolution: { type: 'commonJS', rootDir: resolve(__dirname, '../mosaic') },
        aliases: { '@clerk/mosaic/*': [resolve(__dirname, '../mosaic/src/*')] },
        useCSSLayers: true,
        lightningcssOptions: { targets: mosaicLightningCssTargets },
      }),
    );

    if (isDev) {
      config.module.rules.push({
        test: /[\\/]@stylexjs[\\/]stylex[\\/]lib[\\/](es|cjs)[\\/]inject\.(mjs|js)$/,
        use: [{ loader: resolve(swingsetSrc, 'lib/loaders/stylex-inject-named-container.cjs') }],
      });
    }

    config.resolve.alias['@clerk/mosaic'] = resolve(__dirname, '../mosaic/src');
    config.resolve.alias['@swingset'] = swingsetSrc;
    config.resolve.alias['@/lib/chaos'] = resolve(swingsetSrc, 'lib/chaos');
    config.resolve.alias['@/components/ChaosProvider'] = resolve(swingsetSrc, 'components/ChaosProvider');
    config.resolve.alias['@floating-ui/react'] = dirname(require.resolve('@floating-ui/react/package.json'));
    return config;
  },
};

export default nextConfig;

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
  env: { NEXT_PUBLIC_MOSAIC_VERSION: require('../mosaic/package.json').version },
  redirects() {
    return Promise.resolve(
      process.env.MOSAIC_BRAND === '1' ? [{ source: '/', destination: '/brand', permanent: false }] : [],
    );
  },
  webpack(config) {
    const excludeRawQuery = rules => {
      for (const rule of rules) {
        if (!rule || typeof rule !== 'object') {
          continue;
        }
        if (Array.isArray(rule.oneOf)) {
          excludeRawQuery(rule.oneOf);
        }
        if (Array.isArray(rule.rules)) {
          excludeRawQuery(rule.rules);
        }
        if (rule.oneOf || rule.rules || rule.type === 'asset/source') {
          continue;
        }
        if (!rule.resourceQuery) {
          rule.resourceQuery = { not: [/raw/] };
        } else if (rule.resourceQuery.not) {
          rule.resourceQuery.not.push(/raw/);
        }
      }
    };
    excludeRawQuery(config.module.rules);
    config.module.rules.push({ resourceQuery: /raw/, type: 'asset/source' });
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
    config.resolve.alias['@/lib/chaos'] = resolve(__dirname, 'src/lib/chaos-off');
    config.resolve.alias['@/components/ChaosProvider'] = resolve(__dirname, 'src/lib/chaos-off');
    config.resolve.alias['@floating-ui/react'] = dirname(require.resolve('@floating-ui/react/package.json'));
    return config;
  },
};

export default nextConfig;

import { fileURLToPath, URL } from 'url';
import { resolve } from 'path';

import react from '@vitejs/plugin-react-swc';
import { crx, ManifestV3Export } from '@crxjs/vite-plugin';
import { defineConfig } from 'vite';

import manifest from './manifest.json';
import devManifest from './manifest.dev.json';
import pkg from './package.json';

const isDev = process.env.__DEV__ === 'true';

const extensionManifest = {
  ...manifest,
  ...(isDev ? devManifest : {} as ManifestV3Export),
  name: isDev ? `[DEV] ${manifest.name}` : manifest.name,
  version: pkg.version,
};

const crxPlugin = crx({
  manifest: extensionManifest as ManifestV3Export,
  contentScripts: {
    injectCss: true,
  }
})

export default defineConfig({
  resolve: {
    alias: [
      { find: '@/', replacement: fileURLToPath(new URL('./src/', import.meta.url)) },
    ],
  },
  plugins: [
    react(),
    crxPlugin,
  ],
  publicDir: resolve(__dirname, 'public'),
  build: {
    emptyOutDir: !isDev,
    outDir: resolve(__dirname, 'dist'),
    minify: !isDev,
    sourcemap: isDev,
    rollupOptions: {
      input: {
        panel: 'src/pages/panel/index.html',
      },
    },
  },
});

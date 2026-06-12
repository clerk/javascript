import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { setupMain } from '@clerk/electron';
import { storage } from '@clerk/electron/storage';
import { app, BrowserWindow, net, protocol } from 'electron';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RENDERER_SCHEME = 'clerk';
const RENDERER_HOST = 'app';
// electron-vite sets this in dev. Its presence is how we pick proxy vs. file serving.
const DEV_SERVER_URL = process.env.ELECTRON_RENDERER_URL;
const rendererRoot = path.resolve(__dirname, 'dist');

const clerk = setupMain({
  storage: storage(),
  renderer: {
    scheme: RENDERER_SCHEME,
    host: RENDERER_HOST,
  },
});

async function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.resolve(__dirname, 'preload.mjs'),
      sandbox: false,
    },
  });

  await win.loadURL(`${RENDERER_SCHEME}://${RENDERER_HOST}/`);
}

function registerClerkAppProtocol() {
  protocol.handle(RENDERER_SCHEME, async request => {
    const url = new URL(request.url);

    // Only the app host serves the UI. Other hosts can be reserved for deep links.
    if (url.host !== RENDERER_HOST) {
      return new Response('Not found', { status: 404 });
    }

    // Dev: proxy to Vite so the renderer always runs from clerk://app.
    if (DEV_SERVER_URL) {
      const target = new URL(url.pathname + url.search, DEV_SERVER_URL);
      // Intentionally do not forward the renderer's request headers to localhost.
      const init = { method: request.method };

      if (request.method !== 'GET' && request.method !== 'HEAD') {
        init.body = request.body;
        init.duplex = 'half';
      }

      try {
        return await net.fetch(target.toString(), init);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('[clerk-app-protocol] dev proxy failed', {
          requested: request.url,
          target: target.toString(),
          devServer: DEV_SERVER_URL,
          error: message,
        });
        return new Response(`clerk://app dev proxy error: ${message}`, { status: 502 });
      }
    }

    // Prod: serve the bundled renderer with a traversal guard and SPA fallback.
    const requestedPath = decodeURIComponent(url.pathname);
    const resolvedPath = path.resolve(rendererRoot, `.${requestedPath}`);

    if (resolvedPath !== rendererRoot && !resolvedPath.startsWith(rendererRoot + path.sep)) {
      return new Response(null, { status: 403 });
    }

    const hasExtension = /\.[^/]+$/.test(url.pathname);
    const filePath = hasExtension ? resolvedPath : path.join(rendererRoot, 'index.html');

    return net.fetch(pathToFileURL(filePath).toString());
  });
}

app.whenReady().then(async () => {
  registerClerkAppProtocol();
  await createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('before-quit', () => {
  clerk.cleanup();
});

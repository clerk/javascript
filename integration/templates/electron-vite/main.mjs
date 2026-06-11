import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { setupMain } from '@clerk/electron';
import { app, BrowserWindow, net, protocol } from 'electron';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RENDERER_SCHEME = 'clerk-electron';
const RENDERER_HOST = 'renderer';
const rendererRoot = path.resolve(__dirname, 'dist');
const tokens = new Map();

const clerk = setupMain({
  storage: {
    getItem: key => tokens.get(key) ?? null,
    setItem: (key, value) => {
      tokens.set(key, value);
    },
    removeItem: key => {
      tokens.delete(key);
    },
  },
  renderer: {
    scheme: RENDERER_SCHEME,
    host: RENDERER_HOST,
  },
});

function resolveRendererPath(requestUrl) {
  const url = new URL(requestUrl);
  if (url.host !== RENDERER_HOST) {
    return null;
  }

  const pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const filePath = path.resolve(rendererRoot, `.${pathname}`);
  const relativePath = path.relative(rendererRoot, filePath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return null;
  }

  return filePath;
}

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

app.whenReady().then(async () => {
  protocol.handle(RENDERER_SCHEME, request => {
    const filePath = resolveRendererPath(request.url);

    if (!filePath) {
      return new Response('Not found', { status: 404 });
    }

    return net.fetch(pathToFileURL(filePath).toString());
  });

  await createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('before-quit', () => {
  clerk.cleanup();
});

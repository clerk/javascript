import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { createClerkBridge } from '@clerk/electron';
import { storage } from '@clerk/electron/storage';
import { app, BrowserWindow, net, protocol } from 'electron';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RENDERER_SCHEME = 'clerk';
const RENDERER_HOST = 'app';
const rendererRoot = path.resolve(__dirname, 'dist');

const clerk = createClerkBridge({
  storage: storage({ unencryptedFallback: true }),
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

    if (url.host !== RENDERER_HOST) {
      return new Response('Not found', { status: 404 });
    }

    const requestedPath = decodeURIComponent(url.pathname);
    const resolvedPath = path.resolve(rendererRoot, `.${requestedPath}`);
    const relativePath = path.relative(rendererRoot, resolvedPath);
    const isSafe = relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath));

    if (!isSafe) {
      return new Response('Forbidden', { status: 403 });
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

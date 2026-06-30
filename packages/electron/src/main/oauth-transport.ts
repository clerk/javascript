import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';

import { app, BrowserWindow, ipcMain, shell } from 'electron';

import { OAUTH_TRANSPORT_CHANNELS } from '../shared/ipc';
import type { OAuthOptions, OAuthRedirectStrategy, RendererSchemeOptions } from '../shared/types';

const CALLBACK_TIMEOUT_MS = 3 * 60 * 1000;
const DEFAULT_LOOPBACK_HOST = '127.0.0.1';
const DEFAULT_LOOPBACK_PORT = 45789;
const LOOPBACK_CALLBACK_PATH = '/sso-callback';

type HttpRedirect = Extract<OAuthRedirectStrategy, { type: 'http' }>;

type PendingOAuthFlow = {
  resolve: (value: { callbackUrl: string }) => void;
  reject: (reason: Error) => void;
  timeout: NodeJS.Timeout;
};

type OAuthTransportOptions = {
  renderer?: RendererSchemeOptions;
  oauth?: OAuthOptions;
};

type CallbackListener = (callbackUrl: string) => void;

/**
 * A redirect handler owns the URL Clerk redirects back to and the mechanism that receives the OAuth
 * callback from the system browser. The transport contract (`getRedirectUrl` / `open`) is identical
 * across handlers — only the redirect-URI option differs (RFC 8252 §7.1 private-use URI scheme vs.
 * §7.3 loopback interface).
 */
type RedirectHandler = {
  /** Stable URL Clerk redirects back to after the provider authorizes. */
  readonly redirectUrl: string;
  /** Begin listening for a single in-flight callback. May allocate per-flow resources. */
  arm: () => Promise<void>;
  /** Stop listening for the current callback and release per-flow resources. */
  disarm: () => void;
  /** Permanently tear down listeners/resources registered for the handler's lifetime. */
  cleanup: () => void;
};

function assertExternalOAuthUrl(url: string): void {
  const parsedUrl = new URL(url);

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new TypeError(`Clerk: refusing to open unsupported OAuth URL protocol: ${parsedUrl.protocol}`);
  }
}

function focusMainWindow(): void {
  const window = BrowserWindow.getAllWindows()[0];

  if (!window) {
    return;
  }

  if (window.isMinimized()) {
    window.restore();
  }

  if (!window.isVisible()) {
    window.show();
  }

  window.focus();
}

function buildDefaultCompletionPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Sign-in complete</title>
    <style>
      :root { color-scheme: light dark; }
      body { margin: 0; min-height: 100vh; display: grid; place-items: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: #111827; color: #f9fafb; }
      main { max-width: 420px; padding: 24px; text-align: center; }
      h1 { margin: 0 0 12px; font-size: 24px; }
      p { margin: 0; line-height: 1.5; color: #d1d5db; }
    </style>
  </head>
  <body>
    <main>
      <h1>Sign-in complete</h1>
      <p>You can close this window and return to the app.</p>
    </main>
    <script>
      window.close();
    </script>
  </body>
</html>`;
}

/**
 * RFC 8252 §7.1 — receives the callback through a registered custom (private-use) URI scheme,
 * delivered by Electron's `open-url` (macOS) and `second-instance` (Windows/Linux) events.
 */
function createDeepLinkHandler(
  renderer: RendererSchemeOptions | undefined,
  onCallback: CallbackListener,
): RedirectHandler {
  if (!renderer) {
    throw new Error(
      "Clerk: oauth.redirect { type: 'deep-link' } requires a renderer { scheme, host } to be configured.",
    );
  }

  const redirectUrl = `${renderer.scheme}://${renderer.host}/`;

  const isMatchingCallbackUrl = (url: string): boolean => {
    try {
      const callback = new URL(url);
      const expected = new URL(redirectUrl);

      return (
        callback.protocol === expected.protocol &&
        callback.host === expected.host &&
        callback.pathname === expected.pathname
      );
    } catch {
      return false;
    }
  };

  const openUrlListener = (event: Electron.Event, url: string): void => {
    if (!isMatchingCallbackUrl(url)) {
      return;
    }

    event.preventDefault();
    onCallback(url);
  };

  const secondInstanceListener = (_event: Electron.Event, argv: string[]): void => {
    const callbackUrl = argv.find(isMatchingCallbackUrl);

    if (callbackUrl) {
      onCallback(callbackUrl);
    }
  };

  app.setAsDefaultProtocolClient(renderer.scheme);
  app.on('open-url', openUrlListener);
  app.on('second-instance', secondInstanceListener);

  return {
    redirectUrl,
    arm: () => Promise.resolve(),
    disarm: () => {},
    cleanup: () => {
      app.removeListener('open-url', openUrlListener);
      app.removeListener('second-instance', secondInstanceListener);
    },
  };
}

/**
 * RFC 8252 §7.3 — receives the callback on a short-lived loopback (`http://127.0.0.1`) server and
 * either redirects the browser to `successUrl`, serves `successHtml`, or serves a built-in
 * completion page so the tab resolves instead of stalling. Requires no OS protocol registration.
 */
function createHttpHandler(config: HttpRedirect, onCallback: CallbackListener): RedirectHandler {
  const host = DEFAULT_LOOPBACK_HOST;
  const port = config.port ?? DEFAULT_LOOPBACK_PORT;
  const redirectUrl = `http://${host}:${port}${LOOPBACK_CALLBACK_PATH}`;
  let server: Server | null = null;

  const closeServer = (): void => {
    if (!server) {
      return;
    }

    try {
      server.close();
    } catch {
      // Server may already be closing; ignore.
    }

    server = null;
  };

  const respondToCallback = (response: ServerResponse): void => {
    if (config.successUrl) {
      response.writeHead(302, { Location: config.successUrl });
      response.end();
      return;
    }

    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(config.successHtml ?? buildDefaultCompletionPage());
  };

  const requestListener = (request: IncomingMessage, response: ServerResponse): void => {
    try {
      const requestUrl = new URL(request.url ?? '/', redirectUrl);

      if (request.method !== 'GET' || requestUrl.pathname !== LOOPBACK_CALLBACK_PATH) {
        response.writeHead(404, { 'Content-Type': 'text/plain' });
        response.end('Not found.');
        return;
      }

      respondToCallback(response);
      focusMainWindow();
      onCallback(requestUrl.toString());
    } catch {
      response.writeHead(500, { 'Content-Type': 'text/plain' });
      response.end('Sign-in callback failed.');
    }
  };

  return {
    redirectUrl,
    arm: () =>
      new Promise<void>((resolve, reject) => {
        if (server) {
          resolve();
          return;
        }

        const next = createServer(requestListener);

        next.once('error', error => {
          server = null;
          reject(error);
        });

        next.listen(port, host, () => {
          next.removeListener('error', reject);
          server = next;
          resolve();
        });
      }),
    disarm: closeServer,
    cleanup: closeServer,
  };
}

export function setupOAuthTransportIpcHandlers(options: OAuthTransportOptions): () => void {
  let pendingOAuthFlow: PendingOAuthFlow | null = null;

  // Set after the handler is created; lets `settle` release per-flow resources without a forward
  // reference to `handler`.
  let disarmActiveFlow: () => void = () => {};

  const settle = (result: { callbackUrl: string } | { error: Error }): void => {
    if (!pendingOAuthFlow) {
      return;
    }

    const pending = pendingOAuthFlow;
    clearTimeout(pending.timeout);
    pendingOAuthFlow = null;
    disarmActiveFlow();

    if ('error' in result) {
      pending.reject(result.error);
    } else {
      pending.resolve(result);
    }
  };

  const redirect: OAuthRedirectStrategy = options.oauth?.redirect ?? { type: 'deep-link' };
  const handler: RedirectHandler =
    redirect.type === 'deep-link'
      ? createDeepLinkHandler(options.renderer, callbackUrl => settle({ callbackUrl }))
      : createHttpHandler(redirect, callbackUrl => settle({ callbackUrl }));

  disarmActiveFlow = () => handler.disarm();

  ipcMain.handle(OAUTH_TRANSPORT_CHANNELS.getRedirectUrl, () => {
    return handler.redirectUrl;
  });

  ipcMain.handle(OAUTH_TRANSPORT_CHANNELS.open, async (_event, url: string) => {
    if (pendingOAuthFlow) {
      throw new Error('Clerk: an OAuth flow is already pending.');
    }

    assertExternalOAuthUrl(url);

    const callbackPromise = new Promise<{ callbackUrl: string }>((resolve, reject) => {
      const timeout = setTimeout(() => {
        settle({ error: new Error('Clerk: OAuth callback timed out.') });
      }, CALLBACK_TIMEOUT_MS);

      pendingOAuthFlow = { resolve, reject, timeout };
    });

    try {
      await handler.arm();
      await shell.openExternal(url);
    } catch (err) {
      settle({ error: err instanceof Error ? err : new Error(String(err)) });
    }

    return callbackPromise;
  });

  return () => {
    settle({ error: new Error('Clerk: OAuth flow was cancelled.') });
    handler.cleanup();
    ipcMain.removeHandler(OAUTH_TRANSPORT_CHANNELS.getRedirectUrl);
    ipcMain.removeHandler(OAUTH_TRANSPORT_CHANNELS.open);
  };
}

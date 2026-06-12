import { app, ipcMain, shell } from 'electron';

import { OAUTH_TRANSPORT_CHANNELS } from '../shared/ipc';
import type { RendererSchemeOptions } from '../shared/types';

const CALLBACK_TIMEOUT_MS = 3 * 60 * 1000;

type PendingOAuthFlow = {
  resolve: (value: { callbackUrl: string }) => void;
  reject: (reason: Error) => void;
  timeout: NodeJS.Timeout;
};

type OAuthTransportOptions = {
  renderer: RendererSchemeOptions;
};

function buildRedirectUrl(options: OAuthTransportOptions): string {
  return `${options.renderer.scheme}://${options.renderer.host}/`;
}

function isMatchingCallbackUrl(url: string, redirectUrl: string): boolean {
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
}

function assertExternalOAuthUrl(url: string): void {
  const parsedUrl = new URL(url);

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new TypeError(`Clerk: refusing to open unsupported OAuth URL protocol: ${parsedUrl.protocol}`);
  }
}

export function setupOAuthTransportIpcHandlers(options: OAuthTransportOptions): () => void {
  const redirectUrl = buildRedirectUrl(options);
  let pendingOAuthFlow: PendingOAuthFlow | null = null;

  const disposePendingOAuthFlow = (reason?: Error): void => {
    if (!pendingOAuthFlow) {
      return;
    }

    const pending = pendingOAuthFlow;
    clearTimeout(pendingOAuthFlow.timeout);
    pendingOAuthFlow = null;

    if (reason) {
      pending.reject(reason);
    }
  };

  const handleCallbackUrl = (url: string): void => {
    if (!pendingOAuthFlow || !isMatchingCallbackUrl(url, redirectUrl)) {
      return;
    }

    const pending = pendingOAuthFlow;
    disposePendingOAuthFlow();
    pending.resolve({ callbackUrl: url });
  };

  const openUrlListener = (event: Electron.Event, url: string): void => {
    if (!isMatchingCallbackUrl(url, redirectUrl)) {
      return;
    }

    event.preventDefault();
    handleCallbackUrl(url);
  };

  const secondInstanceListener = (_event: Electron.Event, argv: string[]): void => {
    const callbackUrl = argv.find(url => isMatchingCallbackUrl(url, redirectUrl));

    if (callbackUrl) {
      handleCallbackUrl(callbackUrl);
    }
  };

  app.setAsDefaultProtocolClient(options.renderer.scheme);
  app.on('open-url', openUrlListener);
  app.on('second-instance', secondInstanceListener);

  ipcMain.handle(OAUTH_TRANSPORT_CHANNELS.getRedirectUrl, () => {
    return redirectUrl;
  });

  ipcMain.handle(OAUTH_TRANSPORT_CHANNELS.open, async (_event, url: string) => {
    if (pendingOAuthFlow) {
      throw new Error('Clerk: an OAuth flow is already pending.');
    }

    assertExternalOAuthUrl(url);

    const callbackPromise = new Promise<{ callbackUrl: string }>((resolve, reject) => {
      const timeout = setTimeout(() => {
        disposePendingOAuthFlow();
        reject(new Error('Clerk: OAuth callback timed out.'));
      }, CALLBACK_TIMEOUT_MS);

      pendingOAuthFlow = { resolve, reject, timeout };
    });

    try {
      await shell.openExternal(url);
    } catch (err) {
      disposePendingOAuthFlow(err instanceof Error ? err : new Error(String(err)));
    }

    return callbackPromise;
  });

  return () => {
    disposePendingOAuthFlow(new Error('Clerk: OAuth flow was cancelled.'));
    app.removeListener('open-url', openUrlListener);
    app.removeListener('second-instance', secondInstanceListener);
    ipcMain.removeHandler(OAUTH_TRANSPORT_CHANNELS.getRedirectUrl);
    ipcMain.removeHandler(OAUTH_TRANSPORT_CHANNELS.open);
  };
}

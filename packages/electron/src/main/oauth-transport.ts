import { randomUUID } from 'node:crypto';

import { app, BrowserWindow, ipcMain, shell } from 'electron';

import { OAUTH_TRANSPORT_CHANNELS } from '../shared/ipc';
import type { RendererSchemeOptions } from '../shared/types';
import { isMainFrameEvent } from './validate-sender';

const CALLBACK_TIMEOUT_MS = 3 * 60 * 1000;
const ATTEMPT_PARAM = '__clerk_oauth_attempt';

type PendingOAuthFlow = {
  resolve: (value: { callbackUrl: string }) => void;
  reject: (reason: Error) => void;
  timeout: NodeJS.Timeout;
  attemptId: string | undefined;
  window: Electron.BrowserWindow | null;
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

function isCallbackForAttempt(url: string, attemptId: string | undefined): boolean {
  const callbackAttemptId = new URL(url).searchParams.get(ATTEMPT_PARAM);
  return callbackAttemptId === null || callbackAttemptId === attemptId;
}

function findMatchingCallbackUrl(argv: string[], redirectUrl: string): string | undefined {
  return argv.find(url => isMatchingCallbackUrl(url, redirectUrl));
}

// Windows and Linux deliver the callback to a background process; macOS activates the app itself.
function focusWindow(window: Electron.BrowserWindow | null): void {
  if (!window || window.isDestroyed()) {
    return;
  }

  if (window.isMinimized()) {
    window.restore();
  }

  window.focus();
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
  const attemptIds = new WeakMap<Electron.WebContents, string>();

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
    if (
      !pendingOAuthFlow ||
      !isMatchingCallbackUrl(url, redirectUrl) ||
      !isCallbackForAttempt(url, pendingOAuthFlow.attemptId)
    ) {
      return;
    }

    const pending = pendingOAuthFlow;
    disposePendingOAuthFlow();
    focusWindow(pending.window);
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
    const callbackUrl = findMatchingCallbackUrl(argv, redirectUrl);

    if (callbackUrl) {
      handleCallbackUrl(callbackUrl);
    }
  };

  app.setAsDefaultProtocolClient(options.renderer.scheme);
  app.on('open-url', openUrlListener);
  app.on('second-instance', secondInstanceListener);

  ipcMain.handle(OAUTH_TRANSPORT_CHANNELS.getRedirectUrl, event => {
    if (!isMainFrameEvent(event)) {
      throw new Error("Clerk: OAuth request did not originate from a window's main frame.");
    }

    const attemptId = randomUUID();
    attemptIds.set(event.sender, attemptId);
    const attemptRedirectUrl = new URL(redirectUrl);
    attemptRedirectUrl.searchParams.set(ATTEMPT_PARAM, attemptId);
    return attemptRedirectUrl.href;
  });

  ipcMain.handle(OAUTH_TRANSPORT_CHANNELS.open, async (event, url: string) => {
    if (!isMainFrameEvent(event)) {
      throw new Error("Clerk: OAuth request did not originate from a window's main frame.");
    }

    assertExternalOAuthUrl(url);
    disposePendingOAuthFlow();

    const window = BrowserWindow.fromWebContents(event.sender);
    const attemptId = attemptIds.get(event.sender);

    let flow: PendingOAuthFlow | null = null;
    const callbackPromise = new Promise<{ callbackUrl: string }>((resolve, reject) => {
      const timeout = setTimeout(() => {
        disposePendingOAuthFlow();
        reject(new Error('Clerk: OAuth callback timed out.'));
      }, CALLBACK_TIMEOUT_MS);

      flow = { resolve, reject, timeout, attemptId, window };
      pendingOAuthFlow = flow;
    });

    try {
      await shell.openExternal(url);
    } catch (err) {
      if (pendingOAuthFlow === flow) {
        disposePendingOAuthFlow(err instanceof Error ? err : new Error(String(err)));
      }
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

export function setupMissingRendererOAuthTransportIpcHandlers(): () => void {
  const rejectMissingRenderer = (): never => {
    throw new Error(
      'Clerk: OAuth sign-in requires the renderer option. Pass createClerkBridge({ renderer: { scheme, host } }) so the OAuth callback can reach the app.',
    );
  };

  ipcMain.handle(OAUTH_TRANSPORT_CHANNELS.getRedirectUrl, rejectMissingRenderer);
  ipcMain.handle(OAUTH_TRANSPORT_CHANNELS.open, rejectMissingRenderer);

  return () => {
    ipcMain.removeHandler(OAUTH_TRANSPORT_CHANNELS.getRedirectUrl);
    ipcMain.removeHandler(OAUTH_TRANSPORT_CHANNELS.open);
  };
}

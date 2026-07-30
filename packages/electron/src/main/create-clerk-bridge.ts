import { app, protocol } from 'electron';

import type { ClerkBridge, CreateClerkBridgeOptions } from '../shared/types';
import { setupTokenCacheIpcHandlers } from './ipc-handlers';
import { setupOAuthTransportIpcHandlers } from './oauth-transport';
import { setupPasskeysMain } from './passkey-handlers';

function assertValidRendererOriginConfig(renderer: NonNullable<CreateClerkBridgeOptions['renderer']>): void {
  if (renderer.scheme.includes(':') || renderer.scheme.includes('/')) {
    throw new Error(
      'Clerk: renderer.scheme must be a scheme name like "my-app", not a URL or protocol like "my-app://".',
    );
  }

  if (renderer.host.includes(':') || renderer.host.includes('/')) {
    throw new Error(
      'Clerk: renderer.host must be a host name like "renderer", not a URL or origin like "my-app://renderer".',
    );
  }
}

function buildUserAgentFallback(defaultUserAgent: string, productToken: string): string {
  const platformCommentStart = defaultUserAgent.indexOf('(');
  const platformCommentEnd = defaultUserAgent.indexOf(')', platformCommentStart + 1);

  if (platformCommentStart === -1 || platformCommentEnd === -1) {
    return productToken;
  }

  const platformComment = defaultUserAgent.slice(platformCommentStart, platformCommentEnd + 1);

  // Clerk's session activity parser preserves the platform comment and treats the
  // token after Gecko as the app/browser name.
  return `Mozilla/5.0 ${platformComment} Gecko/20100101 ${productToken}`;
}

/**
 * Creates the Clerk bridge for Electron's main process.
 *
 * The bridge owns Clerk's main-process IPC handlers, token persistence, and OAuth deep-link
 * transport. Call this before creating renderer windows, and call the returned `cleanup` method
 * when tearing down the app or test environment.
 */
export function createClerkBridge(options: CreateClerkBridgeOptions): ClerkBridge {
  if (!options.storage) {
    throw new Error(
      'Clerk: createClerkBridge requires a storage adapter. Pass createClerkBridge({ storage: storage() }) from @clerk/electron/storage, or provide a custom storage adapter.',
    );
  }

  let ownsSingleInstanceLock = false;

  if (options.renderer) {
    assertValidRendererOriginConfig(options.renderer);

    // macOS routes deep links to the running instance through `open-url`, so the lock is only needed
    // where `second-instance` is the delivery path.
    if (process.platform !== 'darwin' && !app.hasSingleInstanceLock()) {
      if (options.manageSingleInstanceLock === false) {
        console.warn(
          "Clerk: manageSingleInstanceLock is false but the application does not hold Electron's single-instance lock. OAuth deep-link callbacks cannot be delivered on Windows or Linux until it is acquired.",
        );
      } else if (!app.requestSingleInstanceLock()) {
        app.quit();
        return { cleanup() {}, isPrimaryInstance: false };
      } else {
        ownsSingleInstanceLock = true;
      }
    }
  }

  const releaseSingleInstanceLock = (): void => {
    if (!ownsSingleInstanceLock) {
      return;
    }

    ownsSingleInstanceLock = false;
    app.releaseSingleInstanceLock();
  };

  const teardowns: Array<() => void> = [];
  const runTeardowns = (): void => {
    while (teardowns.length > 0) {
      teardowns.pop()?.();
    }
  };

  try {
    teardowns.push(setupTokenCacheIpcHandlers(options.storage));

    if (options.passkeys) {
      const passkeys = setupPasskeysMain();
      teardowns.push(() => passkeys.cleanup());
    }

    if (options.userAgent) {
      app.userAgentFallback = buildUserAgentFallback(app.userAgentFallback, options.userAgent);
    }

    if (options.renderer) {
      protocol.registerSchemesAsPrivileged([
        {
          scheme: options.renderer.scheme,
          privileges: {
            standard: true,
            secure: true,
            supportFetchAPI: true,
            corsEnabled: true,
            stream: true,
            ...options.renderer.privileges,
          },
        },
      ]);

      teardowns.push(
        setupOAuthTransportIpcHandlers({
          renderer: options.renderer,
        }),
      );
    }

    return {
      isPrimaryInstance: true,
      cleanup() {
        try {
          runTeardowns();
        } finally {
          releaseSingleInstanceLock();
        }
      },
    };
  } catch (err) {
    try {
      runTeardowns();
    } catch {
      // The initialization error is the one worth surfacing.
    }

    releaseSingleInstanceLock();
    throw err;
  }
}

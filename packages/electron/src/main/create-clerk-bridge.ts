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
  const platformComment = defaultUserAgent.match(/\([^)]*\)/)?.[0];

  if (!platformComment) {
    return productToken;
  }

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

  const cleanupTokenPersistence = setupTokenCacheIpcHandlers(options.storage);
  let cleanupOAuthTransport: (() => void) | undefined;
  const passkeys = options.passkeys ? setupPasskeysMain() : null;

  if (options.userAgent) {
    app.userAgentFallback = buildUserAgentFallback(app.userAgentFallback, options.userAgent);
  }

  if (options.renderer) {
    assertValidRendererOriginConfig(options.renderer);

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

    cleanupOAuthTransport = setupOAuthTransportIpcHandlers({
      renderer: options.renderer,
    });
  }

  return {
    cleanup() {
      cleanupTokenPersistence();
      cleanupOAuthTransport?.();
      passkeys?.cleanup();
    },
  };
}

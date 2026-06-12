import { protocol } from 'electron';

import type { SetupMainOptions, SetupMainReturn } from '../shared/types';
import { setupTokenCacheIpcHandlers } from './ipc-handlers';
import { setupOAuthTransportIpcHandlers } from './oauth-transport';

function assertValidRendererOriginConfig(renderer: NonNullable<SetupMainOptions['renderer']>): void {
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

export function setupMain(options: SetupMainOptions): SetupMainReturn {
  if (!options.storage) {
    throw new Error(
      'Clerk: setupMain requires a storage adapter. Pass setupMain({ storage: storage() }) from @clerk/electron/storage, or provide a custom storage adapter.',
    );
  }

  const cleanupTokenPersistence = setupTokenCacheIpcHandlers(options.storage);
  let cleanupOAuthTransport: (() => void) | undefined;

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
    },
  };
}

import { app, protocol, session } from 'electron';

import type { SetupMainOptions, SetupMainReturn } from '../shared/types';
import { setupTokenCacheIpcHandlers } from './ipc-handlers';

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

const rendererRequestHeaderFilter = { urls: ['https://*/*'] };

function findHeaderKey(headers: Record<string, string>, header: string): string | undefined {
  return Object.keys(headers).find(key => key.toLowerCase() === header.toLowerCase());
}

function setupRendererRequestHeaders(renderer: NonNullable<SetupMainOptions['renderer']>): () => void {
  const rendererOrigin = `${renderer.scheme}://${renderer.host}`;
  let registered = false;
  let disposed = false;

  const listener = (
    details: Electron.OnBeforeSendHeadersListenerDetails,
    callback: (beforeSendResponse: Electron.BeforeSendResponse) => void,
  ) => {
    const url = new URL(details.url);
    const originKey = findHeaderKey(details.requestHeaders, 'origin');
    const authorizationKey = findHeaderKey(details.requestHeaders, 'authorization');

    if (
      url.searchParams.get('_is_native') === '1' &&
      originKey &&
      authorizationKey &&
      details.requestHeaders[originKey] === rendererOrigin
    ) {
      delete details.requestHeaders[originKey];
    }

    callback({ requestHeaders: details.requestHeaders });
  };

  const register = () => {
    if (disposed || registered) {
      return;
    }

    session.defaultSession.webRequest.onBeforeSendHeaders(rendererRequestHeaderFilter, listener);
    registered = true;
  };

  if (app.isReady()) {
    register();
  } else {
    void app.whenReady().then(register);
  }

  return () => {
    disposed = true;

    if (registered) {
      session.defaultSession.webRequest.onBeforeSendHeaders(rendererRequestHeaderFilter, null);
    }
  };
}

export function setupMain(options: SetupMainOptions): SetupMainReturn {
  if (!options.storage) {
    throw new Error(
      'Clerk: setupMain requires a storage adapter. Pass setupMain({ storage: storage() }) from @clerk/electron/storage, or provide a custom storage adapter.',
    );
  }

  const cleanupTokenPersistence = setupTokenCacheIpcHandlers(options.storage);

  let cleanupRendererRequestHeaders = () => {};

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

    cleanupRendererRequestHeaders = setupRendererRequestHeaders(options.renderer);
  }

  return {
    cleanup() {
      cleanupTokenPersistence();
      cleanupRendererRequestHeaders();
    },
  };
}

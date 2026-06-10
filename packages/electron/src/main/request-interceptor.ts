import { parsePublishableKey } from '@clerk/shared/keys';
import { session } from 'electron';

const FALLBACK_CLERK_URLS = ['https://*.clerk.accounts.dev/*', 'https://*.clerk.com/*'];

function resolveClerkUrls(publishableKey: string | undefined): string[] {
  const frontendApi = publishableKey ? parsePublishableKey(publishableKey)?.frontendApi : undefined;
  const urls = frontendApi ? [`https://${frontendApi}/*`, ...FALLBACK_CLERK_URLS] : FALLBACK_CLERK_URLS;

  return [...new Set(urls)];
}

export function setupClerkRequestInterception(publishableKey?: string): void {
  const clerkUrls = resolveClerkUrls(publishableKey);

  // Temporary Electron transport shim.
  // FAPI currently rejects requests that include both Origin and Authorization, and file://
  // renderers need CORS headers to read Clerk responses. Remove this once FAPI supports the
  // Electron/native transport contract directly.
  session.defaultSession.webRequest.onBeforeSendHeaders({ urls: clerkUrls }, (details, callback) => {
    const headers = { ...details.requestHeaders };
    delete headers.Origin;
    delete headers.origin;
    callback({ requestHeaders: headers });
  });

  session.defaultSession.webRequest.onHeadersReceived({ urls: clerkUrls }, (details, callback) => {
    const responseHeaders = { ...details.responseHeaders };
    responseHeaders['access-control-allow-origin'] = ['*'];
    responseHeaders['access-control-allow-headers'] = ['*'];
    responseHeaders['access-control-allow-methods'] = ['*'];
    responseHeaders['access-control-expose-headers'] = ['Authorization'];
    callback({ responseHeaders });
  });
}

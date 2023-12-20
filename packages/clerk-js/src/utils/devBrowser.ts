import { extractDevBrowserJWTFromURLHash, extractDevBrowserJWTFromURLSearchParams } from '@clerk/shared';

// Gets the dev_browser JWT from either the hash or the search
// Side effect:
// Removes dev_browser JWT from the URL as a side effect and updates the browser history
export function getDevBrowserJWTFromURL(url: URL): string {
  const resultURL = new URL(url);

  const jwtFromHash = extractDevBrowserJWTFromURLHash(resultURL);
  const jwtFromSearch = extractDevBrowserJWTFromURLSearchParams(resultURL);

  const jwt = jwtFromHash || jwtFromSearch;

  if (jwt && typeof globalThis.history !== 'undefined') {
    globalThis.history.replaceState(null, '', resultURL.href);
  }

  return jwt;
}

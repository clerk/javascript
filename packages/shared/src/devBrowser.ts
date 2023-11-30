export const DEV_BROWSER_SSO_JWT_PARAMETER = '__clerk_db_jwt';
export const DEV_BROWSER_JWT_MARKER = '__clerk_db_jwt';
export const DEV_BROWSER_SSO_JWT_KEY = 'clerk-db-jwt';

const DEV_BROWSER_JWT_MARKER_REGEXP = /__clerk_db_jwt\[(.*)\]/;
const DEV_BROWSER_SSO_JWT_HTTP_HEADER = 'Clerk-Cookie';

// Sets the dev_browser JWT in the hash or the search
export function setDevBrowserJWTInURL(url: URL, jwt: string, asQueryParam: boolean): URL {
  const resultURL = new URL(url);

  // extract & strip existing jwt from hash
  const jwtFromHash = extractDevBrowserJWTFromHash(resultURL.hash);
  resultURL.hash = resultURL.hash.replace(DEV_BROWSER_JWT_MARKER_REGEXP, '');
  if (resultURL.href.endsWith('#')) {
    resultURL.hash = '';
  }

  // extract & strip existing jwt from search
  const jwtFromSearch = resultURL.searchParams.get(DEV_BROWSER_SSO_JWT_PARAMETER);
  resultURL.searchParams.delete(DEV_BROWSER_SSO_JWT_PARAMETER);

  // Existing jwt takes precedence
  const jwtToSet = jwtFromHash || jwtFromSearch || jwt;

  if (jwtToSet) {
    if (asQueryParam) {
      resultURL.searchParams.append(DEV_BROWSER_SSO_JWT_PARAMETER, jwtToSet);
    } else {
      resultURL.hash = resultURL.hash + `${DEV_BROWSER_JWT_MARKER}[${jwtToSet}]`;
    }
  }

  return resultURL;
}

// Gets the dev_browser JWT from either the hash or the search
// Side effect:
// Removes dev_browser JWT from the URL as a side effect and updates the browser history
export function getDevBrowserJWTFromURL(url: URL): string {
  const resultURL = new URL(url);

  // extract & strip existing jwt from hash
  const jwtFromHash = extractDevBrowserJWTFromHash(resultURL.hash);
  resultURL.hash = resultURL.hash.replace(DEV_BROWSER_JWT_MARKER_REGEXP, '');
  if (resultURL.href.endsWith('#')) {
    resultURL.hash = '';
  }

  // extract & strip existing jwt from search
  const jwtFromSearch = resultURL.searchParams.get(DEV_BROWSER_SSO_JWT_PARAMETER) || '';
  resultURL.searchParams.delete(DEV_BROWSER_SSO_JWT_PARAMETER);

  const jwt = jwtFromHash || jwtFromSearch;

  // eslint-disable-next-line valid-typeof
  if (jwt && typeof globalThis.history !== undefined) {
    globalThis.history.replaceState(null, '', resultURL.href);
  }

  return jwt;
}

export function getDevBrowserJWTFromResponse({ headers }: { headers?: Headers } = {}) {
  return headers?.get(DEV_BROWSER_SSO_JWT_HTTP_HEADER);
}

function extractDevBrowserJWTFromHash(hash: string): string {
  const matches = hash.match(DEV_BROWSER_JWT_MARKER_REGEXP);
  return matches ? matches[1] : '';
}

export const DEV_BROWSER_JWT_KEY = '__clerk_db_jwt';
export const DEV_BROWSER_JWT_HEADER = 'Clerk-Db-Jwt';

// Sets the dev_browser JWT in the hash or the search
export function setDevBrowserJWTInURL(url: URL, jwt: string): URL {
  const resultURL = new URL(url);

  // extract & strip existing jwt from search
  const jwtFromSearch = resultURL.searchParams.get(DEV_BROWSER_JWT_KEY);
  resultURL.searchParams.delete(DEV_BROWSER_JWT_KEY);

  // Existing jwt takes precedence
  const jwtToSet = jwtFromSearch || jwt;

  if (jwtToSet) {
    resultURL.searchParams.set(DEV_BROWSER_JWT_KEY, jwtToSet);
  }

  return resultURL;
}

// Gets the dev_browser JWT from either the hash or the search
// Side effect:
// Removes dev_browser JWT from the URL as a side effect and updates the browser history
export function getDevBrowserJWTFromURL(url: URL): string {
  const resultURL = new URL(url);

  // extract & strip existing jwt from search
  const jwt = resultURL.searchParams.get(DEV_BROWSER_JWT_KEY) || '';
  resultURL.searchParams.delete(DEV_BROWSER_JWT_KEY);

  // eslint-disable-next-line valid-typeof
  if (jwt && typeof globalThis.history !== undefined) {
    globalThis.history.replaceState(null, '', resultURL.href);
  }

  return jwt;
}

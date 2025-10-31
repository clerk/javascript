export const DEV_BROWSER_JWT_KEY = '__clerk_db_jwt';
export const DEV_BROWSER_JWT_HEADER = 'Clerk-Db-Jwt';

// Sets the dev_browser JWT in the hash or the search
/**
 *
 */
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

/**
 * Gets the __clerk_db_jwt JWT from either the hash or the search
 * Side effect:
 * Removes __clerk_db_jwt JWT from the URL (hash and searchParams) and updates the browser history
 */
export function extractDevBrowserJWTFromURL(url: URL): string {
  const jwt = readDevBrowserJwtFromSearchParams(url);
  const cleanUrl = removeDevBrowserJwt(url);
  if (cleanUrl.href !== url.href && typeof globalThis.history !== 'undefined') {
    globalThis.history.replaceState(null, '', removeDevBrowserJwt(url));
  }
  return jwt;
}

const readDevBrowserJwtFromSearchParams = (url: URL) => {
  return url.searchParams.get(DEV_BROWSER_JWT_KEY) || '';
};

const removeDevBrowserJwt = (url: URL) => {
  return removeDevBrowserJwtFromURLSearchParams(removeLegacyDevBrowserJwt(url));
};

const removeDevBrowserJwtFromURLSearchParams = (_url: URL) => {
  const url = new URL(_url);
  url.searchParams.delete(DEV_BROWSER_JWT_KEY);
  return url;
};

/**
 * Removes the __clerk_db_jwt JWT from the URL hash, as well as
 * the legacy __dev_session JWT from the URL searchParams
 * We no longer need to use this value, however, we should remove it from the URL
 * Existing v4 apps will write the JWT to the hash and the search params in order to ensure
 * backwards compatibility with older v4 apps.
 * The only use case where this is needed now is when a user upgrades to clerk@5 locally
 * without changing the component's version on their dashboard.
 * In this scenario, the AP@4 -> localhost@5 redirect will still have the JWT in the hash,
 * in which case we need to remove it.
 */
const removeLegacyDevBrowserJwt = (_url: URL) => {
  const DEV_BROWSER_JWT_MARKER_REGEXP = /__clerk_db_jwt\[(.*)\]/;
  const DEV_BROWSER_JWT_LEGACY_KEY = '__dev_session';
  const url = new URL(_url);
  url.searchParams.delete(DEV_BROWSER_JWT_LEGACY_KEY);
  url.hash = decodeURI(url.hash).replace(DEV_BROWSER_JWT_MARKER_REGEXP, '');
  if (url.href.endsWith('#')) {
    url.hash = '';
  }
  return url;
};

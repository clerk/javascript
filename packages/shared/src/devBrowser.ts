export const DEV_BROWSER_SSO_JWT_PARAMETER = '__dev_session';
export const DEV_BROWSER_JWT_MARKER = '__clerk_db_jwt';
const DEV_BROWSER_JWT_MARKER_REGEXP = /__clerk_db_jwt\[(.*)\]/;

// Sets the dev_browser JWT in the hash or the search
export function setDevBrowserJWTInURL(url: URL, jwt: string, opts = { hash: true }): URL {
  const resultURL = new URL(url);

  const jwtFromHash = extractDevBrowserJWTFromURLHash(resultURL);
  const jwtFromSearch = extractDevBrowserJWTFromURLSearchParams(resultURL);
  // Existing jwt takes precedence
  const jwtToSet = jwtFromHash || jwtFromSearch || jwt;

  if (jwtToSet) {
    resultURL.searchParams.append(DEV_BROWSER_SSO_JWT_PARAMETER, jwtToSet);
    resultURL.searchParams.append(DEV_BROWSER_JWT_MARKER, jwtToSet);
    if (opts.hash) {
      resultURL.hash = resultURL.hash + `${DEV_BROWSER_JWT_MARKER}[${jwtToSet}]`;
    }
  }

  return resultURL;
}

function extractDevBrowserJWTFromHash(hash: string): string {
  const matches = hash.match(DEV_BROWSER_JWT_MARKER_REGEXP);
  return matches ? matches[1] : '';
}

/**
 * Extract & strip existing jwt from hash
 * Side effect: Removes dev browser from the url hash
 **/
export function extractDevBrowserJWTFromURLHash(url: URL) {
  const jwt = extractDevBrowserJWTFromHash(url.hash);
  url.hash = url.hash.replace(DEV_BROWSER_JWT_MARKER_REGEXP, '');
  if (url.href.endsWith('#')) {
    url.hash = '';
  }

  return jwt;
}

/**
 * Extract & strip existing jwt from search params
 * Side effect: Removes dev browser from the search params
 **/
export function extractDevBrowserJWTFromURLSearchParams(url: URL) {
  const jwtFromDevSession = url.searchParams.get(DEV_BROWSER_SSO_JWT_PARAMETER);
  url.searchParams.delete(DEV_BROWSER_SSO_JWT_PARAMETER);

  const jwtFromClerkDbJwt = url.searchParams.get(DEV_BROWSER_JWT_MARKER);
  url.searchParams.delete(DEV_BROWSER_JWT_MARKER);

  return jwtFromDevSession || jwtFromClerkDbJwt || '';
}

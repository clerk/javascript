// TODO: This is a partial duplicate of part of packages/clerk-js/src/utils/devBrowser.ts
// TODO: To be removed when we can extract this utility to @clerk/shared

export const DEV_BROWSER_SSO_JWT_PARAMETER = '__dev_session';

//
// Below this line should be identical to clerk-js version
//

export const DEV_BROWSER_JWT_MARKER = '__clerk_db_jwt';
const DEV_BROWSER_JWT_MARKER_REGEXP = /__clerk_db_jwt\[(.*)\]/;

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

function extractDevBrowserJWTFromHash(hash: string): string {
  const matches = hash.match(DEV_BROWSER_JWT_MARKER_REGEXP);
  return matches ? matches[1] : '';
}

// TODO: This is a duplicate of part of packages/clerk-js/src/utils/devBrowser.ts
// TODO: To be removed when we can extract this utility to @clerk/shared
export const DEV_BROWSER_JWT_MARKER = '__clerk_db_jwt';
const DEV_BROWSER_JWT_MARKER_REGEXP = /__clerk_db_jwt\[(.*)\]/;

function extractDevBrowserJWT(url: string): string {
  const matches = url.match(DEV_BROWSER_JWT_MARKER_REGEXP);
  return matches ? matches[1] : '';
}

export function setDevBrowserJWTInURL(url: string, jwt?: string): string {
  if (!jwt) {
    return url;
  }

  const dbJwt = extractDevBrowserJWT(url);
  if (dbJwt) {
    url.replace(`${DEV_BROWSER_JWT_MARKER}[${dbJwt}]`, jwt);
    return url;
  }
  const hasHash = (url || '').includes('#');
  return `${url}${hasHash ? '' : '#'}${DEV_BROWSER_JWT_MARKER}[${(jwt || '').trim()}]`;
}

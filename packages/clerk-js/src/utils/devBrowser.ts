import { DEV_BROWSER_SSO_JWT_PARAMETER } from '../core/constants';

export const DEV_BROWSER_JWT_MARKER = '__clerk_db_jwt';
const DEV_BROWSER_JWT_MARKER_REGEXP = /__clerk_db_jwt\[(.*)\]/;

function extractDevBrowserJWT(url: string): string {
  const matches = url.match(DEV_BROWSER_JWT_MARKER_REGEXP);
  return matches ? matches[1] : '';
}

export function setDevBrowserJWTInURL(url: string, jwt: string, asQueryParam: boolean): string {
  if (asQueryParam) {
    const hasQueryParam = (url || '').includes('?');
    return `${url}${hasQueryParam ? '&' : '?'}${DEV_BROWSER_SSO_JWT_PARAMETER}=${(jwt || '').trim()}`;
  }

  const dbJwt = extractDevBrowserJWT(url);
  if (dbJwt) {
    url.replace(`${DEV_BROWSER_JWT_MARKER}[${dbJwt}]`, jwt);
    return url;
  }
  const hasHash = (url || '').includes('#');
  return `${url}${hasHash ? '' : '#'}${DEV_BROWSER_JWT_MARKER}[${(jwt || '').trim()}]`;
}

export function getDevBrowserJWTFromURL(url: string): string {
  const jwt = extractDevBrowserJWT(url);
  if (!jwt) {
    return '';
  }

  let newUrl = url.replace(DEV_BROWSER_JWT_MARKER_REGEXP, '');

  if (newUrl.endsWith('#')) {
    newUrl = newUrl.slice(0, -1);
  }

  if (typeof globalThis.history !== undefined) {
    globalThis.history.replaceState(null, '', newUrl);
  }

  return jwt;
}

const DEV_BROWSER_JWT_MARKER = '__clerk_db_jwt';
const DEV_BROWSER_JWT_MARKER_REGEXP = /__clerk_db_jwt\[(.*)\]/;

export function setDevBrowserJWTInURL(url: string, jwt: string): string {
  const hasHash = (url || '').includes('#');
  return `${url}${hasHash ? '' : '#'}${DEV_BROWSER_JWT_MARKER}[${(jwt || '').trim()}]`;
}

export function getDevBrowserJWTFromURL(url: string): string {
  const matches = url.match(DEV_BROWSER_JWT_MARKER_REGEXP);
  if (!matches) {
    return '';
  }

  let newUrl = url.replace(DEV_BROWSER_JWT_MARKER_REGEXP, '');

  if (newUrl.endsWith('#')) {
    newUrl = newUrl.slice(0, -1);
  }

  if (typeof globalThis.history !== undefined) {
    globalThis.history.replaceState(null, '', newUrl);
  }

  return matches[1];
}

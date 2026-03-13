/**
 *
 */
export function isValidProxyUrl(key: string | undefined) {
  if (!key) {
    return true;
  }

  return isHttpOrHttps(key) || isProxyUrlRelative(key);
}

/**
 *
 */
export function isHttpOrHttps(key: string | undefined) {
  return /^http(s)?:\/\//.test(key || '');
}

/**
 *
 */
export function isProxyUrlRelative(key: string) {
  return key.startsWith('/');
}

/**
 *
 */
export function proxyUrlToAbsoluteURL(url: string | undefined): string {
  if (!url) {
    return '';
  }
  return isProxyUrlRelative(url) ? new URL(url, window.location.origin).toString() : url;
}

const AUTO_PROXY_HOST_SUFFIXES = ['.vercel.app'];

export function shouldAutoProxy(hostname: string): boolean {
  return AUTO_PROXY_HOST_SUFFIXES.some(hostSuffix => hostname.endsWith(hostSuffix));
}

/**
 * Function that determines whether proxy should be used for a given URL.
 */
export type ShouldProxyFn = (url: URL) => boolean;

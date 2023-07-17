/**
 * These functions originate from @clerk/shared
 * Maintain these until @clerk/shared does not depend on react
 */
export function isValidProxyUrl(key: string | undefined) {
  if (!key) {
    return true;
  }

  return isHttpOrHttps(key) || isProxyUrlRelative(key);
}

export function isHttpOrHttps(key: string | undefined) {
  return /^http(s)?:\/\//.test(key || '');
}

export function isProxyUrlRelative(key: string) {
  return key.startsWith('/');
}

export function proxyUrlToAbsoluteURL(url: string | undefined): string {
  if (!url) {
    return '';
  }
  return isProxyUrlRelative(url) ? new URL(url, window.location.origin).toString() : url;
}

type VOrFnReturnsV<T> = T | undefined | ((v: URL) => T);
export function handleValueOrFn<T>(value: VOrFnReturnsV<T>, url: URL): T | undefined;
export function handleValueOrFn<T>(value: VOrFnReturnsV<T>, url: URL, defaultValue: T): T;
export function handleValueOrFn<T>(value: VOrFnReturnsV<T>, url: URL, defaultValue?: unknown): unknown {
  if (typeof value === 'function') {
    return (value as (v: URL) => T)(url);
  }

  if (typeof value !== 'undefined') {
    return value;
  }

  if (typeof defaultValue !== 'undefined') {
    return defaultValue;
  }

  return undefined;
}

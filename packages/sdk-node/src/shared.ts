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

export function getRequestUrl({ request, relativePath }: { request: Request; relativePath?: string }): URL {
  const { headers, url: initialUrl } = request;
  const url = new URL(initialUrl);
  const host = headers.get('X-Forwarded-Host') ?? headers.get('host') ?? (headers as any)['host'] ?? url.host;

  // X-Forwarded-Proto could be 'https, http'
  let protocol =
    (headers.get('X-Forwarded-Proto') ?? (headers as any)['X-Forwarded-Proto'])?.split(',')[0] ?? url.protocol;
  protocol = protocol.replace(/[:/]/, '');

  return new URL(relativePath || url.pathname, `${protocol}://${host}`);
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

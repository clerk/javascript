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

/**
 * @deprecated Use `buildRequestUrl` from @clerk/backend
 */
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

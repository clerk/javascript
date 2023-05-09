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

export function createProxyUrl({ request, relativePath }: { request: Request; relativePath?: string }): string {
  const { headers, url: initialUrl } = request;
  const url = new URL(initialUrl);
  const host = headers.get('X-Forwarded-Host') ?? headers.get('host') ?? url.host;

  // X-Forwarded-Proto could be 'https, http'
  const protocol = headers.get('X-Forwarded-Proto')?.split(',')[0] ?? url.protocol;
  return new URL(relativePath || url.pathname, `${protocol}://${host}`).toString();
}

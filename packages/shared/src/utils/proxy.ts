export function isValidProxyUrl(key: string | undefined) {
  if (!key) {
    return true;
  }

  return key.startsWith('https://') || isProxyUrlRelative(key);
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

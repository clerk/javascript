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
  
  // Normalize the URL path to handle multiple slashes and prevent proxy configuration regressions
  const normalizedUrl = normalizePath(url);
  
  return isProxyUrlRelative(normalizedUrl) ? new URL(normalizedUrl, window.location.origin).toString() : normalizedUrl;
}

/**
 * Normalizes a URL path by removing multiple leading and trailing slashes.
 * This function handles edge cases like empty strings, single slashes, and
 * mixed slash combinations to prevent proxy configuration regressions.
 *
 * Special handling for absolute URLs to preserve protocol schemes.
 *
 * @example
 * normalizePath('///path///') // returns '/path'
 * normalizePath('//path//to//resource//') // returns '/path/to/resource'
 * normalizePath('') // returns ''
 * normalizePath('/') // returns '/'
 * normalizePath('path') // returns 'path'
 * normalizePath('https://example.com//api//path') // returns 'https://example.com/api/path'
 *
 * @param {string} path - The path to normalize
 * @returns {string} Returns the normalized path
 */
function normalizePath(path: string): string {
  if (!path || typeof path !== 'string') {
    return '';
  }

  // Handle absolute URLs (http:// or https://) specially
  const protocolMatch = path.match(/^(https?):\/\//);
  if (protocolMatch) {
    const protocol = protocolMatch[0]; // e.g., 'https://'
    const restOfUrl = path.substring(protocol.length);
    
    // Normalize only the part after the protocol
    const normalizedRest = restOfUrl
      .replace(/\/+/g, '/') // Replace multiple slashes with single slash
      .replace(/\/+$/, ''); // Remove trailing slashes
    
    return protocol + normalizedRest;
  }

  // Handle the special case of root path
  if (path === '/' || path.match(/^\/+$/)) {
    return '/';
  }

  // Remove multiple slashes throughout the path and normalize leading/trailing slashes
  let normalized = path
    .replace(/\/+/g, '/') // Replace multiple slashes with single slash throughout
    .replace(/^\/+/, '/') // Ensure only single leading slash
    .replace(/\/+$/, ''); // Remove all trailing slashes

  // If the path becomes empty after removing trailing slashes but had leading slashes,
  // it means it was only slashes, so return single slash
  if (!normalized && path.startsWith('/')) {
    return '/';
  }

  // If path didn't start with slash originally, don't add one
  if (!path.startsWith('/') && normalized.startsWith('/')) {
    normalized = normalized.substring(1);
  }

  return normalized;
}

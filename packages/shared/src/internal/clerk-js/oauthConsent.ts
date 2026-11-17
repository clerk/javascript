const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;

export function getRedirectDisplay(url: string): string {
  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return '';
  }
  if (!hostname) {
    return '';
  }

  // WHATWG URL.hostname includes surrounding brackets for IPv6 literals on some
  // platforms; strip them so detection and output formatting are uniform.
  const host = hostname.startsWith('[') && hostname.endsWith(']') ? hostname.slice(1, -1) : hostname;

  if (IPV4_REGEX.test(host)) {
    return host;
  }
  if (host.includes(':')) {
    return `[${host}]`;
  }
  return host.split('.').slice(-2).join('.');
}

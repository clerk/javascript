const canReadLocation = () => typeof window !== 'undefined' && !!window.location;

export type RedirectDisplay = { kind: 'ip'; value: string } | { kind: 'hostname'; value: string } | { kind: 'invalid' };

const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;

function stripBrackets(host: string): string {
  return host.startsWith('[') && host.endsWith(']') ? host.slice(1, -1) : host;
}

function isIpLiteral(normalized: string): boolean {
  return IPV4_REGEX.test(normalized) || normalized.includes(':');
}

function formatIpForDisplay(normalized: string): string {
  return normalized.includes(':') ? `[${normalized}]` : normalized;
}

function rootDomainOf(hostname: string): string {
  return hostname.split('.').slice(-2).join('.');
}

export function getRedirectDisplay(url: string): RedirectDisplay {
  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return { kind: 'invalid' };
  }
  if (!hostname) return { kind: 'invalid' };

  const normalized = stripBrackets(hostname).toLowerCase();

  if (isIpLiteral(normalized)) return { kind: 'ip', value: formatIpForDisplay(normalized) };
  return { kind: 'hostname', value: rootDomainOf(normalized) };
}

export function getRedirectUriFromSearch(): string {
  if (!canReadLocation()) {
    return '';
  }
  return new URL(window.location.href).searchParams.get('redirect_uri') ?? '';
}

export function getOAuthConsentFromSearch(): { oauthClientId: string; scope?: string } {
  if (!canReadLocation()) {
    return { oauthClientId: '' };
  }
  const sp = new URLSearchParams(window.location.search);
  const oauthClientId = sp.get('client_id') ?? '';
  const scope = sp.get('scope') ?? undefined;
  return scope !== undefined ? { oauthClientId, scope } : { oauthClientId };
}

export function getForwardedParams(): Array<[string, string]> {
  if (!canReadLocation()) {
    return [];
  }
  return Array.from(new URLSearchParams(window.location.search).entries());
}

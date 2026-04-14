const canReadLocation = () => typeof window !== 'undefined' && !!window.location;

export function getRootDomain(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.split('.').slice(-2).join('.');
  } catch {
    return '';
  }
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

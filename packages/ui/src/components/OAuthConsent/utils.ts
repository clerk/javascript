const canReadLocation = () => typeof window !== 'undefined' && !!window.location;

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
  // The action URL is built by clerk-js and already includes its current
  // `_clerk_js_version`. Forwarding the value from the authorize URL as a
  // hidden form field would submit the same parameter in both the query and
  // body, which FAPI correctly rejects as a duplicate.
  return Array.from(new URLSearchParams(window.location.search).entries()).filter(
    ([key]) => key !== '_clerk_js_version',
  );
}

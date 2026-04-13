import { DEV_BROWSER_KEY } from '@clerk/shared/devBrowser';

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

export function getActionUrl(frontendApi: string, sessionId?: string): string {
  const url = new URL(`https://${frontendApi}/v1/internal/oauth-consent`);
  if (sessionId) {
    url.searchParams.set('_clerk_session_id', sessionId);
  }
  if (canReadLocation()) {
    const dbJwt = new URLSearchParams(window.location.search).get(DEV_BROWSER_KEY);
    if (dbJwt) {
      url.searchParams.set(DEV_BROWSER_KEY, dbJwt);
    }
  }
  return url.toString();
}

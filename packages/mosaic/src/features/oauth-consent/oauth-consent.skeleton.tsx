import { useOAuthConsentController } from './oauth-consent.controller';
import type { OAuthConsentKnownData, OAuthConsentMessages, OAuthConsentReadyModel } from './oauth-consent.types';
import { OAuthConsentView } from './oauth-consent.view';

const PLACEHOLDER_CONSENT: OAuthConsentReadyModel = {
  status: 'ready',
  applicationName: 'Application',
  oauthApplicationName: 'App',
  identifier: 'name@example.com',
  scopes: [
    { scope: 'openid', description: 'Verify your identity' },
    { scope: 'profile', description: 'View your profile' },
    { scope: 'email', description: 'View your email address' },
  ],
  hasOfflineAccess: false,
  organizations: [],
  defaultOrganizationId: null,
  redirectUrl: 'https://example.com/oauth/callback',
  redirectDomain: 'example.com',
  actionUrl: '',
  forwardedParams: [],
  renderBranding: false,
};

export function OAuthConsentSkeleton({
  known,
  messages,
}: {
  known: OAuthConsentKnownData | undefined;
  messages: OAuthConsentMessages;
}) {
  const controller = useOAuthConsentController({ ...PLACEHOLDER_CONSENT, ...known }, messages);
  return (
    <OAuthConsentView
      {...controller}
      skeleton={known ? 'consent' : 'clerk'}
    />
  );
}

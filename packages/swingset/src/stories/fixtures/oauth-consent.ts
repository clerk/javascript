import { useOAuthConsentController } from '@clerk/mosaic/features/oauth-consent/oauth-consent.controller';
import type {
  OAuthConsentReadyModel,
  OAuthConsentScopeRecord,
  OAuthConsentViewProps,
} from '@clerk/mosaic/features/oauth-consent/oauth-consent.types';
import { useMessages } from '@clerk/mosaic/localization';
import { useEffect, useState } from 'react';

const redirectUrl = 'https://app.linear.example.com/oauth/callback';

const baseModel: OAuthConsentReadyModel = {
  status: 'ready',
  applicationName: 'Acme',
  oauthApplicationName: 'Linear',
  clientIdentity: null,
  identifier: 'alice@example.com',
  scopes: [
    { scope: 'profile', description: 'Read your name and profile image' },
    { scope: 'email', description: 'Read your email address' },
    { scope: 'private_metadata', description: null },
  ],
  hasOfflineAccess: false,
  organizations: [],
  defaultOrganizationId: null,
  maxOrganizations: 5,
  redirectUrl,
  redirectDomain: 'example.com',
  actionUrl: '#',
  forwardedParams: [
    ['client_id', 'client_1'],
    ['redirect_uri', redirectUrl],
  ],
  renderBranding: true,
};

export const organizationScopes: OAuthConsentScopeRecord[] = [
  { scope: 'profile', description: 'Read your name and profile image' },
  { scope: 'user:org:read', description: 'Read your organizations' },
];

export const manyScopes: OAuthConsentScopeRecord[] = [
  { scope: 'email', description: 'View your email address' },
  { scope: 'projects', description: 'Read the projects in your account' },
  { scope: 'phone', description: 'View your phone number' },
  { scope: 'issues', description: 'Read the issues assigned to you' },
  { scope: 'comments', description: 'Comment on issues on your behalf' },
  { scope: 'teams', description: 'See the teams you belong to' },
  { scope: 'webhooks', description: 'Create and delete webhooks in your workspace' },
];

const SUBMIT_ROUND_TRIP_MS = 1500;

function useMockSubmit() {
  const [pendingAction, setPendingAction] = useState<'allow' | 'deny'>();

  useEffect(() => {
    const blockNavigation = (event: SubmitEvent) => event.preventDefault();
    document.addEventListener('submit', blockNavigation);
    return () => document.removeEventListener('submit', blockNavigation);
  }, []);

  useEffect(() => {
    if (!pendingAction) {
      return;
    }
    const timeout = setTimeout(() => setPendingAction(undefined), SUBMIT_ROUND_TRIP_MS);
    return () => clearTimeout(timeout);
  }, [pendingAction]);

  return {
    pendingAction,
    onAllow: () => setPendingAction('allow'),
    onDeny: () => setPendingAction('deny'),
  };
}

export function useOAuthConsentFixture(overrides: Partial<OAuthConsentReadyModel> = {}): OAuthConsentViewProps {
  const messages = useMessages('oauthConsent');
  const props = useOAuthConsentController({ ...baseModel, ...overrides }, messages);
  return { ...props, ...useMockSubmit() };
}

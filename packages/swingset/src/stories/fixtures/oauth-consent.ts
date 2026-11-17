import { useOAuthConsentController } from '@clerk/mosaic/features/oauth-consent/oauth-consent.controller';
import type {
  OAuthConsentReadyModel,
  OAuthConsentScopeItem,
  OAuthConsentViewProps,
} from '@clerk/mosaic/features/oauth-consent/oauth-consent.types';
import { useMessages } from '@clerk/mosaic/localization';
import { useEffect, useState } from 'react';

const redirectUrl = 'https://app.linear.example.com/oauth/callback';

const baseModel: OAuthConsentReadyModel = {
  status: 'ready',
  applicationName: 'Acme',
  oauthApplicationName: 'Linear',
  identifier: 'alice@example.com',
  scopes: [
    { scope: 'profile', description: 'Read your name and profile image' },
    { scope: 'email', description: 'Read your email address' },
    { scope: 'private_metadata', description: null },
  ],
  hasOfflineAccess: false,
  organizations: [],
  defaultOrganizationId: null,
  redirectUrl,
  redirectDomain: 'example.com',
  actionUrl: '#',
  forwardedParams: [
    ['client_id', 'client_1'],
    ['redirect_uri', redirectUrl],
  ],
  renderBranding: true,
};

const selectableScopes: OAuthConsentScopeItem[] = [
  { scope: 'email', label: 'View your email address', description: 'alice@example.com', required: true },
  { scope: 'projects', label: 'Read your projects', description: 'Read the projects in your account.' },
  { scope: 'phone', label: 'View your phone number', description: 'Allow Linear to view your phone number' },
];

export const manyScopes: OAuthConsentScopeItem[] = [
  ...selectableScopes,
  { scope: 'issues', label: 'Read your issues', description: 'Read the issues assigned to you.' },
  { scope: 'comments', label: 'Write comments', description: 'Comment on issues on your behalf.' },
  { scope: 'teams', label: 'Read your teams', description: 'See the teams you belong to.' },
  { scope: 'webhooks', label: 'Manage webhooks', description: 'Create and delete webhooks in your workspace.' },
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

export function useOAuthConsentScopeSelectionFixture(
  overrides: Partial<OAuthConsentReadyModel> = {},
  scopes: OAuthConsentScopeItem[] = selectableScopes,
): OAuthConsentViewProps {
  const props = useOAuthConsentFixture(overrides);
  const [checked, setChecked] = useState<readonly string[]>(() => scopes.map(item => item.scope));
  return {
    ...props,
    scopes,
    scopeSelection: {
      checked,
      onCheckedChange: (scope, isChecked) =>
        setChecked(current => (isChecked ? [...current, scope] : current.filter(item => item !== scope))),
    },
  };
}

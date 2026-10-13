import { useOAuthConsentController } from '@clerk/mosaic/features/oauth-consent/oauth-consent.controller';
import type {
  OAuthConsentReadyModel,
  OAuthConsentScopeItem,
  OAuthConsentViewProps,
} from '@clerk/mosaic/features/oauth-consent/oauth-consent.types';
import { useMessages } from '@clerk/mosaic/localization';
import { useState } from 'react';

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

export function useOAuthConsentFixture(overrides: Partial<OAuthConsentReadyModel> = {}) {
  const messages = useMessages('oauthConsent');
  return useOAuthConsentController({ ...baseModel, ...overrides }, messages);
}

export function useOAuthConsentScopeSelectionFixture(
  overrides: Partial<OAuthConsentReadyModel> = {},
): OAuthConsentViewProps {
  const props = useOAuthConsentFixture(overrides);
  const [checked, setChecked] = useState<readonly string[]>(() => selectableScopes.map(item => item.scope));
  return {
    ...props,
    scopes: selectableScopes,
    scopeSelection: {
      checked,
      onCheckedChange: (scope, isChecked) =>
        setChecked(current => (isChecked ? [...current, scope] : current.filter(item => item !== scope))),
    },
  };
}

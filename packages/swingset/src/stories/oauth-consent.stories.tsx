import { OAuthConsentErrorView, OAuthConsentView } from '@clerk/mosaic/features/oauth-consent/oauth-consent.view';

import type { StoryMeta } from '@/lib/types';

import { manyScopes, useOAuthConsentFixture, useOAuthConsentScopeSelectionFixture } from './fixtures/oauth-consent';

export { default as __source } from './oauth-consent.stories?raw';

export const meta: StoryMeta = {
  group: 'OAuth Consent',
  status: 'wip',
  title: 'OAuthConsent',
  label: 'OAuth consent',
  source: 'packages/mosaic/src/features/oauth-consent/oauth-consent.tsx',
};

export function Default() {
  const props = useOAuthConsentScopeSelectionFixture({
    organizations: [
      { value: 'org_1', label: 'My workspace' },
      { value: 'org_2', label: 'Globex' },
    ],
    defaultOrganizationId: 'org_1',
  });
  return <OAuthConsentView {...props} />;
}

export function ScopeList() {
  const props = useOAuthConsentFixture();
  return <OAuthConsentView {...props} />;
}

export function ManyScopes() {
  const props = useOAuthConsentScopeSelectionFixture({}, manyScopes);
  return <OAuthConsentView {...props} />;
}

export function OfflineAccess() {
  const props = useOAuthConsentScopeSelectionFixture({ hasOfflineAccess: true });
  return <OAuthConsentView {...props} />;
}

export function LoadError() {
  return <OAuthConsentErrorView message='The redirect URI is missing.' />;
}

import { Card } from '@clerk/mosaic/components/card';
import { Flow } from '@clerk/mosaic/components/flow';
import { SegmentedControl } from '@clerk/mosaic/components/segmented-control';
import { OAuthConsentSkeleton } from '@clerk/mosaic/features/oauth-consent/oauth-consent.skeleton';
import type { OAuthConsentOrganizationAccess } from '@clerk/mosaic/features/oauth-consent/oauth-consent.types';
import { OAuthConsentError, OAuthConsentView } from '@clerk/mosaic/features/oauth-consent/oauth-consent.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { manyScopes, organizationScopes, useOAuthConsentFixture } from './fixtures/oauth-consent';

export { default as __source } from './oauth-consent.stories?raw';

export const meta: StoryMeta = {
  group: 'Misc',
  status: 'wip',
  title: 'OAuthConsent',
  label: 'OAuth consent',
  source: 'packages/mosaic/src/features/oauth-consent/oauth-consent.tsx',
};

const statuses = ['loading', 'ready', 'error'] as const;
type Status = (typeof statuses)[number];

function isStatus(value: unknown): value is Status {
  return statuses.some(status => status === value);
}

export function Default() {
  const props = useOAuthConsentFixture({
    scopes: organizationScopes,
    organizations: [
      { value: 'org_1', label: 'My workspace' },
      { value: 'org_2', label: 'Globex' },
    ],
    defaultOrganizationId: 'org_1',
  });
  const [status, setStatus] = useState<Status>('ready');
  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'center' }}>
      <SegmentedControl.Root
        aria-label='Status'
        value={status}
        onValueChange={value => {
          if (isStatus(value)) {
            setStatus(value);
          }
        }}
      >
        <SegmentedControl.Item value='loading'>Loading</SegmentedControl.Item>
        <SegmentedControl.Item value='ready'>Consent</SegmentedControl.Item>
        <SegmentedControl.Item value='error'>Error</SegmentedControl.Item>
      </SegmentedControl.Root>
      <Card.Root
        align='center'
        renderBranding
      >
        <Flow.Root
          value={status}
          state={props}
        >
          {state => (
            <>
              <Flow.Step ids={['loading']}>
                <OAuthConsentSkeleton messages={state.messages} />
              </Flow.Step>
              <Flow.Step ids={['ready']}>
                <OAuthConsentView {...state} />
              </Flow.Step>
              <Flow.Step ids={['error']}>
                <OAuthConsentError message='Could not load consent information.' />
              </Flow.Step>
            </>
          )}
        </Flow.Root>
      </Card.Root>
    </div>
  );
}

export function ManyScopes() {
  const props = useOAuthConsentFixture({ scopes: manyScopes });
  return (
    <Card.Root align='center'>
      <OAuthConsentView {...props} />
    </Card.Root>
  );
}

const manyOrganizations = [
  { value: 'org_1', label: 'My workspace' },
  { value: 'org_2', label: 'Globex' },
  { value: 'org_3', label: 'Initech' },
  { value: 'org_4', label: 'Umbrella' },
  { value: 'org_5', label: 'Hooli' },
  { value: 'org_6', label: 'Stark Industries' },
  { value: 'org_7', label: 'Wayne Enterprises' },
];

export function SingleOrganization() {
  const props = useOAuthConsentFixture({
    scopes: organizationScopes,
    organizations: manyOrganizations,
    defaultOrganizationId: 'org_1',
  });
  const [organizationId, setOrganizationId] = useState<string | null>('org_1');
  return (
    <Card.Root align='center'>
      <OAuthConsentView
        {...props}
        organizationSelection={{ organizationId, onOrganizationIdChange: setOrganizationId }}
      />
    </Card.Root>
  );
}

export function MultipleOrganizations() {
  const props = useOAuthConsentFixture({
    scopes: organizationScopes,
    organizations: manyOrganizations,
    defaultOrganizationId: 'org_1',
  });
  return (
    <Card.Root align='center'>
      <OAuthConsentView {...props} />
    </Card.Root>
  );
}

export function OrganizationAccess() {
  const props = useOAuthConsentFixture({
    scopes: organizationScopes,
    organizations: manyOrganizations.slice(0, 3),
    defaultOrganizationId: 'org_1',
  });
  const [access, setAccess] = useState<OAuthConsentOrganizationAccess>('all');
  const [organizationIds, setOrganizationIds] = useState<string[]>([]);
  return (
    <Card.Root align='center'>
      <OAuthConsentView
        {...props}
        organizationSelection={{
          multiple: true,
          access,
          onAccessChange: setAccess,
          organizationIds,
          onOrganizationIdsChange: setOrganizationIds,
        }}
      />
    </Card.Root>
  );
}

export function OfflineAccess() {
  const props = useOAuthConsentFixture({
    scopes: [
      { scope: 'profile', description: 'Read your name and profile image' },
      { scope: 'offline_access', description: 'Stay signed in' },
    ],
    hasOfflineAccess: true,
  });
  return (
    <Card.Root align='center'>
      <OAuthConsentView {...props} />
    </Card.Root>
  );
}

export function UnverifiedApp() {
  const props = useOAuthConsentFixture({ clientIdentity: { registration: 'dynamic' } });
  return (
    <Card.Root align='center'>
      <OAuthConsentView {...props} />
    </Card.Root>
  );
}

export function MetadataDocument() {
  const props = useOAuthConsentFixture({
    clientIdentity: { registration: 'metadata_document', metadataHost: 'claude.ai' },
  });
  return (
    <Card.Root align='center'>
      <OAuthConsentView {...props} />
    </Card.Root>
  );
}

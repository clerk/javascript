import { Card } from '@clerk/mosaic/components/card';
import { Flow } from '@clerk/mosaic/components/flow';
import { SegmentedControl } from '@clerk/mosaic/components/segmented-control';
import type { OAuthConsentOrganizationAccess } from '@clerk/mosaic/features/oauth-consent/oauth-consent.types';
import { OAuthConsentSkeleton } from '@clerk/mosaic/features/oauth-consent/oauth-consent.skeleton';
import { OAuthConsentError, OAuthConsentView } from '@clerk/mosaic/features/oauth-consent/oauth-consent.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { manyScopes, useOAuthConsentFixture, useOAuthConsentScopeSelectionFixture } from './fixtures/oauth-consent';

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
  const props = useOAuthConsentScopeSelectionFixture({
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
      <Card.Root>
        <Flow.Root
          value={status}
          state={props}
        >
          {state => (
            <>
              <Flow.Step ids={['loading']}>
                <OAuthConsentSkeleton
                  known={{
                    applicationName: state.applicationName,
                    identifier: state.identifier,
                    redirectUrl: state.redirectUrl,
                    redirectDomain: state.redirectDomain,
                    actionUrl: state.actionUrl,
                    forwardedParams: state.forwardedParams,
                    renderBranding: false,
                    organizations: state.organizations,
                    defaultOrganizationId: state.organizationId,
                  }}
                  messages={state.messages}
                />
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

export function ScopeList() {
  const props = useOAuthConsentFixture();
  return (
    <Card.Root>
      <OAuthConsentView {...props} />
    </Card.Root>
  );
}

export function ManyScopes() {
  const props = useOAuthConsentScopeSelectionFixture({}, manyScopes);
  return (
    <Card.Root>
      <OAuthConsentView {...props} />
    </Card.Root>
  );
}

export function MultipleOrganizations() {
  const props = useOAuthConsentScopeSelectionFixture({
    organizations: [
      { value: 'org_1', label: 'My workspace' },
      { value: 'org_2', label: 'Globex' },
      { value: 'org_3', label: 'Initech' },
    ],
  });
  const [access, setAccess] = useState<OAuthConsentOrganizationAccess>('all');
  const [selected, setSelected] = useState<string[]>(['org_1']);
  return (
    <Card.Root>
      <OAuthConsentView
        {...props}
        organizationSelection={{ access, onAccessChange: setAccess, selected, onSelectedChange: setSelected }}
      />
    </Card.Root>
  );
}

export function OfflineAccess() {
  const props = useOAuthConsentScopeSelectionFixture({ hasOfflineAccess: true });
  return (
    <Card.Root>
      <OAuthConsentView {...props} />
    </Card.Root>
  );
}

import { Card } from '@clerk/mosaic/components/card';
import { Flow } from '@clerk/mosaic/components/flow';
import { SegmentedControl } from '@clerk/mosaic/components/segmented-control';
import { ConsentSkeleton } from '@clerk/mosaic/features/consent/consent.skeleton';
import type { ConsentOrganizationAccess } from '@clerk/mosaic/features/consent/consent.types';
import { ConsentError, ConsentView } from '@clerk/mosaic/features/consent/consent.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { manyScopes, useConsentFixture, useConsentScopeSelectionFixture } from './fixtures/consent';

export { default as __source } from './consent.stories?raw';

export const meta: StoryMeta = {
  group: 'Misc',
  status: 'wip',
  title: 'Consent',
  label: 'Consent',
  source: 'packages/mosaic/src/features/consent/consent.tsx',
};

const statuses = ['loading', 'ready', 'error'] as const;
type Status = (typeof statuses)[number];

function isStatus(value: unknown): value is Status {
  return statuses.some(status => status === value);
}

export function Default() {
  const props = useConsentScopeSelectionFixture({
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
                <ConsentSkeleton messages={state.messages} />
              </Flow.Step>
              <Flow.Step ids={['ready']}>
                <ConsentView {...state} />
              </Flow.Step>
              <Flow.Step ids={['error']}>
                <ConsentError message='Could not load consent information.' />
              </Flow.Step>
            </>
          )}
        </Flow.Root>
      </Card.Root>
    </div>
  );
}

export function ScopeList() {
  const props = useConsentFixture();
  return (
    <Card.Root align='center'>
      <ConsentView {...props} />
    </Card.Root>
  );
}

export function ManyScopes() {
  const props = useConsentScopeSelectionFixture({}, manyScopes);
  return (
    <Card.Root align='center'>
      <ConsentView {...props} />
    </Card.Root>
  );
}

export function MultipleOrganizations() {
  const props = useConsentScopeSelectionFixture({
    organizations: [
      { value: 'org_1', label: 'My workspace' },
      { value: 'org_2', label: 'Globex' },
      { value: 'org_3', label: 'Initech' },
    ],
  });
  const [access, setAccess] = useState<ConsentOrganizationAccess>('all');
  const [selected, setSelected] = useState<string[]>(['org_1']);
  return (
    <Card.Root align='center'>
      <ConsentView
        {...props}
        organizationSelection={{ access, onAccessChange: setAccess, selected, onSelectedChange: setSelected }}
      />
    </Card.Root>
  );
}

export function OfflineAccess() {
  const props = useConsentScopeSelectionFixture({ hasOfflineAccess: true });
  return (
    <Card.Root align='center'>
      <ConsentView {...props} />
    </Card.Root>
  );
}

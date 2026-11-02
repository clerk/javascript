import type { CreateOrganizationReadyModel } from '@clerk/mosaic/features/create-organization/create-organization.controller';
import {
  useCreateOrganizationController,
  useCreateOrganizationInviteController,
} from '@clerk/mosaic/features/create-organization/create-organization.controller';
import { CreateOrganizationView } from '@clerk/mosaic/features/create-organization/create-organization.view';
import type {
  OrganizationListReadyController,
  OrganizationListReadyModel,
} from '@clerk/mosaic/features/organization-list/organization-list.controller';
import {
  useOrganizationListController,
  useOrganizationListScreenController,
} from '@clerk/mosaic/features/organization-list/organization-list.controller';
import { OrganizationListSkeleton } from '@clerk/mosaic/features/organization-list/organization-list.skeleton';
import type {
  OrganizationListInvitation,
  OrganizationListMembership,
  OrganizationListSuggestion,
} from '@clerk/mosaic/features/organization-list/organization-list.types';
import { OrganizationListView } from '@clerk/mosaic/features/organization-list/organization-list.view';
import { ClerkAPIResponseError } from '@clerk/shared/error';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './organization-list.stories?raw';

export const meta: StoryMeta = {
  group: 'Misc',
  title: 'OrganizationList',
  label: 'Organization list',
  status: 'wip',
  source: 'packages/mosaic/src/features/organization-list/organization-list.tsx',
};

const settleAfter = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const unavailable = () =>
  new ClerkAPIResponseError('Organization not found', {
    status: 404,
    data: [
      {
        code: 'organization_not_found_or_unauthorized',
        message: 'Organization not found',
        long_message: 'Organization not found',
      },
    ],
  });

const initialMemberships: OrganizationListMembership[] = [
  { kind: 'membership', organizationId: 'org_1', name: 'Acme Corporation' },
  { kind: 'membership', organizationId: 'org_2', name: 'Globex' },
];

const initialInvitations: OrganizationListInvitation[] = [
  { kind: 'invitation', id: 'inv_1', organizationId: 'org_3', name: 'Initech', status: 'pending' },
];

const initialSuggestions: OrganizationListSuggestion[] = [
  { kind: 'suggestion', id: 'sug_1', organizationId: 'org_4', name: 'Umbrella', status: 'pending' },
];

const createOrganization: CreateOrganizationReadyModel = {
  status: 'ready',
  slugEnabled: true,
  renderBranding: true,
  onCreate: async () => {
    await settleAfter(1000);
    return { organizationId: 'org_new', skipInvitations: true };
  },
  onInvite: () => settleAfter(1000),
  onComplete: () => Promise.resolve(),
};

function OrganizationListHarness({
  hidePersonal = false,
  failSelect = false,
  empty = false,
}: {
  hidePersonal?: boolean;
  failSelect?: boolean;
  empty?: boolean;
}) {
  const [invitations, setInvitations] = useState(empty ? [] : initialInvitations);
  const [suggestions, setSuggestions] = useState(empty ? [] : initialSuggestions);

  const model: OrganizationListReadyModel = {
    status: 'ready',
    applicationName: 'Acme',
    renderBranding: true,
    hidePersonal,
    organizationsLoading: false,
    memberships: empty ? [] : initialMemberships,
    invitations,
    suggestions,
    paging: { observe: () => {}, hasMore: false },
    createOrganization,
    onSelectOrganization: async () => {
      await settleAfter(1000);
      if (failSelect) {
        throw unavailable();
      }
    },
    onAcceptInvitation: async id => {
      await settleAfter(1000);
      setInvitations(current => current.map(i => (i.id === id ? { ...i, status: 'accepted' } : i)));
    },
    onAcceptSuggestion: async id => {
      await settleAfter(1000);
      setSuggestions(current => current.map(s => (s.id === id ? { ...s, status: 'accepted' } : s)));
    },
  };
  const controller = useOrganizationListController(model);

  if (controller.status !== 'ready') {
    return null;
  }

  return <OrganizationListScreens controller={controller} />;
}

function OrganizationListScreens({ controller }: { controller: OrganizationListReadyController }) {
  const screen = useOrganizationListScreenController(controller);

  if (screen.creating) {
    return (
      <CreateOrganizationHarness
        onComplete={screen.onCreated}
        onCancel={screen.onCancelCreate}
      />
    );
  }

  return (
    <OrganizationListView
      {...controller}
      onCreateOrganization={screen.onCreateOrganization}
    />
  );
}

function CreateOrganizationHarness({ onComplete, onCancel }: { onComplete: () => void; onCancel?: () => void }) {
  const controller = useCreateOrganizationController({
    ...createOrganization,
    onComplete: () => Promise.resolve().then(onComplete),
  });
  const invite = useCreateOrganizationInviteController({
    organizationId: controller.step.step === 'create' ? null : controller.step.organizationId,
    roles: null,
    defaultRole: null,
    onInvite: createOrganization.onInvite,
    onSent: controller.onInvitationsSent,
  });

  return (
    <CreateOrganizationView
      {...controller}
      slugEnabled={createOrganization.slugEnabled}
      invite={invite}
      onCancel={onCancel}
    />
  );
}

export function Default(_args: Record<string, unknown>) {
  return <OrganizationListHarness />;
}

export function WithoutPersonal(_args: Record<string, unknown>) {
  return <OrganizationListHarness hidePersonal />;
}

export function Loading(_args: Record<string, unknown>) {
  return (
    <OrganizationListSkeleton
      hidePersonal={false}
      applicationName='Acme'
      renderBranding
    />
  );
}

export function WithError(_args: Record<string, unknown>) {
  return <OrganizationListHarness failSelect />;
}

export function Empty(_args: Record<string, unknown>) {
  return (
    <OrganizationListHarness
      hidePersonal
      empty
    />
  );
}

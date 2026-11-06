import type { CreateOrganizationReadyModel } from '@clerk/mosaic/features/create-organization/create-organization.controller';
import {
  useCreateOrganizationController,
  useCreateOrganizationInviteController,
} from '@clerk/mosaic/features/create-organization/create-organization.controller';
import { CreateOrganizationSteps } from '@clerk/mosaic/features/create-organization/create-organization.view';
import type {
  OrganizationListInvitation,
  OrganizationListMembership,
  OrganizationListSuggestion,
} from '@clerk/mosaic/features/organization-list/organization-list.types';
import type { TaskChooseOrganizationReadyController } from '@clerk/mosaic/features/task-choose-organization/task-choose-organization.controller';
import {
  useTaskChooseOrganizationController,
  useTaskChooseOrganizationScreenController,
} from '@clerk/mosaic/features/task-choose-organization/task-choose-organization.controller';
import type { TaskChooseOrganizationReadyModel } from '@clerk/mosaic/features/task-choose-organization/task-choose-organization.model';
import { TaskChooseOrganizationSkeleton } from '@clerk/mosaic/features/task-choose-organization/task-choose-organization.skeleton';
import { TaskChooseOrganizationView } from '@clerk/mosaic/features/task-choose-organization/task-choose-organization.view';
import { fill, useMessages } from '@clerk/mosaic/localization';
import { ClerkAPIResponseError } from '@clerk/shared/error';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './task-choose-organization.stories?raw';

export const meta: StoryMeta = {
  group: 'Misc',
  title: 'TaskChooseOrganization',
  label: 'Task: choose organization',
  status: 'wip',
  source: 'packages/mosaic/src/features/task-choose-organization/task-choose-organization.tsx',
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

interface HarnessProps {
  empty?: boolean;
  canCreate?: boolean;
  failSelect?: boolean;
  withDefaults?: boolean;
}

function TaskChooseOrganizationHarness({
  empty = false,
  canCreate = true,
  failSelect = false,
  withDefaults = false,
}: HarnessProps) {
  const [invitations, setInvitations] = useState(empty ? [] : initialInvitations);
  const [suggestions, setSuggestions] = useState(empty ? [] : initialSuggestions);

  const model: TaskChooseOrganizationReadyModel = {
    status: 'ready',
    applicationName: 'Acme',
    renderBranding: true,
    hidePersonal: true,
    organizationsLoading: false,
    identifier: 'alice@example.com',
    exclusiveOrganizationId: null,
    memberships: empty ? [] : initialMemberships,
    invitations,
    suggestions,
    paging: { ref: () => {}, hasMore: false },
    creationDefaults: withDefaults ? { name: 'Initech', slug: 'initech' } : undefined,
    advisory: withDefaults ? { organizationName: 'Initech', organizationDomain: 'initech.com' } : undefined,
    createOrganization: canCreate ? createOrganization : undefined,
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
    onSignOut: () => settleAfter(500),
  };
  const controller = useTaskChooseOrganizationController(model);

  if (controller.status !== 'ready') {
    return null;
  }

  return <TaskChooseOrganizationScreens controller={controller} />;
}

function TaskChooseOrganizationScreens({ controller }: { controller: TaskChooseOrganizationReadyController }) {
  const m = useMessages('taskChooseOrganization');
  const screen = useTaskChooseOrganizationScreenController(controller);

  return (
    <TaskChooseOrganizationView
      {...controller}
      step={screen.step}
      createSteps={
        controller.createOrganization ? (
          <CreateOrganizationStepsHarness
            initialValues={controller.creationDefaults}
            notice={controller.advisory ? fill(m.organizationAlreadyExists, { ...controller.advisory }) : undefined}
            onCancel={screen.onCancelCreate}
          />
        ) : undefined
      }
      onCreateOrganization={screen.onCreateOrganization}
    />
  );
}

function CreateOrganizationStepsHarness({
  initialValues,
  notice,
  onCancel,
}: {
  initialValues?: { name: string; slug: string };
  notice?: string;
  onCancel?: () => void;
}) {
  const controller = useCreateOrganizationController(createOrganization, { initialValues });
  const invite = useCreateOrganizationInviteController({
    organizationId: controller.step.step === 'create' ? null : controller.step.organizationId,
    roles: null,
    defaultRole: null,
    onInvite: createOrganization.onInvite,
    onSent: controller.onInvitationsSent,
  });

  return (
    <CreateOrganizationSteps
      {...controller}
      slugEnabled={createOrganization.slugEnabled}
      invite={invite}
      notice={notice}
      onCancel={onCancel}
    />
  );
}

export function Default(_args: Record<string, unknown>) {
  return <TaskChooseOrganizationHarness />;
}

export function WithoutCreate(_args: Record<string, unknown>) {
  return <TaskChooseOrganizationHarness canCreate={false} />;
}

export function Empty(_args: Record<string, unknown>) {
  return <TaskChooseOrganizationHarness empty />;
}

export function WithDefaults(_args: Record<string, unknown>) {
  return (
    <TaskChooseOrganizationHarness
      empty
      withDefaults
    />
  );
}

export function Unavailable(_args: Record<string, unknown>) {
  return (
    <TaskChooseOrganizationHarness
      empty
      canCreate={false}
    />
  );
}

export function Loading(_args: Record<string, unknown>) {
  return (
    <TaskChooseOrganizationSkeleton
      canCreate
      identifier='alice@example.com'
      renderBranding
    />
  );
}

export function WithError(_args: Record<string, unknown>) {
  return <TaskChooseOrganizationHarness failSelect />;
}

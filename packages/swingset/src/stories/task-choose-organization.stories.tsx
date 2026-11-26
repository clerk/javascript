import type { CreateOrganizationReadyModel } from '@clerk/mosaic/features/create-organization/create-organization.controller';
import {
  useCreateOrganizationController,
  useCreateOrganizationInviteController,
} from '@clerk/mosaic/features/create-organization/create-organization.controller';
import { CreateOrganizationSteps } from '@clerk/mosaic/features/create-organization/create-organization.view';
import type {
  OrganizationListInvitation,
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

const defaultOrgLogo =
  'https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18xbHlXRFppb2JyNjAwQUtVZVFEb1NsckVtb00iLCJyaWQiOiJvcmdfMnp6WVh1TURBRTBYWFh5Q1lHN3dyQXRFd0VpIiwiaW5pdGlhbHMiOiJQIn0?width=48';

const portrait = (path: string) => `https://randomuser.me/api/portraits/${path}.jpg`;

const initialInvitations: OrganizationListInvitation[] = [
  {
    kind: 'invitation',
    id: 'inv_1',
    organizationId: 'org_3',
    name: 'Initech',
    imageUrl: defaultOrgLogo,
    status: 'pending',
    inviterName: 'Sam Lee',
    membersCount: 6,
    members: [
      { name: 'Sam Lee', imageUrl: portrait('men/32') },
      { name: 'Priya Patel', imageUrl: portrait('women/44') },
      { name: 'Diego Ramos', imageUrl: portrait('men/75') },
    ],
  },
  {
    kind: 'invitation',
    id: 'inv_2',
    organizationId: 'org_5',
    name: 'Globex',
    imageUrl: defaultOrgLogo,
    status: 'pending',
    inviterName: 'Hank Scorpio',
    membersCount: 1,
    members: [{ name: 'Hank Scorpio', imageUrl: portrait('men/52') }],
  },
];

const initialSuggestions: OrganizationListSuggestion[] = [
  {
    kind: 'suggestion',
    id: 'sug_1',
    organizationId: 'org_4',
    name: 'Umbrella',
    imageUrl: defaultOrgLogo,
    status: 'pending',
    matchedDomain: 'umbrella.com',
    membersCount: 2,
    members: [
      { name: 'Ada Wong', imageUrl: portrait('women/68') },
      { name: 'Leon Kennedy', imageUrl: portrait('men/11') },
    ],
  },
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
  optional?: boolean;
  onComplete?: () => void;
  canCreate?: boolean;
  failSelect?: boolean;
  withDefaults?: boolean;
  suggestionsOnly?: boolean;
}

export function TaskChooseOrganizationHarness({
  empty = false,
  optional = false,
  onComplete,
  canCreate = true,
  failSelect = false,
  withDefaults = false,
  suggestionsOnly = false,
}: HarnessProps) {
  const [invitations, setInvitations] = useState(empty || suggestionsOnly ? [] : initialInvitations);
  const [suggestions, setSuggestions] = useState(empty ? [] : initialSuggestions);

  const model: TaskChooseOrganizationReadyModel = {
    status: 'ready',
    applicationName: 'Acme',
    applicationLogoUrl: 'https://avatars.githubusercontent.com/u/49538330?v=4',
    renderBranding: true,
    hidePersonal: true,
    organizationsLoading: false,
    identifier: 'alice@example.com',
    exclusiveOrganizationId: null,
    memberships: [],
    invitations,
    suggestions,
    paging: { ref: () => {}, hasMore: false },
    creationDefaults: withDefaults ? { name: 'Initech', slug: 'initech' } : undefined,
    advisory: withDefaults ? { organizationName: 'Initech', organizationDomain: 'initech.com' } : undefined,
    createOrganization: canCreate ? { ...createOrganization, onComplete: async () => onComplete?.() } : undefined,
    onSelectOrganization: async () => {
      await settleAfter(1000);
      if (failSelect) {
        throw unavailable();
      }
      onComplete?.();
    },
    onAcceptInvitation: async id => {
      await settleAfter(1000);
      setInvitations(current => current.map(i => (i.id === id ? { ...i, status: 'accepted' } : i)));
      await settleAfter(600);
      if (failSelect) {
        throw unavailable();
      }
      onComplete?.();
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

  return (
    <TaskChooseOrganizationScreens
      controller={controller}
      onSkip={optional ? onComplete : undefined}
    />
  );
}

function TaskChooseOrganizationScreens({
  controller,
  onSkip,
}: {
  controller: TaskChooseOrganizationReadyController;
  onSkip?: () => void;
}) {
  const m = useMessages('taskChooseOrganization');
  const screen = useTaskChooseOrganizationScreenController(controller);
  const create = useCreateOrganizationController(controller.createOrganization ?? createOrganization, {
    initialValues: controller.creationDefaults,
  });
  const invite = useCreateOrganizationInviteController({
    organizationId: create.step.step === 'create' ? null : create.step.organizationId,
    roles: null,
    defaultRole: null,
    onInvite: createOrganization.onInvite,
    onSent: create.onInvitationsSent,
  });

  return (
    <TaskChooseOrganizationView
      {...controller}
      onSkip={onSkip}
      step={screen.step}
      createSteps={
        controller.createOrganization ? (
          <CreateOrganizationSteps
            {...create}
            slugEnabled={createOrganization.slugEnabled}
            invite={invite}
            notice={controller.advisory ? fill(m.organizationAlreadyExists, { ...controller.advisory }) : undefined}
            onCancel={screen.onCancelCreate}
          />
        ) : undefined
      }
      onCreateOrganization={screen.onCreateOrganization}
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

export function RequestPending(_args: Record<string, unknown>) {
  return <TaskChooseOrganizationHarness suggestionsOnly />;
}

export function WithError(_args: Record<string, unknown>) {
  return <TaskChooseOrganizationHarness failSelect />;
}

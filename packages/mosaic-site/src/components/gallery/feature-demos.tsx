'use client';
import { useForm } from '@clerk/mosaic/components/form';
import type { CreateOrganizationReadyModel } from '@clerk/mosaic/features/create-organization/create-organization.controller';
import {
  useCreateOrganizationController,
  useCreateOrganizationInviteController,
} from '@clerk/mosaic/features/create-organization/create-organization.controller';
import {
  CreateOrganizationSteps,
  CreateOrganizationView,
} from '@clerk/mosaic/features/create-organization/create-organization.view';
import type {
  OrganizationListReadyController,
  OrganizationListReadyModel,
} from '@clerk/mosaic/features/organization-list/organization-list.controller';
import {
  useOrganizationListController,
  useOrganizationListScreenController,
} from '@clerk/mosaic/features/organization-list/organization-list.controller';
import type {
  OrganizationListInvitation,
  OrganizationListMembership,
  OrganizationListSuggestion,
} from '@clerk/mosaic/features/organization-list/organization-list.types';
import { OrganizationListView } from '@clerk/mosaic/features/organization-list/organization-list.view';
import { SwitcherView } from '@clerk/mosaic/features/switcher/switcher.view';
import type { WaitlistStep, WaitlistValues } from '@clerk/mosaic/features/waitlist/waitlist.types';
import { WaitlistView } from '@clerk/mosaic/features/waitlist/waitlist.view';
import { nestLabsWithClerkApp, usePrototype } from '@swingset/stories/fixtures/switcher';
import * as React from 'react';

const settleAfter = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const roles = {
  roles: [
    { key: 'org:admin', name: 'Admin' },
    { key: 'org:member', name: 'Member' },
  ],
  hasRoleSetMigration: false,
};

const createOrganization: CreateOrganizationReadyModel = {
  status: 'ready',
  slugEnabled: true,
  renderBranding: true,
  onCreate: async () => {
    await settleAfter(1000);
    return { organizationId: 'org_new', skipInvitations: false };
  },
  onInvite: () => settleAfter(1000),
  onComplete: () => Promise.resolve(),
};

const memberships: OrganizationListMembership[] = [
  { kind: 'membership', organizationId: 'org_1', name: 'Acme Corporation' },
  { kind: 'membership', organizationId: 'org_2', name: 'Globex' },
];

const initialInvitations: OrganizationListInvitation[] = [
  { kind: 'invitation', id: 'inv_1', organizationId: 'org_3', name: 'Initech', status: 'pending' },
];

const initialSuggestions: OrganizationListSuggestion[] = [
  { kind: 'suggestion', id: 'sug_1', organizationId: 'org_4', name: 'Umbrella', status: 'pending' },
];

export function WaitlistDemo() {
  const [step, setStep] = React.useState<WaitlistStep>('form');
  const form = useForm<WaitlistValues>({
    initialValues: { emailAddress: '' },
    canSubmit: values => values.emailAddress.trim() !== '',
    onSubmit: async () => {
      await settleAfter(800);
      setStep('joined');
    },
  });
  return (
    <div className='flex justify-center'>
      <WaitlistView
        step={step}
        form={form}
        renderBranding
        isRedirecting={false}
        onSignIn={() => {}}
      />
    </div>
  );
}

export function OrganizationSwitcherDemo() {
  const prototype = usePrototype({ organizations: nestLabsWithClerkApp, hidePersonal: true });
  return (
    <SwitcherView
      {...prototype}
      mode='organization'
    />
  );
}

function CreateOrganizationHarness() {
  const [round, setRound] = React.useState(0);
  return (
    <CreateOrganizationRound
      key={round}
      onRestart={() => setRound(current => current + 1)}
    />
  );
}

function CreateOrganizationRound({ onRestart }: { onRestart: () => void }) {
  const controller = useCreateOrganizationController(createOrganization, { onRestart });
  const invite = useCreateOrganizationInviteController({
    organizationId: controller.step.step === 'create' ? null : controller.step.organizationId,
    roles,
    defaultRole: 'org:member',
    onInvite: createOrganization.onInvite,
    onSent: controller.onInvitationsSent,
  });
  return (
    <CreateOrganizationView
      {...controller}
      slugEnabled={createOrganization.slugEnabled}
      invite={invite}
    />
  );
}

export function CreateOrganizationDemo() {
  return (
    <div className='flex justify-center'>
      <CreateOrganizationHarness />
    </div>
  );
}

function OrganizationListSteps({ onComplete, onCancel }: { onComplete: () => void; onCancel?: () => void }) {
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
    <CreateOrganizationSteps
      {...controller}
      slugEnabled={createOrganization.slugEnabled}
      invite={invite}
      onCancel={onCancel}
    />
  );
}

function OrganizationListScreens({ controller }: { controller: OrganizationListReadyController }) {
  const screen = useOrganizationListScreenController(controller);
  return (
    <OrganizationListView
      {...controller}
      creating={screen.creating}
      createSteps={
        <OrganizationListSteps
          onComplete={screen.onCreated}
          onCancel={screen.onCancelCreate}
        />
      }
      onCreateOrganization={screen.onCreateOrganization}
    />
  );
}

function OrganizationListHarness() {
  const [invitations, setInvitations] = React.useState(initialInvitations);
  const [suggestions, setSuggestions] = React.useState(initialSuggestions);
  const model: OrganizationListReadyModel = {
    status: 'ready',
    applicationName: 'Acme',
    renderBranding: true,
    hidePersonal: false,
    organizationsLoading: false,
    memberships,
    invitations,
    suggestions,
    paging: { ref: () => {}, hasMore: false },
    createOrganization,
    onSelectOrganization: () => settleAfter(1000),
    onAcceptInvitation: async id => {
      await settleAfter(1000);
      setInvitations(current => current.map(item => (item.id === id ? { ...item, status: 'accepted' } : item)));
    },
    onAcceptSuggestion: async id => {
      await settleAfter(1000);
      setSuggestions(current => current.map(item => (item.id === id ? { ...item, status: 'accepted' } : item)));
    },
  };
  const controller = useOrganizationListController(model);
  if (controller.status !== 'ready') {
    return null;
  }
  return <OrganizationListScreens controller={controller} />;
}

export function OrganizationListDemo() {
  return (
    <div className='flex justify-center'>
      <OrganizationListHarness />
    </div>
  );
}

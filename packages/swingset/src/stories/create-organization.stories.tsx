import type { CreateOrganizationReadyModel } from '@clerk/mosaic/features/create-organization/create-organization.controller';
import {
  useCreateOrganizationController,
  useCreateOrganizationInviteController,
} from '@clerk/mosaic/features/create-organization/create-organization.controller';
import { CreateOrganizationView } from '@clerk/mosaic/features/create-organization/create-organization.view';
import { save } from '@clerk/mosaic/utils/errors';
import { ClerkAPIResponseError } from '@clerk/shared/error';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './create-organization.stories?raw';

export const meta: StoryMeta = {
  group: 'Misc',
  title: 'CreateOrganization',
  label: 'Create organization',
  status: 'wip',
  source: 'packages/mosaic/src/features/create-organization/create-organization.tsx',
};

const roles = {
  roles: [
    { key: 'org:admin', name: 'Admin' },
    { key: 'org:member', name: 'Member' },
  ],
  hasRoleSetMigration: false,
};

const settleAfter = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const slugTaken = () =>
  new ClerkAPIResponseError('This slug is taken. Please try another.', {
    status: 422,
    data: [
      {
        code: 'form_identifier_exists',
        message: 'is taken',
        long_message: 'This slug is taken. Please try another.',
        meta: { param_name: 'slug' },
      },
    ],
  });

function CreateOrganizationHarness({
  slugEnabled = true,
  skipInvitations = false,
  failCreate = false,
}: {
  slugEnabled?: boolean;
  skipInvitations?: boolean;
  failCreate?: boolean;
}) {
  const model: CreateOrganizationReadyModel = {
    status: 'ready',
    slugEnabled,
    renderBranding: true,
    onCreate: async () => {
      await save(async () => {
        await settleAfter(1000);
        if (failCreate) {
          throw slugTaken();
        }
      }, ['name', 'slug']);
      return { organizationId: 'org_1', skipInvitations };
    },
    onInvite: () => settleAfter(1000),
    onComplete: () => {},
  };
  const controller = useCreateOrganizationController(model);
  const invite = useCreateOrganizationInviteController({
    organizationId: controller.step.step === 'create' ? null : controller.step.organizationId,
    roles,
    defaultRole: 'org:member',
    onInvite: model.onInvite,
    onSent: controller.onInvitationsSent,
  });

  return (
    <CreateOrganizationView
      {...controller}
      slugEnabled={model.slugEnabled}
      invite={invite}
    />
  );
}

export function Default(_args: Record<string, unknown>) {
  return <CreateOrganizationHarness />;
}

export function WithoutSlug(_args: Record<string, unknown>) {
  return <CreateOrganizationHarness slugEnabled={false} />;
}

export function WithError(_args: Record<string, unknown>) {
  return <CreateOrganizationHarness failCreate />;
}

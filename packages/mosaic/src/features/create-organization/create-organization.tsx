'use client';

import type { ReactElement, ReactNode } from 'react';

import { useMembersPanelRolesModel } from '../organization-profile/organization-profile-members-panel/organization-profile-members-panel.model';
import type { CreateOrganizationReadyModel } from './create-organization.controller';
import {
  useCreateOrganizationController,
  useCreateOrganizationInviteController,
} from './create-organization.controller';
import type { CreateOrganizationModelOptions } from './create-organization.model';
import { useCreateOrganizationModel } from './create-organization.model';
import { CreateOrganizationView } from './create-organization.view';

/** Everything `<CreateOrganization />` takes: where to go once the organization exists, and whether to offer invitations first. */
export type CreateOrganizationProps = CreateOrganizationModelOptions & {
  /**
   * Rendered while Clerk loads. Nothing renders once Clerk answers that nobody is signed in.
   */
  fallback?: ReactNode;
};

/**
 * A form that creates an organization: a logo, a name and, where the instance uses them, a slug.
 * The new organization becomes the active one. Unless `skipInvitationScreen` is set, or the
 * organization can hold only one member, the next step invites members to it. It renders
 * `fallback` until Clerk answers, and nothing at all when nobody is signed in.
 *
 * @example
 * ```tsx
 * import { CreateOrganization } from '@clerk/mosaic';
 *
 * <CreateOrganization />
 * ```
 *
 * @example
 * `afterCreateOrganizationUrl` is where the flow lands once it finishes, and takes a `:param`
 * template, a plain path, or a function of the new organization.
 * ```tsx
 * <CreateOrganization
 *   afterCreateOrganizationUrl='/orgs/:slug'
 *   skipInvitationScreen
 * />
 * ```
 */
export function CreateOrganization({ fallback, ...options }: CreateOrganizationProps = {}): ReactElement | null {
  const model = useCreateOrganizationModel(options);

  if (model.status === 'loading') {
    return <>{fallback}</>;
  }

  if (model.status === 'hidden') {
    return null;
  }

  return <ConnectedCreateOrganization model={model} />;
}

function ConnectedCreateOrganization({ model }: { model: CreateOrganizationReadyModel }) {
  const controller = useCreateOrganizationController(model);
  const organizationId = controller.step.step === 'create' ? null : controller.step.organizationId;
  const roles = useMembersPanelRolesModel(controller.step.step === 'invite');
  const invite = useCreateOrganizationInviteController({
    organizationId,
    roles: roles.roles,
    defaultRole: roles.defaultRole,
    onInvite: model.onInvite,
    onSent: controller.onInvitationsSent,
  });

  return (
    <CreateOrganizationView
      {...controller}
      slugEnabled={model.slugEnabled}
      renderBranding={model.renderBranding}
      invite={invite}
    />
  );
}

import { useOrganization, useOrganizationList, useSession, useUser } from '@clerk/shared/react';

import { useMosaicEnvironment } from '../../../hooks/use-mosaic-environment';
import { useMosaicRouter } from '../../../hooks/use-mosaic-router';
import { useOrganizationProfileOptions } from '../organization-profile.provider';

const organizationListParams = {
  userMemberships: { infinite: true },
  userInvitations: { infinite: true },
} satisfies Parameters<typeof useOrganizationList>[0];

export type OrganizationProfileDangerSectionModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | {
      status: 'ready';
      organizationId: string;
      name: string;
      memberCount: number;
      leaveOrganization: () => Promise<void>;
      deleteOrganization?: () => Promise<void>;
    };

export function useOrganizationProfileDangerSectionModel(): OrganizationProfileDangerSectionModel {
  const { afterLeaveOrganizationUrl } = useOrganizationProfileOptions();
  const { isLoaded, organization, membership } = useOrganization();
  const { user } = useUser();
  const { session } = useSession();
  const { userMemberships, userInvitations } = useOrganizationList(organizationListParams);
  const environment = useMosaicEnvironment();
  const router = useMosaicRouter();

  if (!isLoaded) {
    return { status: 'loading' };
  }

  if (!organization || !user) {
    return { status: 'hidden' };
  }

  const afterLeave = () => {
    void userMemberships.revalidate?.();
    void userInvitations.revalidate?.();
    const url = afterLeaveOrganizationUrl || environment?.displayConfig.afterLeaveOrganizationUrl;
    if (url) {
      void router.navigate(url);
    }
  };

  const canDelete =
    Boolean(membership) &&
    organization.adminDeleteEnabled &&
    (session?.checkAuthorization({ permission: 'org:sys_profile:delete' }) ?? false);

  return {
    status: 'ready',
    organizationId: organization.id,
    name: organization.name,
    memberCount: organization.membersCount,
    leaveOrganization: async () => {
      await user.leaveOrganization(organization.id);
      afterLeave();
    },
    deleteOrganization: canDelete
      ? async () => {
          await organization.destroy();
          afterLeave();
        }
      : undefined,
  };
}

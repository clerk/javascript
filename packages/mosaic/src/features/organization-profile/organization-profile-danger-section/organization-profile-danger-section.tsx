import { useOrganization, useOrganizationList, useSession, useUser } from '@clerk/shared/react';

import { useDestructiveController } from '../../../blocks/destructive/destructive.controller';
import { useMosaicEnvironment } from '../../../hooks/use-mosaic-environment';
import { useMosaicRouter } from '../../../hooks/use-mosaic-router';
import { OrganizationProfileDangerSectionView } from './organization-profile-danger-section.view';

const organizationListParams = {
  userMemberships: { infinite: true },
  userInvitations: { infinite: true },
} satisfies Parameters<typeof useOrganizationList>[0];

export type OrganizationProfileDangerSectionProps = {
  afterLeaveOrganizationUrl?: string;
  fallback?: React.ReactNode;
};

export function OrganizationProfileDangerSection(props: OrganizationProfileDangerSectionProps) {
  // -- Model --
  const { isLoaded, organization, membership } = useOrganization();
  const { user } = useUser();
  const { session } = useSession();
  const { userMemberships, userInvitations } = useOrganizationList(organizationListParams);
  const environment = useMosaicEnvironment();
  const router = useMosaicRouter();

  const canDelete =
    Boolean(membership) &&
    Boolean(organization?.adminDeleteEnabled) &&
    (session?.checkAuthorization({ permission: 'org:sys_profile:delete' }) ?? false);

  const afterLeave = async () => {
    void userMemberships.revalidate?.();
    void userInvitations.revalidate?.();
    const url = props.afterLeaveOrganizationUrl || environment?.displayConfig.afterLeaveOrganizationUrl;
    if (url) {
      await router.navigate(url);
    }
  };

  const leaveOrganization = async () => {
    if (!organization || !user) {
      return;
    }
    await user.leaveOrganization(organization.id);
    await afterLeave();
  };

  const deleteOrganization = async () => {
    if (!organization) {
      return;
    }
    await organization.destroy();
    await afterLeave();
  };

  // -- Controllers --
  const leave = useDestructiveController({ onDelete: leaveOrganization });
  const destroy = useDestructiveController({ onDelete: deleteOrganization });

  // -- View --
  if (!isLoaded) {
    return props.fallback ?? null;
  }

  if (!organization || !user) {
    return null;
  }

  return (
    <OrganizationProfileDangerSectionView
      name={organization.name}
      memberCount={organization.membersCount}
      leave={leave}
      destroy={canDelete ? destroy : undefined}
    />
  );
}

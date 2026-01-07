import { useUser } from '@clerk/shared/react/index';

import { useEnvironment } from '../contexts';
import { Action } from '../elements/Actions';
import { Add } from '../icons';

type CreateOrganizationActionProps = Omit<React.ComponentProps<typeof Action>, 'icon'>;

export const CreateOrganizationAction = (props: CreateOrganizationActionProps) => {
  const { user } = useUser();
  const { organizationSettings } = useEnvironment();

  const currentMembershipCount = (user?.organizationMemberships ?? []).length;
  const canCreateAdditionalMembership = organizationSettings.maxAllowedMemberships < currentMembershipCount;

  if (!user?.createOrganizationEnabled || !canCreateAdditionalMembership) {
    return null;
  }

  return (
    <Action
      {...props}
      icon={Add}
    />
  );
};

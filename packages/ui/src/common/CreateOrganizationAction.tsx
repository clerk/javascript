import { useUser } from '@clerk/shared/react/index';

import { Action } from '../elements/Actions';
import { Add } from '../icons';

type CreateOrganizationActionProps = Omit<React.ComponentProps<typeof Action>, 'icon'>;

export const CreateOrganizationAction = (props: CreateOrganizationActionProps) => {
  const { user } = useUser();

  if (!user?.createOrganizationEnabled) {
    return null;
  }

  return (
    <Action
      {...props}
      icon={Add}
    />
  );
};

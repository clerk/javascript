import { useUser } from '@clerk/shared/react/index';

import { Action } from '../elements/Actions';
import { Plus } from '../icons';

type CreateOrganizationActionProps = Omit<React.ComponentProps<typeof Action>, 'icon'> & {
  icon?: React.ComponentProps<typeof Action>['icon'];
};

export const CreateOrganizationAction = (props: CreateOrganizationActionProps) => {
  const { icon = Plus, ...rest } = props;
  const { user } = useUser();

  if (!user?.createOrganizationEnabled) {
    return null;
  }

  return (
    <Action
      {...rest}
      icon={icon}
    />
  );
};

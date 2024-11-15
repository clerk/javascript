import type { UserResource } from '@clerk/types';

import { getFullName, getInitials } from '../../utils/user';
import { useAppearance } from '../customizables';
import { Avatar } from '../elements';
import type { PropsOfComponent } from '../styledSystem';

type UserAvatarProps = Omit<PropsOfComponent<typeof Avatar>, 'imageUrl'> &
  Partial<Pick<UserResource, 'firstName' | 'lastName' | 'imageUrl'>> & {
    name?: string | null;
    avatarUrl?: string | null;
  };

export const UserAvatar = (props: UserAvatarProps) => {
  const { name, firstName, lastName, avatarUrl, imageUrl, ...rest } = props;
  const { nameFieldsOrder } = useAppearance().parsedLayout;
  const generatedName = getFullName({ name, firstName, lastName, reverse: nameFieldsOrder === 'reversed' });
  const initials = getInitials({ name, firstName, lastName });

  return (
    <Avatar
      title={generatedName}
      initials={initials}
      imageUrl={avatarUrl ? avatarUrl : imageUrl}
      {...rest}
    />
  );
};

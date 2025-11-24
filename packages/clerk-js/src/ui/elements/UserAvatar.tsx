import type { UserResource } from '@clerk/shared/types';

import { getFullName, getInitials } from '../../utils/user';
import type { PropsOfComponent } from '../styledSystem';
import { Avatar } from './Avatar';

type UserAvatarProps = Omit<PropsOfComponent<typeof Avatar>, 'imageUrl'> &
  Partial<Pick<UserResource, 'firstName' | 'lastName' | 'imageUrl'>> & {
    name?: string | null;
    avatarUrl?: string | null;
  };

export const UserAvatar = (props: UserAvatarProps) => {
  const { name, firstName, lastName, avatarUrl, imageUrl, ...rest } = props;
  const generatedName = getFullName({ name, firstName, lastName });
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

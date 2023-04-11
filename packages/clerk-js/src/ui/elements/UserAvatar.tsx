import type { UserResource } from '@clerk/types';

import { getFullName, getInitials } from '../../utils/user';
import { Avatar } from '../elements';
import type { PropsOfComponent } from '../styledSystem';

type UserAvatarProps = PropsOfComponent<typeof Avatar> &
  Partial<Pick<UserResource, 'firstName' | 'lastName' | 'profileImageUrl'>> & {
    name?: string | null;
  };

export const UserAvatar = (props: UserAvatarProps) => {
  const { name, firstName, lastName, profileImageUrl, ...rest } = props;
  const generatedName = getFullName({ name, firstName, lastName });
  const initials = getInitials({ name, firstName, lastName });

  return (
    <Avatar
      title={generatedName}
      initials={initials}
      imageUrl={profileImageUrl}
      {...rest}
    />
  );
};

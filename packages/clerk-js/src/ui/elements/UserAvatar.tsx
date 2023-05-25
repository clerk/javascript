import type { UserResource } from '@clerk/types';

import { getFullName, getInitials } from '../../utils/user';
import { useOptions } from '../contexts';
import { Avatar } from '../elements';
import type { PropsOfComponent } from '../styledSystem';

type UserAvatarProps = Omit<PropsOfComponent<typeof Avatar>, 'imageUrl'> &
  Partial<Pick<UserResource, 'firstName' | 'lastName' | 'profileImageUrl' | 'imageUrl'>> & {
    name?: string | null;
    avatarUrl?: string | null;
  };

export const UserAvatar = (props: UserAvatarProps) => {
  //TODO: replace profileImageUrl with imageUrl
  const { name, firstName, lastName, avatarUrl, imageUrl, profileImageUrl, ...rest } = props;
  const generatedName = getFullName({ name, firstName, lastName });
  const initials = getInitials({ name, firstName, lastName });
  const { experimental_enableClerkImages } = useOptions();

  return (
    <Avatar
      title={generatedName}
      initials={initials}
      imageUrl={avatarUrl ? avatarUrl : experimental_enableClerkImages ? imageUrl : profileImageUrl}
      {...rest}
    />
  );
};

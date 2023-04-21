import type { UserResource } from '@clerk/types';

import { getFullName, getInitials } from '../../utils/user';
import { useOptions } from '../contexts';
import { Avatar } from '../elements';
import type { PropsOfComponent } from '../styledSystem';

type UserAvatarProps = PropsOfComponent<typeof Avatar> &
  Partial<Pick<UserResource, 'firstName' | 'lastName' | 'profileImageUrl' | 'experimental_imageUrl'>> & {
    name?: string | null;
  };

export const UserAvatar = (props: UserAvatarProps) => {
  //TODO: replace profileImageUrl with imageUrl
  const { name, firstName, lastName, imageUrl, experimental_imageUrl, profileImageUrl, ...rest } = props;
  const generatedName = getFullName({ name, firstName, lastName });
  const initials = getInitials({ name, firstName, lastName });
  const { experimental_enableClerkImages } = useOptions();

  return (
    <Avatar
      title={generatedName}
      initials={initials}
      imageUrl={imageUrl ? imageUrl : experimental_enableClerkImages ? experimental_imageUrl : profileImageUrl}
      {...rest}
    />
  );
};

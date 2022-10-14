import React from 'react';

import { Avatar } from '../elements';
import { PropsOfComponent } from '../styledSystem';
import { getFullName, getInitials } from '../utils';

type UserAvatarProps = PropsOfComponent<typeof Avatar> & {
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string;
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

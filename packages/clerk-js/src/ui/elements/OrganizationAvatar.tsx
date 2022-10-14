import React from 'react';

import { Avatar } from '../elements';
import { PropsOfComponent } from '../styledSystem';

type OrganizationAvatarProps = PropsOfComponent<typeof Avatar> & {
  name?: string;
  logoUrl?: string;
};

export const OrganizationAvatar = (props: OrganizationAvatarProps) => {
  const { name, logoUrl, ...rest } = props;

  return (
    <Avatar
      title={name}
      imageUrl={logoUrl}
      rounded={false}
      {...rest}
    />
  );
};

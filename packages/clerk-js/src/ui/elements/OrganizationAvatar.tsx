import { OrganizationResource } from '@clerk/types';
import React from 'react';

import { Avatar } from '../elements';
import { PropsOfComponent } from '../styledSystem';

type OrganizationAvatarProps = PropsOfComponent<typeof Avatar> &
  Partial<Pick<OrganizationResource, 'name' | 'logoUrl'>>;

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

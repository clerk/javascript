import type { OrganizationResource } from '@clerk/shared/types';

import type { PropsOfComponent } from '../styledSystem';
import { Avatar } from './Avatar';

type OrganizationAvatarProps = PropsOfComponent<typeof Avatar> &
  Partial<Pick<OrganizationResource, 'name' | 'imageUrl'>>;

export const OrganizationAvatar = (props: OrganizationAvatarProps) => {
  const { name = '', imageUrl, ...rest } = props;
  return (
    <Avatar
      title={name}
      initials={(name || ' ')[0]}
      imageUrl={imageUrl}
      rounded={false}
      {...rest}
    />
  );
};

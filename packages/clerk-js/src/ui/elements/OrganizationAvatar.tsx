import type { OrganizationResource } from '@clerk/types';

import { Avatar } from '../elements';
import type { PropsOfComponent } from '../styledSystem';

type OrganizationAvatarProps = PropsOfComponent<typeof Avatar> &
  Partial<Pick<OrganizationResource, 'name' | 'logoUrl' | 'experimental_imageUrl'>>;

export const OrganizationAvatar = (props: OrganizationAvatarProps) => {
  const { name = '', logoUrl, experimental_imageUrl, ...rest } = props;
  return (
    <Avatar
      title={name}
      initials={(name || ' ')[0]}
      imageUrl={experimental_imageUrl}
      rounded={false}
      {...rest}
    />
  );
};

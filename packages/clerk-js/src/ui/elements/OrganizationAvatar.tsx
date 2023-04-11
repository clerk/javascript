import type { OrganizationResource } from '@clerk/types';

import { Avatar } from '../elements';
import type { PropsOfComponent } from '../styledSystem';

type OrganizationAvatarProps = PropsOfComponent<typeof Avatar> &
  Partial<Pick<OrganizationResource, 'name' | 'logoUrl'>>;

export const OrganizationAvatar = (props: OrganizationAvatarProps) => {
  //TODO: replace logoUrl with imageUrl
  const { name = '', logoUrl, imageUrl, ...rest } = props;

  return (
    <Avatar
      title={name}
      initials={(name || ' ')[0]}
      imageUrl={logoUrl}
      rounded={false}
      {...rest}
    />
  );
};

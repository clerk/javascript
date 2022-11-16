import { OrganizationResource } from '@clerk/types';

import { Avatar } from '../elements';
import { PropsOfComponent } from '../styledSystem';

type OrganizationAvatarProps = PropsOfComponent<typeof Avatar> &
  Partial<Pick<OrganizationResource, 'name' | 'logoUrl'>>;

export const OrganizationAvatar = (props: OrganizationAvatarProps) => {
  const { name = '', logoUrl, ...rest } = props;

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

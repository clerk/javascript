import type { OrganizationResource } from '@clerk/types';

import { useOptions } from '../contexts';
import { Avatar } from '../elements';
import type { PropsOfComponent } from '../styledSystem';

type OrganizationAvatarProps = PropsOfComponent<typeof Avatar> &
  Partial<Pick<OrganizationResource, 'name' | 'logoUrl' | 'experimental_imageUrl'>>;

export const OrganizationAvatar = (props: OrganizationAvatarProps) => {
  const { name = '', logoUrl, experimental_imageUrl, ...rest } = props;
  const { experimental_enableClerkImages } = useOptions();
  return (
    <Avatar
      title={name}
      initials={(name || ' ')[0]}
      imageUrl={experimental_enableClerkImages ? experimental_imageUrl : logoUrl}
      rounded={false}
      {...rest}
    />
  );
};

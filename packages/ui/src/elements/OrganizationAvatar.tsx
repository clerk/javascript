import type { OrganizationResource } from '@clerk/shared/types';

import type { PropsOfComponent } from '../styledSystem';
import { Avatar } from './Avatar';

type OrganizationAvatarProps = PropsOfComponent<typeof Avatar> &
  Partial<Pick<OrganizationResource, 'name' | 'imageUrl'>> & {
    /** Shows a loading spinner while the image is loading */
    showLoadingSpinner?: boolean;
  };

export const OrganizationAvatar = (props: OrganizationAvatarProps) => {
  const { name = '', imageUrl, showLoadingSpinner, ...rest } = props;
  return (
    <Avatar
      title={name}
      initials={(name || ' ')[0]}
      imageUrl={imageUrl}
      showLoadingSpinner={showLoadingSpinner}
      rounded={false}
      {...rest}
    />
  );
};

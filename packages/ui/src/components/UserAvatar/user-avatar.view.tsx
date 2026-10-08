import { descriptors } from '@/ui/customizables';
import { UserAvatar as InternalUserAvatar } from '@/ui/elements/UserAvatar';
import { InternalThemeProvider } from '@/ui/styledSystem';

import type { UserAvatarViewProps } from './user-avatar.controller';

export function UserAvatarView(props: UserAvatarViewProps) {
  return (
    <InternalThemeProvider>
      <InternalUserAvatar
        boxElementDescriptor={descriptors.userAvatarBox}
        imageElementDescriptor={descriptors.userAvatarImage}
        firstName={props.firstName}
        lastName={props.lastName}
        imageUrl={props.imageUrl}
        rounded={props.rounded}
        size={theme => theme.sizes.$7}
      />
    </InternalThemeProvider>
  );
}

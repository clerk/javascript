import { useUser } from '@clerk/shared/react/index';
import type { UserAvatarProps } from '@clerk/types';

import { useUserAvatarContext, withCoreUserGuard } from '@/ui/contexts';
import { descriptors } from '@/ui/customizables';
import { UserAvatar as InternalUserAvatar } from '@/ui/elements/UserAvatar';
import { InternalThemeProvider } from '@/ui/styledSystem';

export const _UserAvatar = (props: UserAvatarProps) => {
  const ctx = useUserAvatarContext();
  const { user } = useUser();

  return (
    <InternalThemeProvider>
      <InternalUserAvatar
        boxElementDescriptor={descriptors.userAvatarBox}
        imageElementDescriptor={descriptors.userAvatarImage}
        {...user}
        rounded={props.rounded ?? ctx.rounded ?? true}
        size={theme => theme.sizes.$7}
      />
    </InternalThemeProvider>
  );
};

export const UserAvatar = withCoreUserGuard(_UserAvatar);

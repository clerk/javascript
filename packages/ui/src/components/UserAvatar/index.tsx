import type { UserAvatarProps } from '@clerk/shared/types';

import { withCoreUserGuard } from '@/ui/contexts';

import { useUserAvatarController } from './user-avatar.controller';
import { useUserAvatarModel } from './user-avatar.model';
import { UserAvatarView } from './user-avatar.view';

const UserAvatarContent = (props: UserAvatarProps) => {
  const model = useUserAvatarModel();
  const controller = useUserAvatarController(model, props);
  return <UserAvatarView {...controller} />;
};

export const _UserAvatar = UserAvatarContent;
export const UserAvatar = withCoreUserGuard(UserAvatarContent);

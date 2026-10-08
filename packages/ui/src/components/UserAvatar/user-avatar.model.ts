import { useUser } from '@clerk/shared/react/index';

import { useUserAvatarContext } from '@/ui/contexts';

export type UserAvatarModel = {
  firstName: string | null | undefined;
  lastName: string | null | undefined;
  imageUrl: string | undefined;
  rounded: boolean | undefined;
};

export function useUserAvatarModel(): UserAvatarModel {
  const { user } = useUser();
  const context = useUserAvatarContext();

  return {
    firstName: user?.firstName,
    lastName: user?.lastName,
    imageUrl: user?.imageUrl,
    rounded: context.rounded,
  };
}

import type { UserAvatarProps } from '@clerk/shared/types';

import type { UserAvatarModel } from './user-avatar.model';

export type UserAvatarViewProps = Pick<UserAvatarModel, 'firstName' | 'lastName' | 'imageUrl'> & {
  rounded: boolean;
};

export function useUserAvatarController(model: UserAvatarModel, props: UserAvatarProps): UserAvatarViewProps {
  return {
    firstName: model.firstName,
    lastName: model.lastName,
    imageUrl: model.imageUrl,
    rounded: props.rounded ?? model.rounded ?? true,
  };
}

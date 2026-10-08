import type { UserProfileModalProps } from '@clerk/shared/types';

import type { UserProfileCtx } from '@/types';

export const useUserProfileModalModel = (props: UserProfileModalProps): UserProfileCtx => ({
  ...props,
  routing: 'virtual',
  componentName: 'UserProfile',
  mode: 'modal',
});

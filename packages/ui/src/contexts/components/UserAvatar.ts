import { createContext, useContext } from 'react';

import type { UserAvatarCtx } from '../../types';

export const UserAvatarContext = createContext<UserAvatarCtx | null>(null);

export const useUserAvatarContext = () => {
  const context = useContext(UserAvatarContext);

  if (!context || context.componentName !== 'UserAvatar') {
    throw new Error('Clerk: useUserAvatarContext called outside UserAvatar.');
  }

  const { componentName, ...ctx } = context;

  return {
    ...ctx,
    componentName,
  };
};

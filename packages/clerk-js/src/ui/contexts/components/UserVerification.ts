import { createContext, useContext } from 'react';

import type { UserVerificationCtx } from '../../types';

export type UserVerificationContextType = UserVerificationCtx;

export const UserVerificationContext = createContext<UserVerificationCtx | null>(null);

export const useUserVerification = (): UserVerificationContextType => {
  const context = useContext(UserVerificationContext);

  if (!context || context.componentName !== 'UserVerification') {
    throw new Error('Clerk: useUserVerificationContext called outside of the mounted UserVerification component.');
  }

  const { componentName, ...ctx } = context;

  return {
    ...ctx,
    componentName,
  };
};

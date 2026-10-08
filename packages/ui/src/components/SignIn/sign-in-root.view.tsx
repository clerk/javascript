import type { ReactNode } from 'react';

import { SignUpContext } from '../../contexts';
import type { useSignInRootController } from './sign-in-root.controller';

export const SignInRootView = ({
  signUpContext,
  children,
}: ReturnType<typeof useSignInRootController> & { children: ReactNode }) => (
  <SignUpContext.Provider value={signUpContext}>{children}</SignUpContext.Provider>
);

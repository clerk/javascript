import { useClerk } from '@clerk/shared/react/index';
import { createContext, useContext, useRef } from 'react';

import type { CurrentTaskCtx } from '../../types';
import { useSignInContext } from './SignIn';
import { useSignUpContext } from './SignUp';

export const CurrentTaskContext = createContext<CurrentTaskCtx | null>(null);

export type CurrentTaskContextType = CurrentTaskCtx & {
  nextTask: (opts?: { redirectUrlComplete?: string }) => Promise<void>;
  currentTaskContainer: React.RefObject<HTMLDivElement>;
};

export const useCurrentTaskContext = (): CurrentTaskContextType => {
  const clerk = useClerk();
  const ctx = useContext(CurrentTaskContext);
  const signInCtx = useSignInContext();
  const signUpCtx = useSignUpContext();
  const currentTaskContainer = useRef<HTMLDivElement>(null);

  const defaultRedirectUrlComplete = signInCtx.afterSignInUrl ?? signUpCtx.afterSignUpUrl;

  const nextTask = ({ redirectUrlComplete }: { redirectUrlComplete?: string } = {}) => {
    return clerk.__internal_navigateToTaskIfAvailable({
      redirectUrlComplete: redirectUrlComplete ?? defaultRedirectUrlComplete,
    });
  };

  if (ctx === null) {
    throw new Error('Clerk: useCurrentTaskContext called outside of the mounted CurrentTask component.');
  }

  return {
    ...ctx,
    nextTask,
    currentTaskContainer,
  };
};

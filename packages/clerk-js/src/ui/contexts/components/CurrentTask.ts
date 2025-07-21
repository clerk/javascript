import { useClerk } from '@clerk/shared/react/index';
import { createContext, useContext, useRef } from 'react';

import type { CurrentTaskCtx } from '../../types';

export const CurrentTaskContext = createContext<CurrentTaskCtx | null>(null);

export type CurrentTaskContextType = CurrentTaskCtx & {
  currentTaskContainer: React.RefObject<HTMLDivElement>;
  navigateToTaskIfAvailable: () => Promise<void>;
};

export const useCurrentTaskContext = (): CurrentTaskContextType => {
  const clerk = useClerk();
  const ctx = useContext(CurrentTaskContext);
  const currentTaskContainer = useRef<HTMLDivElement>(null);

  const redirectUrlComplete = ctx?.redirectUrlComplete ?? clerk.buildAfterSignInUrl();

  const navigateToTaskIfAvailable = () => {
    return clerk.__internal_navigateToTaskIfAvailable({
      redirectUrlComplete,
    });
  };

  if (ctx === null) {
    throw new Error('Clerk: useCurrentTaskContext called outside of the mounted CurrentTask component.');
  }

  return {
    ...ctx,
    currentTaskContainer,
    redirectUrlComplete,
    navigateToTaskIfAvailable,
  };
};

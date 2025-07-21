import { createContext, useContext } from 'react';

import type { SessionTasksCtx } from '../../types';

export const CurrentTaskContext = createContext<SessionTasksCtx | null>(null);

export const useCurrentTaskContext = () => {
  const context = useContext(CurrentTaskContext);

  if (context === null) {
    throw new Error('Clerk: useCurrentTaskContext called outside of the mounted CurrentTask component.');
  }

  return context;
};

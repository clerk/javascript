import { useClerk } from '@clerk/shared/react';

import { useSessionTasksContext } from '@/ui/contexts/components/SessionTasks';
import { useRouter } from '@/ui/router';

export const useTaskGuardOnlyOnMountModel = () => {
  const ctx = useSessionTasksContext();
  const clerk = useClerk();
  const { navigate } = useRouter();

  return {
    currentTaskKey: clerk.session?.currentTask?.key,
    setActiveInProgress: clerk.__internal_setActiveInProgress,
    publishableKey: clerk.publishableKey,
    redirect: () => {
      const url = !clerk.session ? clerk.buildSignInUrl() : (ctx.redirectUrlComplete ?? clerk.buildAfterSignInUrl());
      return navigate(url);
    },
  };
};

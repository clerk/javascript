import { useSession, useUser } from '@clerk/shared/react';
import { useEffect, useMemo } from 'react';

import { useSessionTasksContext } from '@/contexts/components/SessionTasks';
import { useEnvironment, withCoreSessionSwitchGuard } from '@/ui/contexts';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { getSecondFactorsAvailableToAdd } from '@/ui/utils/mfa';

import { MfaMethodSelectionScreen } from './MfaMethodSelectionScreen';

const TaskSetupMfaInternal = () => {
  const { user } = useUser();
  const { session } = useSession();
  const {
    userSettings: { attributes },
  } = useEnvironment();
  const ctx = useSessionTasksContext();

  const secondFactorsAvailableToAdd = useMemo(
    () => (user ? getSecondFactorsAvailableToAdd(attributes, user) : []),
    [attributes, user],
  );

  useEffect(() => {
    const currentTask = session?.currentTask;
    if (currentTask && currentTask.key === 'setup-mfa') {
      ctx.shouldAutoNavigateAway.current = false;
    }
  }, [session?.currentTask, ctx.shouldAutoNavigateAway]);

  // Show method selection screen
  return <MfaMethodSelectionScreen availableMethods={secondFactorsAvailableToAdd} />;
};

export const TaskSetupMfa = withCoreSessionSwitchGuard(withCardStateProvider(TaskSetupMfaInternal));

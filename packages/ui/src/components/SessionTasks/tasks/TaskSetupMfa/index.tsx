import { useSession, useUser } from '@clerk/shared/react';
import { useEffect, useMemo } from 'react';

import { useSessionTasksContext } from '@/contexts/components/SessionTasks';
import { Flow } from '@/customizables';
import { Route, Switch } from '@/router';
import { useEnvironment, withCoreSessionSwitchGuard } from '@/ui/contexts';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { getSecondFactorsAvailableToAdd } from '@/ui/utils/mfa';

import { MFA_METHODS_TO_ROUTES_PATH } from './constants';
import { MfaFormForSessionTasks } from './MethodSelectionScreen';
import { SetupMfaStartScreen } from './SetupMfaStartScreen';
import { SmsCodeFlow } from './SmsCodeFlow';

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

  // Making sure we don't auto navigate away from the setup MFA task even if the current task is not `setup-mfa`.
  // This is to prevent the user from being redirected to the home page after setting up MFA
  // as if backup codes are enabled, the user will be redirected without seeing the backup codes
  useEffect(() => {
    const currentTask = session?.currentTask;
    if (currentTask && currentTask.key === 'setup-mfa') {
      ctx.shouldAutoNavigateAway.current = false;
    }
  }, [session?.currentTask, ctx.shouldAutoNavigateAway]);

  return (
    <Flow.Root flow='taskSetupMfa'>
      <Switch>
        <Route index>
          <SetupMfaStartScreen availableMethods={secondFactorsAvailableToAdd} />
        </Route>
        {secondFactorsAvailableToAdd.map(method => (
          <Route
            key={method}
            path={MFA_METHODS_TO_ROUTES_PATH[method]}
          >
            <Flow.Part part='setupMfa'>
              {method === 'phone_code' ? <SmsCodeFlow /> : <MfaFormForSessionTasks verificationStrategy={method} />}
            </Flow.Part>
          </Route>
        ))}
      </Switch>
    </Flow.Root>
  );
};

export const TaskSetupMfa = withCoreSessionSwitchGuard(withCardStateProvider(TaskSetupMfaInternal));

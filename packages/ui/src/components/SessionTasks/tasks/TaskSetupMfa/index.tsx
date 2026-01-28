import { useClerk, useSession, useUser } from '@clerk/shared/react';
import { useEffect, useMemo } from 'react';

import { useWizard, Wizard } from '@/common';
import { useSessionTasksContext, useTaskSetupMFAContext } from '@/contexts/components/SessionTasks';
import { Flow } from '@/customizables';
import { useEnvironment, withCoreSessionSwitchGuard } from '@/ui/contexts';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { getSecondFactorsAvailableToAdd } from '@/ui/utils/mfa';

import { SetupMfaStartScreen } from './SetupMfaStartScreen';
import { SmsCodeFlow } from './SmsCodeFlowScreen';
import { TOTPCodeFlow } from './TOTPCodeFlowScreen';

const TaskSetupMFAInternal = () => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const {
    userSettings: { attributes },
  } = useEnvironment();
  const ctx = useSessionTasksContext();

  const secondFactorsAvailableToAdd = useMemo(() => {
    const availableMethods = user ? getSecondFactorsAvailableToAdd(attributes, user) : [];

    if (user?.enterpriseAccounts && user.enterpriseAccounts.length === 0) {
      return availableMethods;
    }

    const firstEnterpriseConnection = user?.enterpriseAccounts[0];

    return availableMethods.filter(method => {
      if (method === 'phone_code') {
        return firstEnterpriseConnection?.enterpriseConnection?.disableAdditionalIdentifications === false;
      }
      return true;
    });
  }, [attributes, user]);

  const wizard = useWizard({ defaultStep: 0 });
  const { redirectUrlComplete } = useTaskSetupMFAContext();
  const { navigateOnSetActive } = useSessionTasksContext();

  const handleSuccess = () => {
    void clerk.setActive({
      session: session?.id,
      navigate: async ({ session }) => {
        await navigateOnSetActive?.({ session, redirectUrlComplete });

        if (ctx.shouldAutoNavigateAway) {
          ctx.shouldAutoNavigateAway.current = true;
        }
      },
    });
  };

  // Making sure we don't auto navigate away from the setup MFA task even if the current task is not `setup-mfa`.
  // This is to prevent the user from being redirected to the home page after setting up MFA
  // as if backup codes are enabled, the user will be redirected without seeing the backup codes
  useEffect(() => {
    const currentTask = session?.currentTask;
    if (currentTask && currentTask.key === 'setup-mfa' && ctx.shouldAutoNavigateAway) {
      ctx.shouldAutoNavigateAway.current = false;
    }
  }, [session?.currentTask, ctx.shouldAutoNavigateAway]);

  return (
    <Flow.Root flow='taskSetupMfa'>
      <Wizard
        {...wizard.props}
        animate={false}
      >
        <Flow.Part part='methodSelectionMFA'>
          <SetupMfaStartScreen
            availableMethods={secondFactorsAvailableToAdd}
            goToStep={wizard.goToStep}
          />
        </Flow.Part>
        <Flow.Part part='phoneCode2Fa'>
          <SmsCodeFlow
            onSuccess={handleSuccess}
            goToStartStep={() => wizard.goToStep(0)}
          />
        </Flow.Part>
        <Flow.Part part='totp2Fa'>
          <TOTPCodeFlow
            onSuccess={handleSuccess}
            goToStartStep={() => wizard.goToStep(0)}
          />
        </Flow.Part>
      </Wizard>
    </Flow.Root>
  );
};

export const TaskSetupMFA = withCoreSessionSwitchGuard(withCardStateProvider(TaskSetupMFAInternal));

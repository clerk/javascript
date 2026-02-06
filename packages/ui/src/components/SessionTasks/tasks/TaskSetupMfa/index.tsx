import { useClerk, useSession, useUser } from '@clerk/shared/react';
import { useEffect, useMemo } from 'react';

import { useWizard, Wizard } from '@/common';
import { useSessionTasksContext, useTaskSetupMFAContext } from '@/contexts/components/SessionTasks';
import { Flow } from '@/customizables';
import { useEnvironment, withCoreSessionSwitchGuard } from '@/ui/contexts';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { getSecondFactorsAvailableToAdd } from '@/ui/utils/mfa';

import { withTaskGuardOnlyOnMount } from '../shared';
import { SetupMfaStartScreen } from './SetupMfaStartScreen';
import { SmsCodeFlow } from './SmsCodeFlowScreen';
import { TOTPCodeFlow } from './TOTPCodeFlowScreen';

const WIZARD_STEPS = {
  start: 0,
  phoneCode: 1,
  totp: 2,
} as const;

const TaskSetupMFAInternal = () => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const {
    userSettings: { attributes },
  } = useEnvironment();

  const secondFactorsAvailableToAdd = useMemo(() => {
    const availableMethods = user ? getSecondFactorsAvailableToAdd(attributes, user) : [];

    if (!user?.enterpriseAccounts || user.enterpriseAccounts.length === 0) {
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

  const defaultStep =
    secondFactorsAvailableToAdd.indexOf('phone_code') > -1 ? WIZARD_STEPS.phoneCode : WIZARD_STEPS.totp;
  const wizard = useWizard({
    defaultStep: secondFactorsAvailableToAdd.length > 1 ? WIZARD_STEPS.start : defaultStep,
  });
  const { redirectUrlComplete } = useTaskSetupMFAContext();
  const { navigateOnSetActive, redirectOnActiveSession } = useSessionTasksContext();

  const handleSuccess = async () => {
    if (redirectOnActiveSession) {
      redirectOnActiveSession.current = false;
    }
    await clerk.setActive({
      session: session?.id,
      navigate: async ({ session, decorateUrl }) => {
        await navigateOnSetActive?.({ session, redirectUrlComplete, decorateUrl });
      },
    });
  };

  // For this task we should not redirect to the redirectUrlComplete even if the session is active.
  // This needed because we want the user to explicitly click the to go the the next page because they
  // need to see the backups codes.
  useEffect(() => {
    if (redirectOnActiveSession) {
      redirectOnActiveSession.current = false;
    }
  }, [redirectOnActiveSession]);

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

export const TaskSetupMFA = withCoreSessionSwitchGuard(
  withTaskGuardOnlyOnMount(withCardStateProvider(TaskSetupMFAInternal), 'setup-mfa'),
);

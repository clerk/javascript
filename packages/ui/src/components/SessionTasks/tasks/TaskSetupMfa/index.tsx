import { useClerk, useUser } from '@clerk/shared/react';
import { useMemo, useState } from 'react';

import { useEnvironment, withCoreSessionSwitchGuard } from '@/ui/contexts';
import { useSessionTasksContext, useTaskSetupMfaContext } from '@/ui/contexts/components/SessionTasks';
import { Flow } from '@/ui/customizables';
import { withCardStateProvider } from '@/ui/elements/contexts';

import { MfaForm } from '../../../UserProfile/MfaForm';
import { getSecondFactorsAvailableToAdd } from '../../../UserProfile/utils';
import { withTaskGuard } from '../shared';
import { MfaMethodSelectionScreen } from './MfaMethodSelectionScreen';

const TaskSetupMfaInternal = () => {
  const clerk = useClerk();
  const { user } = useUser();
  const {
    userSettings: { attributes },
  } = useEnvironment();
  const { redirectUrlComplete } = useTaskSetupMfaContext();
  const { navigateOnSetActive } = useSessionTasksContext();
  const [selectedMethod, setSelectedMethod] = useState<string | undefined>();

  const secondFactorsAvailableToAdd = useMemo(
    () => (user ? getSecondFactorsAvailableToAdd(attributes, user) : []),
    [attributes, user],
  );

  const handleMfaSuccess = async () => {
    // Task completion: refresh session and navigate
    await clerk.setActive({
      session: clerk.session,
      navigate: async ({ session }) => {
        await navigateOnSetActive?.({ session, redirectUrlComplete });
      },
    });
  };

  // If only one method available, auto-select it
  const autoSelectedMethod = secondFactorsAvailableToAdd.length === 1 ? secondFactorsAvailableToAdd[0] : selectedMethod;

  // If method is selected, show the MFA setup form
  if (autoSelectedMethod) {
    return (
      <Flow.Root flow='taskSetupMfa'>
        <Flow.Part part='setupMfa'>
          <MfaForm
            selectedStrategy={autoSelectedMethod}
            onSuccess={handleMfaSuccess}
            onReset={secondFactorsAvailableToAdd.length > 1 ? () => setSelectedMethod(undefined) : undefined}
          />
        </Flow.Part>
      </Flow.Root>
    );
  }

  // Show method selection screen
  return (
    <MfaMethodSelectionScreen
      availableMethods={secondFactorsAvailableToAdd}
      onMethodSelect={setSelectedMethod}
    />
  );
};

export const TaskSetupMfa = withCoreSessionSwitchGuard(
  withTaskGuard(withCardStateProvider(TaskSetupMfaInternal), 'setup-mfa'),
);

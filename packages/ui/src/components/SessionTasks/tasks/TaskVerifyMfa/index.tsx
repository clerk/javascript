import { useClerk } from '@clerk/shared/react';

import { UserVerification } from '@/ui/components/UserVerification';
import { UserVerificationContext, withCoreSessionSwitchGuard } from '@/ui/contexts';
import { useSessionTasksContext } from '@/ui/contexts/components/SessionTasks';
import { withCardStateProvider } from '@/ui/elements/contexts';

import { withTaskGuard } from '../shared';

/**
 * Asks a user with MFA to verify their second factor, through the same flow as
 * reverification. The task completes when the session's verification records a
 * second factor.
 */
const TaskVerifyMFAInternal = () => {
  const clerk = useClerk();
  const { redirectUrlComplete, navigateOnSetActive } = useSessionTasksContext();

  const afterVerification = () => {
    // Update the session to have the latest list of tasks (eg: if verify-mfa gets resolved)
    void clerk.setActive({
      session: clerk.session,
      navigate: async ({ session, decorateUrl }) => {
        await navigateOnSetActive?.({ session, redirectUrlComplete, decorateUrl });
      },
    });
  };

  return (
    <UserVerificationContext.Provider
      value={{
        componentName: 'UserVerification',
        level: 'second_factor',
        routing: 'virtual',
        afterVerification,
      }}
    >
      <UserVerification
        level='second_factor'
        routing='virtual'
        afterVerification={afterVerification}
      />
    </UserVerificationContext.Provider>
  );
};

export const TaskVerifyMFA = withCoreSessionSwitchGuard(
  withTaskGuard(withCardStateProvider(TaskVerifyMFAInternal), 'verify-mfa'),
);

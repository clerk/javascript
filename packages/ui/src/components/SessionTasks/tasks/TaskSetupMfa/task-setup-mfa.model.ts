import { useClerk, useSession, useUser } from '@clerk/shared/react';
import { useCallback, useMemo } from 'react';

import { useSessionTasksContext, useTaskSetupMFAContext } from '@/contexts/components/SessionTasks';
import { useEnvironment } from '@/ui/contexts';
import { getSecondFactorsAvailableToAdd } from '@/ui/utils/mfa';

export const useTaskSetupMfaModel = () => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const {
    userSettings: { attributes },
  } = useEnvironment();
  const { redirectUrlComplete } = useTaskSetupMFAContext();
  const { navigateOnSetActive, redirectOnActiveSession } = useSessionTasksContext();

  const availableMethods = useMemo(() => {
    const methods = user ? getSecondFactorsAvailableToAdd(attributes, user) : [];
    if (!user?.enterpriseAccounts || user.enterpriseAccounts.length === 0) {
      return methods;
    }

    const firstEnterpriseConnection = user.enterpriseAccounts[0];
    return methods.filter(method => {
      if (method === 'phone_code') {
        return firstEnterpriseConnection?.enterpriseConnection?.disableAdditionalIdentifications === false;
      }
      return true;
    });
  }, [attributes, user]);

  const suppressAutomaticRedirect = useCallback(() => {
    if (redirectOnActiveSession) {
      redirectOnActiveSession.current = false;
    }
  }, [redirectOnActiveSession]);

  return {
    availableMethods,
    suppressAutomaticRedirect,
    complete: async () => {
      suppressAutomaticRedirect();
      await clerk.setActive({
        session: session?.id,
        navigate: async ({ session, decorateUrl }) => {
          await navigateOnSetActive?.({ session, redirectUrlComplete, decorateUrl });
        },
      });
    },
  };
};

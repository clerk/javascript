import { useClerk, useReverification, useUser } from '@clerk/shared/react';

import { useSignOutContext } from '@/ui/contexts';
import type { FormProps } from '@/ui/elements/FormContainer';
import { useMultipleSessions } from '@/ui/hooks/useMultipleSessions';

export type DeleteUserFormProps = FormProps;

export const useDeleteUserModel = () => {
  const { afterSignOutUrl, afterMultiSessionSingleSignOutUrl } = useSignOutContext();
  const { user } = useUser();
  const { otherSessions } = useMultipleSessions({ user });
  const { setActive } = useClerk();
  const deleteUserWithReverification = useReverification(() => user?.delete());

  return {
    deleteUser: async () => {
      await deleteUserWithReverification();
      const redirectUrl = otherSessions.length === 0 ? afterSignOutUrl : afterMultiSessionSingleSignOutUrl;

      return setActive({ session: null, redirectUrl });
    },
  };
};

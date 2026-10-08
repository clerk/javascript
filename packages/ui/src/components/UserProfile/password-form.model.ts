import { useReverification, useSession, useUser } from '@clerk/shared/react';
import type { UserResource } from '@clerk/shared/types';

import { useEnvironment } from '@/ui/contexts';
import type { FormProps } from '@/ui/elements/FormContainer';

export type PasswordFormProps = FormProps;

export const usePasswordFormModel = () => {
  const { user } = useUser();
  const updatePasswordWithReverification = useReverification(
    (user: UserResource, opts: Parameters<UserResource['updatePassword']>) => user.updatePassword(...opts),
  );
  const {
    userSettings: { passwordSettings },
    authConfig: { reverification },
  } = useEnvironment();
  const { session } = useSession();

  if (!user) {
    return { status: 'hidden' as const, passwordSettings };
  }

  return {
    status: 'ready' as const,
    passwordEnabled: user.passwordEnabled,
    passwordEditDisabled: user.enterpriseAccounts.some(account => account.active),
    currentPasswordRequired: user.passwordEnabled && !reverification,
    identifier: session?.publicUserData.identifier || '',
    passwordSettings,
    updatePassword: (opts: Parameters<UserResource['updatePassword']>[0]) =>
      updatePasswordWithReverification(user, [opts]),
  };
};

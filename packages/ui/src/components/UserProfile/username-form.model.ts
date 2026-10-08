import { useReverification, useUser } from '@clerk/shared/react';

import { useEnvironment } from '@/ui/contexts';
import type { FormProps } from '@/ui/elements/FormContainer';

export type UsernameFormProps = FormProps;

export const useUsernameFormModel = () => {
  const { user } = useUser();
  const updateUsername = useReverification((username: string) => user?.update({ username }));
  const { userSettings } = useEnvironment();

  if (!user) {
    return { status: 'hidden' as const, usernameSettings: userSettings.usernameSettings };
  }

  return {
    status: 'ready' as const,
    username: user.username,
    isUsernameRequired: !!userSettings.attributes.username?.required,
    usernameSettings: userSettings.usernameSettings,
    updateUsername,
  };
};

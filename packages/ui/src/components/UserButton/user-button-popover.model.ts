import { useSession, useUser } from '@clerk/shared/react';

import { useEnvironment, useUserButtonContext } from '../../contexts';
import { useMultisessionModel } from './multisession.model';
import { toUserButtonPreview } from './user-button.preview';
import type { UserButtonPopoverModel } from './user-button.types';

export const useUserButtonPopoverModel = (): UserButtonPopoverModel | null => {
  const { session } = useSession();
  const userButtonContext = useUserButtonContext();
  const { authConfig } = useEnvironment();
  const { user } = useUser();
  const multisession = useMultisessionModel({ ...userButtonContext, userId: user?.id });

  if (!session || !user) {
    return null;
  }

  return {
    session: { id: session.id, preview: toUserButtonPreview(session.user) },
    userPreview: toUserButtonPreview(user),
    multisession,
    userProfileMode: userButtonContext.userProfileMode,
    isStandalone: !!userButtonContext.__experimental_asStandalone,
    singleSessionMode: authConfig.singleSessionMode,
  };
};

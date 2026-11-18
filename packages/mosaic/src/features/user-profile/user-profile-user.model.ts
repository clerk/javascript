import { useClerk, useUser } from '@clerk/shared/react';
import type { EnvironmentResource, UserResource } from '@clerk/shared/types';

import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';
import type { MessageValues } from '../../localization';
import { save, SaveError, UNEXPECTED_ERROR } from '../../utils/errors';

export type UserProfileUserModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | {
      status: 'ready';
      user: UserResource;
      environment: EnvironmentResource;
      currentUser: () => UserResource;
      saveAsUser: <TField extends string = never>(
        run: (current: UserResource) => Promise<unknown>,
        fields?: readonly TField[],
        params?: MessageValues,
      ) => Promise<void>;
    };

export function useUserProfileUserModel(): UserProfileUserModel {
  const { isLoaded, user } = useUser();
  const clerk = useClerk();
  const environment = useMosaicEnvironment();

  if (!isLoaded || !environment) {
    return { status: 'loading' };
  }

  if (!user) {
    return { status: 'hidden' };
  }

  const userId = user.id;

  const currentUser = (): UserResource => {
    const current = clerk.user;
    if (!current || current.id !== userId) {
      throw new SaveError({ global: UNEXPECTED_ERROR });
    }
    return current;
  };

  return {
    status: 'ready',
    user,
    environment,
    currentUser,
    saveAsUser: (run, fields = [], params) => save(() => run(currentUser()), fields, params),
  };
}

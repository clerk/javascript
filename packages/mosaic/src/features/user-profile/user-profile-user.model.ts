import { useClerk, useUser } from '@clerk/shared/react';
import type { EnvironmentResource, UserResource } from '@clerk/shared/types';

import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';
import { MosaicError, UNEXPECTED_ERROR } from '../../utils/errors';
import type { CallClerkOptions, ClerkCall } from '../clerk/errors';
import { callClerk } from '../clerk/errors';

export type UserProfileUserModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | {
      status: 'ready';
      user: UserResource;
      environment: EnvironmentResource;
      currentUser: () => UserResource;
      saveAsUser: (run: (current: UserResource) => Promise<unknown>, options?: CallClerkOptions) => ClerkCall;
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
      throw new MosaicError([UNEXPECTED_ERROR]);
    }
    return current;
  };

  return {
    status: 'ready',
    user,
    environment,
    currentUser,
    saveAsUser: (run, options) =>
      callClerk(async () => {
        await run(currentUser());
      }, options),
  };
}

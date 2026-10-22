import { useClerk, useSession, useUser } from '@clerk/shared/react';
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

export type UserProfileActionContext = Readonly<{
  scope: Readonly<{ userId: string; sessionId: string; instanceKey: string }>;
  onMutation: () => void;
}>;

type UserProfileUserAccess =
  | Exclude<UserProfileUserModel, { status: 'ready' }>
  | Omit<Extract<UserProfileUserModel, { status: 'ready' }>, 'environment'>;

export function useUserProfileUserAccess(context?: UserProfileActionContext): UserProfileUserAccess {
  const { isLoaded, user } = useUser();
  const clerk = useClerk();
  const { session } = useSession();

  if (!isLoaded) {
    return { status: 'loading' };
  }

  if (!user) {
    return { status: 'hidden' };
  }

  const userId = user.id;
  const sessionId = session?.id;
  const instanceKey = JSON.stringify([clerk.publishableKey, clerk.frontendApi, clerk.proxyUrl ?? '', clerk.domain]);
  if (
    context &&
    (context.scope.userId !== userId ||
      context.scope.sessionId !== sessionId ||
      context.scope.instanceKey !== instanceKey)
  ) {
    return { status: 'loading' };
  }

  const currentUser = (): UserResource => {
    const current = clerk.user;
    if (
      !clerk.loaded ||
      !current ||
      current.id !== userId ||
      clerk.session?.id !== sessionId ||
      JSON.stringify([clerk.publishableKey, clerk.frontendApi, clerk.proxyUrl ?? '', clerk.domain]) !== instanceKey
    ) {
      throw new SaveError({ global: UNEXPECTED_ERROR });
    }
    return current;
  };

  return {
    status: 'ready',
    user,
    currentUser,
    saveAsUser: async (run, fields = [], params) => {
      await save(() => run(currentUser()), fields, params);
      context?.onMutation();
    },
  };
}

export function useUserProfileUserModel(context?: UserProfileActionContext): UserProfileUserModel {
  const model = useUserProfileUserAccess(context);
  const environment = useMosaicEnvironment();
  if (model.status !== 'ready') {
    return model;
  }
  return environment ? { ...model, environment } : { status: 'loading' };
}

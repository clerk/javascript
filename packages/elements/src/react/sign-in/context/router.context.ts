import { useEffect } from 'react';
import type { ActorRefFrom, AnyActorLogic, SnapshotFrom } from 'xstate';

import { useFormStore } from '~/internals/machines/form/form.context';
import type { TSignInRouterMachine } from '~/internals/machines/sign-in/machines';
import type { SignInRouterRouteRegisterEvent } from '~/internals/machines/sign-in/types';
import { createContextFromActorRef } from '~/react/utils/create-context-from-actor-ref';

export type SnapshotState = SnapshotFrom<TSignInRouterMachine>;

export const SignInRouterCtx = createContextFromActorRef<TSignInRouterMachine>('SignInRouterCtx');

export function useSignInRouteRegistration<
  TLogic extends AnyActorLogic,
  TEvent extends SignInRouterRouteRegisterEvent<TLogic>,
>(id: TEvent['id'], logic: TLogic, input?: TEvent['input']): ActorRefFrom<TLogic> | undefined {
  const routerRef = SignInRouterCtx.useActorRef();
  const form = useFormStore();

  const ref = routerRef.system.get(id);

  useEffect(() => {
    if (!routerRef || ref) {
      return;
    }

    routerRef.send({
      type: 'ROUTE.REGISTER',
      id,
      logic,
      input: { form, ...input },
    });

    return () => {
      routerRef.send({
        type: 'ROUTE.UNREGISTER',
        id,
      });
    };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  return ref || routerRef.system.get(id);
}

import { useClerk } from '@clerk/clerk-react';
import { useEffect } from 'react';
import type { ActorRefFrom, AnyActorLogic, SnapshotFrom } from 'xstate';

import { useFormStore } from '~/internals/machines/form/form.context';
import type { TSignUpRouterMachine } from '~/internals/machines/sign-up/machines';
import type { SignUpRouterRouteRegisterEvent } from '~/internals/machines/sign-up/types';
import { createContextFromActorRef } from '~/react/utils/create-context-from-actor-ref';

export type SnapshotState = SnapshotFrom<TSignUpRouterMachine>;

export const SignUpRouterCtx = createContextFromActorRef<TSignUpRouterMachine>('SignInRouterCtx');

export function useSignUpRouteRegistration<
  TLogic extends AnyActorLogic,
  TEvent extends SignUpRouterRouteRegisterEvent<TLogic>,
>(id: TEvent['id'], logic: TLogic, input?: TEvent['input']): ActorRefFrom<TLogic> | undefined {
  const clerk = useClerk();
  const routerRef = SignUpRouterCtx.useActorRef();
  const form = useFormStore();

  const ref = routerRef.system.get(id);

  useEffect(() => {
    if (!!ref || !routerRef) {
      console.log('routerRef', 'RETURN EARLY');
      return;
    }

    routerRef.send({
      type: 'ROUTE.REGISTER',
      id,
      logic,
      input: { clerk, form, ...input },
    });

    return () => {
      routerRef.send({
        type: 'ROUTE.UNREGISTER',
        id,
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return ref || routerRef.system.get(id);
}

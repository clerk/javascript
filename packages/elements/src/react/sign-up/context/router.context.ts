import { useEffect } from 'react';
import type { ActorRefFrom, AnyActorLogic, SnapshotFrom } from 'xstate';

import { useFormStore } from '~/internals/machines/form/form.context';
import type { TSignUpRouterMachine } from '~/internals/machines/sign-up/machines';
import type { SignUpRouterRouteRegisterEvent } from '~/internals/machines/sign-up/types';
import { createContextFromActorRef } from '~/react/utils/create-context-from-actor-ref';

export type SnapshotState = SnapshotFrom<TSignUpRouterMachine>;

export const SignUpRouterCtx = createContextFromActorRef<TSignUpRouterMachine>('SignInRouterCtx');

// export function useSignUpRouteRegistration<
//   TLogic extends AnyActorLogic,
//   TEvent extends SignUpRouterRouteRegisterEvent<TLogic>,
// >(id: TEvent['id'], logic: TLogic, input?: TEvent['input']): ActorRefFrom<TLogic> | undefined {
//   // const registered = useRef(false);
//   const routerRef = SignUpRouterCtx.useActorRef();
//   // const actorRef = SignUpRouterCtx.useSelector(state => state.children[id] as ActorRefFrom<TLogic> | undefined);
//   const actorRef = SignUpRouterCtx.useSelector(
//     state => state.children,
//     (prev, next) => prev[id] === next[id],
//   )[id];

//   console.log('actors', actorRef);

//   // const [actorRef, setActorRef] = useState<ActorRefFrom<TLogic>>(routerRef.system.get(id));
//   const form = useFormStore();

//   useEffect(() => {
//     console.log('RUNNING', actorRef);
//     if (!!actorRef || !routerRef) {
//       console.log('routerRef', 'RETURN EARLY');
//       return;
//     }

//     console.log('routerRef.send', {
//       type: 'ROUTE.REGISTER',
//       id,
//     });

//     routerRef.send({
//       type: 'ROUTE.REGISTER',
//       id,
//       logic,
//       input: { form, ...input },
//     });

//     // setActorRef(routerRef.system.get(id));

//     // return () => {
//     //   routerRef.send({
//     //     type: 'ROUTE.UNREGISTER',
//     //     id,
//     //   });
//     // };
//   }, [actorRef]); // eslint-disable-line react-hooks/exhaustive-deps

//   console.log(actorRef);
//   return actorRef as ActorRefFrom<TLogic> | undefined; //ref || routerRef.system.get(id);
// }

export function useSignUpRouteRegistration<
  TLogic extends AnyActorLogic,
  TEvent extends SignUpRouterRouteRegisterEvent<TLogic>,
>(id: TEvent['id'], logic: TLogic, input?: TEvent['input']): ActorRefFrom<TLogic> | undefined {
  const routerRef = SignUpRouterCtx.useActorRef();
  const form = useFormStore();

  const ref = routerRef.system.get(id);

  useEffect(() => {
    if (!!ref || !routerRef) {
      console.log('routerRef', 'RETURN EARLY');
      return;
    }

    console.log('routerRef.send', {
      type: 'ROUTE.REGISTER',
      id,
    });

    routerRef.send({
      type: 'ROUTE.REGISTER',
      id,
      logic,
      input: { form, ...input },
    });

    return () => {
      console.log('routerRef.send', {
        type: 'ROUTE.UNREGISTER',
        id,
      });
      routerRef.send({
        type: 'ROUTE.UNREGISTER',
        id,
      });
    };
  }, [routerRef]); // eslint-disable-line react-hooks/exhaustive-deps

  return ref || routerRef.system.get(id);
}

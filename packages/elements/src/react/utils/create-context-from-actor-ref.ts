import { useSelector as useSelectorUnbound } from '@xstate/react';
import * as React from 'react';
import type { ActorRefFrom, AnyActorRef, AnyStateMachine, SnapshotFrom } from 'xstate';

/**
 * Creates a context and hooks for a given actor ref.

 * @example
 * const SignInRouterCtx = createContextFromActorRef<typeof SignInRouterMachine>('SignInRouterCtx')
 *
 * const Parent = () => {
 *   const ref = useActorRef(SignInRouterMachine, { input: { basePath: '/sign-in' } });
 *
 *   return (
 *     <SignInRouterCtx.Provider ref={ref}>
 *       <Child />
 *     </SignInRouterCtx>
 *   )
 * }
 *
 * const Child = () => {
 *   const ref = SignInRouterCtx.useActorRef();
 *   const status = SignInRouterCtx.useSelector(state => state.context.clerk);

 *   const handleClick = useCallback(() => ref.send({ type: 'NEXT' }), [ref]);
 *
 *   return <button onClick={handleClick}>;
 * }
 */

export function createContextFromActorRef<TMachine extends AnyStateMachine, TRef = ActorRefFrom<TMachine>>(
  displayName: string,
) {
  const ReactContext = React.createContext<TRef | null>(null);
  const OriginalProvider = ReactContext.Provider;

  function Provider({ children, actorRef }: { children: React.ReactNode; actorRef: TRef }) {
    return React.createElement(
      OriginalProvider,
      {
        value: actorRef,
      },
      children,
    );
  }

  Provider.displayName = displayName;

  function useContext(allowMissingActor?: false | undefined): TRef;
  function useContext(allowMissingActor: true): TRef | null;
  function useContext(allowMissingActor: boolean = false): TRef | null {
    const actorRef = React.useContext(ReactContext);

    if (!allowMissingActor && !actorRef) {
      throw new Error(
        `You used a hook from "${Provider.displayName}" but it's not inside a <${Provider.displayName}.Provider> component.`,
      );
    }

    return actorRef;
  }

  function useSelector<T>(selector: (snapshot: SnapshotFrom<TRef>) => T, compare?: (a: T, b: T) => boolean): T {
    const actor = useContext();
    return useSelectorUnbound(actor as AnyActorRef, selector, compare);
  }

  return {
    Provider,
    useActorRef: useContext,
    useSelector,
  };
}

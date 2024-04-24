import type { TSignInStartMachine } from '~/internals/machines/sign-in';
import { SignInStartMachine } from '~/internals/machines/sign-in';
import type { FormProps } from '~/react/common/form';
import { Form } from '~/react/common/form';
import { useActiveTags } from '~/react/hooks';
import { SignInRouterCtx, useSignInRouteRegistration } from '~/react/sign-in/context';
import { createContextFromActorRef } from '~/react/utils/create-context-from-actor-ref';

export type SignInStartProps = FormProps;

export const SignInStartCtx = createContextFromActorRef<TSignInStartMachine>('SignInStartCtx');

export function SignInStart(props: SignInStartProps) {
  const routerRef = SignInRouterCtx.useActorRef();
  const activeState = useActiveTags(routerRef, 'route:start');

  return activeState ? <SignInStartInner {...props} /> : null;
}

function SignInStartInner(props: SignInStartProps) {
  const ref = useSignInRouteRegistration('start', SignInStartMachine);

  if (!ref) {
    return null;
  }

  return (
    <SignInStartCtx.Provider actorRef={ref}>
      <Form
        flowActor={ref}
        {...props}
      />
    </SignInStartCtx.Provider>
  );
}

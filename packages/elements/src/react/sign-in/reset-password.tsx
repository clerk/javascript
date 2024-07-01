import type { TSignInResetPasswordMachine } from '~/internals/machines/sign-in';
import type { FormProps } from '~/react/common/form';
import { Form } from '~/react/common/form';
import { useActiveTags } from '~/react/hooks';
import { SignInRouterCtx, useSignInResetPasswordStep } from '~/react/sign-in/context';
import { createContextFromActorRef } from '~/react/utils/create-context-from-actor-ref';

export type SignInResetPasswordProps = FormProps;

export const SignInResetPasswordCtx = createContextFromActorRef<TSignInResetPasswordMachine>('SignInResetPasswordCtx');

export function SignInResetPassword(props: SignInResetPasswordProps) {
  const routerRef = SignInRouterCtx.useActorRef();
  const activeState = useActiveTags(routerRef, 'step:reset-password');

  return activeState ? <SignInResetPasswordInner {...props} /> : null;
}

function SignInResetPasswordInner(props: SignInResetPasswordProps) {
  const ref = useSignInResetPasswordStep();

  if (!ref) {
    return null;
  }

  return (
    <SignInResetPasswordCtx.Provider actorRef={ref}>
      <Form
        flowActor={ref}
        {...props}
      />
    </SignInResetPasswordCtx.Provider>
  );
}

import type { TSignUpStartMachine } from '~/internals/machines/sign-up';
import type { FormProps } from '~/react/common/form';
import { Form } from '~/react/common/form';
import { useActiveTags } from '~/react/hooks';
import { SignUpRouterCtx, useSignUpStartStep } from '~/react/sign-up/context';
import { createContextFromActorRef } from '~/react/utils/create-context-from-actor-ref';

export type SignUpStartProps = FormProps;

export const SignUpStartCtx = createContextFromActorRef<TSignUpStartMachine>('SignUpStartCtx');

export function SignUpStart(props: SignUpStartProps) {
  const routerRef = SignUpRouterCtx.useActorRef();
  const activeState = useActiveTags(routerRef, 'step:start');

  return activeState ? <SignUpStartInner {...props} /> : null;
}

function SignUpStartInner(props: SignUpStartProps) {
  const ref = useSignUpStartStep();

  if (!ref) {
    return null;
  }

  return (
    <SignUpStartCtx.Provider actorRef={ref}>
      <Form
        flowActor={ref}
        {...props}
      />
    </SignUpStartCtx.Provider>
  );
}

'use client';

import { SignUpContinueMachine, type TSignUpContinueMachine } from '~/internals/machines/sign-up/machines';
import type { FormProps } from '~/react/common/form';
import { Form } from '~/react/common/form';
import { useActiveTags } from '~/react/hooks';
import { SignUpRouterCtx, useSignUpRouteRegistration } from '~/react/sign-up/context';
import { createContextFromActorRef } from '~/react/utils/create-context-from-actor-ref';

export type SignUpContinueProps = FormProps;

export const SignUpContinueCtx = createContextFromActorRef<TSignUpContinueMachine>('SignUpContinueCtx');

export function SignUpContinue(props: SignUpContinueProps) {
  const routerRef = SignUpRouterCtx.useActorRef();
  const activeState = useActiveTags(routerRef, 'route:continue');

  return activeState ? <SignUpContinueInner {...props} /> : null;
}

function SignUpContinueInner(props: SignUpContinueProps) {
  const ref = useSignUpRouteRegistration('continue', SignUpContinueMachine);

  if (!ref) {
    return null;
  }

  return (
    <SignUpContinueCtx.Provider actorRef={ref}>
      <Form
        flowActor={ref}
        {...props}
      />
    </SignUpContinueCtx.Provider>
  );
}

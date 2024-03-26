import type { TSignUpVerificationMachine } from '~/internals/machines/sign-up/machines';
import { SignUpVerificationMachine } from '~/internals/machines/sign-up/machines';
import type { SignUpVerificationFriendlyTags, SignUpVerificationTags } from '~/internals/machines/sign-up/types';
import type { FormProps } from '~/react/common/form';
import { Form } from '~/react/common/form';
import { useActiveTags } from '~/react/hooks';
import { SignUpRouterCtx, useSignUpRouteRegistration } from '~/react/sign-up/context';

import { createContextFromActorRef } from '../utils/create-context-from-actor-ref';

export type SignUpVerificationsProps = FormProps;

export const SignUpVerificationCtx = createContextFromActorRef<TSignUpVerificationMachine>('SignUpVerificationCtx');

/**
 * Renders its children when the user is in the verification step of the sign-up flow. This happens after the user has signed up but before their account is active & verified.
 * @example
 * import { SignUp, Step, Strategy } from "@clerk/elements/sign-up"
 *
 * export default SignUpPage = () => (
 *  <SignUp>
 *    <Step name="verifications">
 *      <Strategy name="email_link">
 *        Please check your email for a verification link.
 *      </Strategy>
 *    </Step>
 *  </SignUp>
 * )
 */
export function SignUpVerifications(props: SignUpVerificationsProps) {
  const ref = SignUpRouterCtx.useActorRef();
  const activeState = useActiveTags(ref, 'route:verification');

  return activeState ? <SignUpVerifyInner {...props} /> : null;
}

function SignUpVerifyInner(props: SignUpVerificationsProps) {
  const ref = useSignUpRouteRegistration('verification', SignUpVerificationMachine);

  if (!ref) {
    return null;
  }

  return (
    <SignUpVerificationCtx.Provider actorRef={ref}>
      <Form
        flowActor={ref}
        {...props}
      />
    </SignUpVerificationCtx.Provider>
  );
}

export type SignUpStrategyProps = { name: SignUpVerificationFriendlyTags; children: React.ReactNode };

/**
 * Conditionally renders its children based on the currently active verification method (e.g. password, email code, etc.).
 * You'll most likely want to use this components inside a `<Verify>` component to provide different verification methods during the verification step (after a user signed up but before their account is active & verified).
 * @example
 * import { SignUp, Step, Strategy } from "@clerk/elements/sign-up"
 *
 * export default SignUpPage = () => (
 *  <SignUp>
 *    <Step name="verifications">
 *      <Strategy name="email_link">
 *        Please check your email for a verification link.
 *      </Strategy>
 *    </Step>
 *  </SignUp>
 * )
 */
export function SignUpStrategy({ children, name: tag }: SignUpStrategyProps) {
  const ref = SignUpVerificationCtx.useActorRef(true);

  if (!ref) {
    throw new Error(
      '<SignUpStrategy> used outside of <SignUp>. Did you mean to `import { Strategy } from "@clerk/elements/sign-in"` instead?',
    );
  }

  const { active } = useActiveTags(ref, [
    `verification:${tag}`,
    `verification:category:${tag}`,
  ] as unknown as SignUpVerificationTags[]);

  if (!ref) {
    return null;
  }

  return active ? children : null;
}

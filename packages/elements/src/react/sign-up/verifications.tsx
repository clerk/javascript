import type {
  SignUpVerificationFriendlyTags,
  SignUpVerificationTags,
  TSignUpVerificationMachine,
} from '~/internals/machines/sign-up';
import type { FormProps } from '~/react/common/form';
import { Form } from '~/react/common/form';
import { useActiveTags } from '~/react/hooks';
import { SignUpRouterCtx, useSignUpVerificationStep } from '~/react/sign-up/context';

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
  const activeState = useActiveTags(ref, 'step:verification');

  return activeState ? <SignUpVerifyInner {...props} /> : null;
}

function SignUpVerifyInner(props: SignUpVerificationsProps) {
  const ref = useSignUpVerificationStep();

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
 * Conditionally render its children depending on the authentication strategy that needs to be verified. Does not render any markup on its own.
 *
 * @param {string} name - The name of the strategy for which its children will be rendered.
 *
 * @example
 * <SignUp.Strategy name="email_code">
 *  <Clerk.Field name="code">
 *    <Clerk.Label>Code</Clerk.Label>
 *    <Clerk.Input />
 *    <Clerk.FieldError />
 *  </Clerk.Field>
 *  <SignUp.Action submit>Verify</SignUp.Action>
 * </SignUp.Strategy>
 */
export function SignUpStrategy({ children, name: tag }: SignUpStrategyProps) {
  const ref = SignUpVerificationCtx.useActorRef(true);

  if (!ref) {
    throw new Error(
      '<Strategy> used outside of <SignUp>. Did you mean to `import { Strategy } from "@clerk/elements/sign-in"` instead?',
    );
  }

  const { active } = useActiveTags(ref, [
    `verification:${tag}`,
    `verification:category:${tag}`,
  ] as unknown as SignUpVerificationTags[]);

  return active ? <>{children}</> : null;
}

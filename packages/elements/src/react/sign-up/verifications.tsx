import type { SignUpVerificationFriendlyTags, SignUpVerificationTags } from '~/internals/machines/sign-up';
import type { FormProps } from '~/react/common/form';
import { Form } from '~/react/common/form';
import { useActiveTags } from '~/react/hooks';
import { SignUpRouterCtx } from '~/react/sign-up/context';

export type SignUpVerificationsProps = FormProps;

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

  return activeState ? (
    <Form
      flowActor={ref}
      {...props}
    />
  ) : null;
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
  const ref = SignUpRouterCtx.useActorRef();
  const activeState = useActiveTags(ref, 'step:verification');

  if (!activeState) {
    throw new Error(
      '<Strategy> used outside of <SignUp>. Did you mean to `import { Strategy } from "@clerk/elements/sign-up"` instead?',
    );
  }

  const { active } = useActiveTags(ref, [
    `verification:${tag}`,
    `verification:category:${tag}`,
  ] as unknown as SignUpVerificationTags[]);

  return active ? <>{children}</> : null;
}

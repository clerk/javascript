'use client';

import type { PropsWithChildren } from 'react';

import type { TSignUpVerificationMachine } from '~/internals/machines/sign-up/machines';
import { SignUpVerificationMachine } from '~/internals/machines/sign-up/machines';
import type { SignUpVerificationFriendlyTags, SignUpVerificationTags } from '~/internals/machines/sign-up/types';
import { Form } from '~/react/common/form';
import { useActiveTags } from '~/react/hooks';
import { SignUpRouterCtx, useSignUpRouteRegistration } from '~/react/sign-up/context';

import { createContextFromActorRef } from '../utils/create-context-from-actor-ref';

export type SignUpVerifyProps = PropsWithChildren;

export const SignUpVerificationCtx = createContextFromActorRef<TSignUpVerificationMachine>('SignUpVerificationCtx');

/**
 * Renders its children when the user is in the verification step of the sign-up flow. This happens after the user has signed up but before their account is active & verified.
 * @example
 * import { SignUp, Verify } from "@clerk/elements/sign-up"
 *
 * export default SignUpPage = () => (
 *  <SignUp>
 *   <Verify>
 *    Please verify your account.
 *   </Verify>
 *  </SignUp>
 * )
 */
export function SignUpVerify(props: SignUpVerifyProps) {
  const ref = SignUpRouterCtx.useActorRef();
  const activeState = useActiveTags(ref, 'route:verification');

  const tags = SignUpRouterCtx.useSelector(state => state.tags);
  console.log(tags);

  // const { loading } = useBrowserInspector();

  return activeState ? <SignUpVerifyInner {...props} /> : null;
}

function SignUpVerifyInner(props: SignUpVerifyProps) {
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

export type SignUpVerificationProps = PropsWithChildren<{ name: SignUpVerificationFriendlyTags }>;

/**
 * Conditionally renders its children based on the currently active verification method (e.g. password, email code, etc.).
 * You'll most likely want to use this components inside a `<Verify>` component to provide different verification methods during the verification step (after a user signed up but before their account is active & verified).
 * @example
 * import { SignUp, Verification } from "@clerk/elements/sign-up"
 *
 * export default SignUpPage = () => (
 *  <SignUp>
 *    <Verification name="email_link">
 *      Please check your email for a verification link.
 *    </Verification>
 *  </SignUp>
 * )
 */
export function SignUpVerification({ children, name: tag }: SignUpVerificationProps) {
  const ref = SignUpVerificationCtx.useActorRef();
  const active = useActiveTags(ref, [
    `verification:${tag}`,
    `verification:category:${tag}`,
  ] as unknown as SignUpVerificationTags);

  if (!ref) {
    return null;
  }

  return active ? children : null;
}

// 'use client';

// import type { PropsWithChildren } from 'react';

// import type { SignUpVerificationTags } from '~/internals/machines/sign-up/sign-up.machine';
// import { Form } from '~/react/common/form';
// import { SignUpCtx } from '~/react/sign-up/contexts/sign-up.context';

// import { useActiveTags } from '../hooks/use-active-tags.hook';

// export type SignUpVerifyProps = PropsWithChildren;

// /**
//  * Renders its children when the user is in the verification step of the sign-up flow. This happens after the user has signed up but before their account is active & verified.
//  * @example
//  * import { SignUp, Verify } from "@clerk/elements/sign-up"
//  *
//  * export default SignUpPage = () => (
//  *  <SignUp>
//  *   <Verify>
//  *    Please verify your account.
//  *   </Verify>
//  *  </SignUp>
//  * )
//  */
// export function SignUpVerify({ children }: SignUpVerifyProps) {
//   const ref = SignUpCtx.useActorRef();
//   const active = useActiveTags(ref, 'state:verification');

//   return active ? <Form flowActor={ref}>{children}</Form> : null;
// }

// export type SignUpVerificationProps = PropsWithChildren<{ name: SignUpVerificationTags }>;

// /**
//  * Conditionally renders its children based on the currently active verification method (e.g. password, email code, etc.).
//  * You'll most likely want to use this components inside a `<Verify>` component to provide different verification methods during the verification step (after a user signed up but before their account is active & verified).
//  * @example
//  * import { SignUp, Verification } from "@clerk/elements/sign-up"
//  *
//  * export default SignUpPage = () => (
//  *  <SignUp>
//  *    <Verification name="email_link">
//  *      Please check your email for a verification link.
//  *    </Verification>
//  *  </SignUp>
//  * )
//  */
// export function SignUpVerification({ children, name: tag }: SignUpVerificationProps) {
//   const ref = SignUpCtx.useActorRef();
//   const active = useActiveTags(ref, tag);

//   return active ? children : null;
// }

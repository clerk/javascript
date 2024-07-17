import { useMemo } from 'react';

import { SignInSafeIdentifierSelectorForStrategy, SignInSalutationSelector } from '~/internals/machines/sign-in';

import { SignInRouterCtx, useSignInStrategy } from './context';

/**
 * Render an identifier that has been provided by the user during a sign-in attempt. Renders a `string` (or empty string if it can't find an identifier).
 *
 * @example
 * <SignIn.Strategy name="email_code">
 *  <h1>Check your email</h1>
 *  <p>We've sent a code to <SignIn.SafeIdentifier />.</p>
 * </SignIn.Strategy>
 */
export function SignInSafeIdentifier({ transform }: { transform?: (s: string) => string }): string {
  const strategy = useSignInStrategy();
  const selector = useMemo(() => SignInSafeIdentifierSelectorForStrategy(strategy), [strategy]);
  const safeIdentifier = SignInRouterCtx.useSelector(selector);

  if (transform) {
    return transform(safeIdentifier);
  }

  return safeIdentifier;
}

/**
 * Render a salutation for the user during a sign-in attempt. It attempts to resolve these values in this specific order: First name, Last name, Identifier. Renders a `string` (or empty string if it can't find an identifier).
 *
 * @example
 * <SignIn.Strategy name="password">
 *  <p>Welcome back <SignIn.Salutation />!</p>
 * </SignIn.Strategy>
 */
export function SignInSalutation(): string {
  return SignInRouterCtx.useSelector(SignInSalutationSelector);
}

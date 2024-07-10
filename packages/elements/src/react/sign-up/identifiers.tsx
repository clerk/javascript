import {
  SignUpEmailAddressIdentifierSelector,
  SignUpPhoneNumberIdentifierSelector,
} from '~/internals/machines/sign-up';

import { SignUpRouterCtx } from './context';

/**
 * Render an email address identifier that has been provided by the user during a sign-up attempt. Renders a `string` (or empty string if it can't find an identifier).
 *
 * @example
 * <SignUp.Strategy name="email_code">
 *  <h1>Check your email</h1>
 *  <p>We've sent a code to <SignUp.EmailAddressIdentifier />.</p>
 * </SignUp.Strategy>
 */
export function SignUpEmailAddressIdentifier(): string {
  return SignUpRouterCtx.useSelector(SignUpEmailAddressIdentifierSelector);
}

/**
 * Render an phone number identifier that has been provided by the user during a sign-up attempt. Renders a `string` (or empty string if it can't find an identifier).
 *
 * @example
 * <SignUp.Strategy name="phone_code">
 *  <h1>Check your phone</h1>
 *  <p>We've sent a code to <SignUp.PhoneNumberIdentifier />.</p>
 * </SignUp.Strategy>
 */
export function SignUpPhoneNumberIdentifier(): string {
  return SignUpRouterCtx.useSelector(SignUpPhoneNumberIdentifierSelector);
}

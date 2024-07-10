import type { SignUpRouterSnapshot } from './router.types';

export function SignUpEmailAddressIdentifierSelector(s: SignUpRouterSnapshot): string {
  return s.context.clerk?.client.signUp.emailAddress || '';
}

export function SignUpPhoneNumberIdentifierSelector(s: SignUpRouterSnapshot): string {
  return s.context.clerk?.client.signUp.phoneNumber || '';
}

import type { SignInRouterSnapshot } from '~/internals/machines/sign-in/types';
import { formatSalutation } from '~/internals/machines/utils/formatters';

export function SignInSafeIdentifierSelector(s: SignInRouterSnapshot): string {
  return s.context.clerk?.client.signIn.identifier || '';
}

export function SignInSalutationSelector(s: SignInRouterSnapshot): string {
  const signIn = s.context.clerk?.client.signIn;

  return formatSalutation({
    firstName: signIn?.userData?.firstName,
    identifier: signIn?.identifier,
    lastName: signIn?.userData?.lastName,
  });
}

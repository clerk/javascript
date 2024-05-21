import { formatSalutation } from '~/internals/machines/utils/formatters';

import type { SignInRouterSnapshot } from './router.types';

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

import type { SignInStrategyName } from '~/internals/machines/shared';
import { formatSalutation } from '~/internals/machines/utils/formatters';

import type { SignInRouterSnapshot } from './router.types';

export function SignInSafeIdentifierSelectorForStrategy(
  strategy: SignInStrategyName | undefined,
): (s: SignInRouterSnapshot) => string {
  return (s: SignInRouterSnapshot) => {
    const signIn = s.context.clerk?.client.signIn;
    const identifier = signIn.identifier || '';

    if (strategy) {
      const matchingFactor = [...(signIn.supportedFirstFactors ?? []), ...(signIn.supportedSecondFactors ?? [])].find(
        f => f.strategy === strategy,
      );
      if (matchingFactor && 'safeIdentifier' in matchingFactor) {
        return matchingFactor.safeIdentifier;
      }
    }

    return identifier;
  };
}

export function SignInSalutationSelector(s: SignInRouterSnapshot): string {
  const signIn = s.context.clerk?.client.signIn;

  return formatSalutation({
    firstName: signIn?.userData?.firstName,
    identifier: signIn?.identifier,
    lastName: signIn?.userData?.lastName,
  });
}

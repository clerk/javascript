import type { SignInStrategyName } from '~/internals/machines/shared';
import { formatSalutation } from '~/internals/machines/utils/formatters';

import type { SignInRouterSnapshot } from './router.types';

export function SignInSafeIdentifierSelectorForStrategy(
  strategy: SignInStrategyName | undefined,
): (s: SignInRouterSnapshot) => string {
  return (s: SignInRouterSnapshot) => {
    const signIn = s.context.clerk?.client.signIn;

    if (strategy) {
      const matchingFactors = [
        ...(signIn.supportedFirstFactors ?? []),
        ...(signIn.supportedSecondFactors ?? []),
      ].filter(f => f.strategy === strategy);

      const matchingFactorForIdentifier =
        signIn.identifier && matchingFactors.length > 0
          ? matchingFactors.find(f => 'safeIdentifier' in f && f.safeIdentifier === signIn.identifier)
          : null;

      const matchingFactorForStrategy = matchingFactors[0];

      if (matchingFactorForIdentifier && 'safeIdentifier' in matchingFactorForIdentifier) {
        return matchingFactorForIdentifier.safeIdentifier;
      }

      if (matchingFactorForStrategy && 'safeIdentifier' in matchingFactorForStrategy) {
        return matchingFactorForStrategy.safeIdentifier;
      }
    }

    return signIn.identifier || '';
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

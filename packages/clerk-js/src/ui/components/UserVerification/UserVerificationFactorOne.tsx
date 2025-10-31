import type { SessionVerificationFirstFactor, SignInFactor } from '@clerk/shared/types';
import React, { useEffect, useMemo } from 'react';

import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { ErrorCard } from '@/ui/elements/ErrorCard';
import { LoadingCard } from '@/ui/elements/LoadingCard';

import { useEnvironment } from '../../contexts';
import { localizationKeys } from '../../localization';
import { useRouter } from '../../router';
import { determineStartingSignInFactor, factorHasLocalStrategy } from '../SignIn/utils';
import { AlternativeMethods } from './AlternativeMethods';
import { useReverificationAlternativeStrategies } from './useReverificationAlternativeStrategies';
import { UserVerificationFactorOnePasswordCard } from './UserVerificationFactorOnePassword';
import { useUserVerificationSession, withUserVerificationSessionGuard } from './useUserVerificationSession';
import { sortByPrimaryFactor } from './utils';
import { UVFactorOneEmailCodeCard } from './UVFactorOneEmailCodeCard';
import { UVFactorOnePasskeysCard } from './UVFactorOnePasskeysCard';
import { UVFactorOnePhoneCodeCard } from './UVFactorOnePhoneCodeCard';

const factorKey = (factor: SignInFactor | null | undefined) => {
  if (!factor) {
    return '';
  }
  let key = factor.strategy;
  if ('emailAddressId' in factor) {
    key += factor.emailAddressId;
  }
  if ('phoneNumberId' in factor) {
    key += factor.phoneNumberId;
  }
  return key;
};

const SUPPORTED_STRATEGIES: SessionVerificationFirstFactor['strategy'][] = [
  'password',
  'email_code',
  'phone_code',
  'passkey',
] as const;

export function UserVerificationFactorOneInternal(): JSX.Element | null {
  const { data } = useUserVerificationSession();
  const card = useCardState();
  const { navigate } = useRouter();

  const lastPreparedFactorKeyRef = React.useRef('');
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const sessionVerification = data!;

  const availableFactors = useMemo(() => {
    return (
      sessionVerification.supportedFirstFactors
        ?.filter(factor => SUPPORTED_STRATEGIES.includes(factor.strategy))
        ?.sort(sortByPrimaryFactor) || null
    );
  }, [sessionVerification.supportedFirstFactors]);
  const { preferredSignInStrategy } = useEnvironment().displayConfig;

  const [{ currentFactor }, setFactor] = React.useState<{
    currentFactor: SignInFactor | undefined | null;
    prevCurrentFactor: SignInFactor | undefined | null;
  }>(() => ({
    currentFactor: determineStartingSignInFactor(availableFactors, null, preferredSignInStrategy),
    prevCurrentFactor: undefined,
  }));

  const { hasAnyStrategy, hasFirstParty } = useReverificationAlternativeStrategies({
    filterOutFactor: currentFactor,
    supportedFirstFactors: availableFactors,
  });

  const [showAllStrategies, setShowAllStrategies] = React.useState<boolean>(
    () => !currentFactor || !factorHasLocalStrategy(currentFactor),
  );

  const toggleAllStrategies = hasAnyStrategy
    ? () => {
        card.setError(undefined);
        setShowAllStrategies(s => !s);
      }
    : undefined;

  const handleFactorPrepare = () => {
    lastPreparedFactorKeyRef.current = factorKey(currentFactor);
  };

  const selectFactor = (factor: SignInFactor) => {
    setFactor(prev => ({
      currentFactor: factor,
      prevCurrentFactor: prev.currentFactor,
    }));
  };

  useEffect(() => {
    if (sessionVerification.status === 'needs_second_factor') {
      void navigate('factor-two');
    }
  }, []);

  if (!currentFactor) {
    return (
      <ErrorCard
        cardTitle={localizationKeys('reverification.noAvailableMethods.title')}
        cardSubtitle={localizationKeys('reverification.noAvailableMethods.subtitle')}
        message={localizationKeys('reverification.noAvailableMethods.message')}
        shouldNavigateBack={false}
      />
    );
  }

  if (showAllStrategies) {
    const canGoBack = factorHasLocalStrategy(currentFactor);

    const toggle = toggleAllStrategies;
    const backHandler = () => {
      card.setError(undefined);
      toggle?.();
    };

    return (
      <AlternativeMethods
        onBackLinkClick={canGoBack ? backHandler : undefined}
        onFactorSelected={f => {
          selectFactor(f);
          toggle?.();
        }}
        currentFactor={currentFactor}
      />
    );
  }

  switch (currentFactor?.strategy) {
    case 'password':
      return <UserVerificationFactorOnePasswordCard onShowAlternativeMethodsClick={toggleAllStrategies} />;
    case 'email_code':
      return (
        <UVFactorOneEmailCodeCard
          factorAlreadyPrepared={lastPreparedFactorKeyRef.current === factorKey(currentFactor)}
          onFactorPrepare={handleFactorPrepare}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
          factor={currentFactor}
          showAlternativeMethods={hasFirstParty}
        />
      );
    case 'phone_code':
      return (
        <UVFactorOnePhoneCodeCard
          factorAlreadyPrepared={lastPreparedFactorKeyRef.current === factorKey(currentFactor)}
          onFactorPrepare={handleFactorPrepare}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
          factor={currentFactor}
          showAlternativeMethods={hasFirstParty}
        />
      );
    case 'passkey':
      return <UVFactorOnePasskeysCard onShowAlternativeMethodsClicked={toggleAllStrategies} />;
    default:
      return <LoadingCard />;
  }
}

export const UserVerificationFactorOne = withUserVerificationSessionGuard(
  withCardStateProvider(UserVerificationFactorOneInternal),
);

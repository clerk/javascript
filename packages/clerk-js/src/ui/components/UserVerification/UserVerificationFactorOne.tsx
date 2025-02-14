import type { SignInFactor } from '@clerk/types';
import React, { useEffect } from 'react';

import { useEnvironment } from '../../contexts';
import { ErrorCard, LoadingCard, useCardState, withCardStateProvider } from '../../elements';
import { useReverificationAlternativeStrategies } from '../../hooks/useAlternativeStrategies';
import { localizationKeys } from '../../localization';
import { useRouter } from '../../router';
import { determineStartingSignInFactor, factorHasLocalStrategy } from '../SignIn/utils';
import { AlternativeMethods } from './AlternativeMethods';
import { UserVerificationFactorOnePasswordCard } from './UserVerificationFactorOnePassword';
import { useUserVerificationSession, withUserVerificationSessionGuard } from './useUserVerificationSession';
import { UVFactorOneEmailCodeCard } from './UVFactorOneEmailCodeCard';
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

export function _UserVerificationFactorOne(): JSX.Element | null {
  const { data } = useUserVerificationSession();
  const card = useCardState();
  const { navigate } = useRouter();

  const lastPreparedFactorKeyRef = React.useRef('');
  const sessionVerification = data!;

  const availableFactors = sessionVerification.supportedFirstFactors;
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

  const toggleAllStrategies = hasAnyStrategy ? () => setShowAllStrategies(s => !s) : undefined;

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
    default:
      return <LoadingCard />;
  }
}

export const UserVerificationFactorOne = withUserVerificationSessionGuard(
  withCardStateProvider(_UserVerificationFactorOne),
);

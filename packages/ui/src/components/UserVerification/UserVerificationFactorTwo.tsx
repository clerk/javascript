import type { SessionVerificationResource, SessionVerificationSecondFactor } from '@clerk/shared/types';
import { useEffect, useMemo } from 'react';

import { withCardStateProvider } from '@/elements/contexts';
import { LoadingCard } from '@/elements/LoadingCard';
import { useIsWebAuthnSupported } from '@/hooks';
import { useRouter } from '@/router';

import { useSecondFactorSelection } from '../SignIn/useSecondFactorSelection';
import { isOfferableSecondFactor } from '../SignIn/utils';
import { secondFactorsAreEqual } from './useReverificationAlternativeStrategies';
import { UserVerificationFactorTwoTOTP } from './UserVerificationFactorTwoTOTP';
import { useUserVerificationSession, withUserVerificationSessionGuard } from './useUserVerificationSession';
import { sortByPrimaryFactor } from './utils';
import { UVFactorTwoAlternativeMethods } from './UVFactorTwoAlternativeMethods';
import { UVFactorTwoBackupCodeCard } from './UVFactorTwoBackupCodeCard';
import { UVFactorTwoPasskeyCard } from './UVFactorTwoPasskeyCard';
import { UVFactorTwoPhoneCodeCard } from './UVFactorTwoPhoneCodeCard';

const SUPPORTED_STRATEGIES: SessionVerificationSecondFactor['strategy'][] = [
  'phone_code',
  'totp',
  'backup_code',
  'passkey',
] as const;

export function UserVerificationFactorTwoComponent(): JSX.Element {
  const { navigate } = useRouter();
  const { data } = useUserVerificationSession();
  const sessionVerification = data as SessionVerificationResource;
  const webAuthnSupported = useIsWebAuthnSupported();

  // A passkey the device can't use stays in the list, so that when it's the only
  // second factor the passkey card renders and reports the error instead of an
  // endless loading card. useSecondFactorSelection never starts with it otherwise.
  const availableFactors = useMemo(() => {
    return (
      sessionVerification.supportedSecondFactors
        ?.filter(factor => SUPPORTED_STRATEGIES.includes(factor.strategy))
        ?.sort(sortByPrimaryFactor) || null
    );
  }, [sessionVerification.supportedSecondFactors]);

  const {
    currentFactor,
    factorAlreadyPrepared,
    handleFactorPrepare,
    selectFactor,
    showAllStrategies,
    toggleAllStrategies,
  } = useSecondFactorSelection<SessionVerificationSecondFactor>(availableFactors);

  const secondFactorsExcludingCurrent = useMemo(
    () =>
      availableFactors?.filter(
        factor => isOfferableSecondFactor(factor, webAuthnSupported) && !secondFactorsAreEqual(factor, currentFactor),
      ),
    [availableFactors, currentFactor, webAuthnSupported],
  );

  const hasAlternativeStrategies = useMemo(
    () => (secondFactorsExcludingCurrent && secondFactorsExcludingCurrent.length > 0) || false,
    [secondFactorsExcludingCurrent],
  );

  useEffect(() => {
    if (sessionVerification.status === 'needs_first_factor') {
      void navigate('../');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!currentFactor) {
    return <LoadingCard />;
  }

  if (showAllStrategies && hasAlternativeStrategies) {
    return (
      <UVFactorTwoAlternativeMethods
        supportedSecondFactors={secondFactorsExcludingCurrent || null}
        onBackLinkClick={toggleAllStrategies}
        onFactorSelected={selectFactor}
      />
    );
  }

  switch (currentFactor?.strategy) {
    case 'phone_code':
      return (
        <UVFactorTwoPhoneCodeCard
          factorAlreadyPrepared={factorAlreadyPrepared}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
          showAlternativeMethods={hasAlternativeStrategies}
        />
      );
    case 'totp':
      return (
        <UserVerificationFactorTwoTOTP
          factorAlreadyPrepared={factorAlreadyPrepared}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={toggleAllStrategies}
          showAlternativeMethods={hasAlternativeStrategies}
        />
      );
    case 'backup_code':
      return (
        <UVFactorTwoBackupCodeCard
          onShowAlternativeMethodsClicked={hasAlternativeStrategies ? toggleAllStrategies : undefined}
        />
      );
    case 'passkey':
      return (
        <UVFactorTwoPasskeyCard
          onShowAlternativeMethodsClicked={toggleAllStrategies}
          showAlternativeMethods={hasAlternativeStrategies}
        />
      );
    default:
      return <LoadingCard />;
  }
}

export const UserVerificationFactorTwo = withUserVerificationSessionGuard(
  withCardStateProvider(UserVerificationFactorTwoComponent),
);

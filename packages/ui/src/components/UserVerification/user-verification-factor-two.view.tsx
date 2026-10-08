import type { SessionVerificationSecondFactor } from '@clerk/shared/types';

import { LoadingCard } from '@/elements/LoadingCard';

import { UserVerificationFactorTwoTOTP } from './UserVerificationFactorTwoTOTP';
import { UVFactorTwoAlternativeMethods } from './UVFactorTwoAlternativeMethods';
import { UVFactorTwoBackupCodeCard } from './UVFactorTwoBackupCodeCard';
import { UVFactorTwoPhoneCodeCard } from './UVFactorTwoPhoneCodeCard';

export const UserVerificationFactorTwoView = ({
  currentFactor,
  factorAlreadyPrepared,
  showAllStrategies,
  hasAlternativeStrategies,
  secondFactorsExcludingCurrent,
  onFactorPrepare,
  onSelectFactor,
  onToggleAllStrategies,
}: {
  currentFactor: SessionVerificationSecondFactor | null;
  factorAlreadyPrepared: boolean;
  showAllStrategies: boolean;
  hasAlternativeStrategies: boolean;
  secondFactorsExcludingCurrent: SessionVerificationSecondFactor[] | null | undefined;
  onFactorPrepare: () => void;
  onSelectFactor: (factor: SessionVerificationSecondFactor) => void;
  onToggleAllStrategies: () => void;
}): JSX.Element => {
  if (!currentFactor) {
    return <LoadingCard />;
  }

  if (showAllStrategies && hasAlternativeStrategies) {
    return (
      <UVFactorTwoAlternativeMethods
        supportedSecondFactors={secondFactorsExcludingCurrent || null}
        onBackLinkClick={onToggleAllStrategies}
        onFactorSelected={onSelectFactor}
      />
    );
  }

  switch (currentFactor.strategy) {
    case 'phone_code':
      return (
        <UVFactorTwoPhoneCodeCard
          factorAlreadyPrepared={factorAlreadyPrepared}
          onFactorPrepare={onFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={onToggleAllStrategies}
          showAlternativeMethods={hasAlternativeStrategies}
        />
      );
    case 'totp':
      return (
        <UserVerificationFactorTwoTOTP
          factorAlreadyPrepared={factorAlreadyPrepared}
          onFactorPrepare={onFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={onToggleAllStrategies}
          showAlternativeMethods={hasAlternativeStrategies}
        />
      );
    case 'backup_code':
      return (
        <UVFactorTwoBackupCodeCard
          onShowAlternativeMethodsClicked={hasAlternativeStrategies ? onToggleAllStrategies : undefined}
        />
      );
    default:
      return <LoadingCard />;
  }
};

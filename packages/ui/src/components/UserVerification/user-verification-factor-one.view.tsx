import type { SignInFactor } from '@clerk/shared/types';

import { ErrorCard } from '@/ui/elements/ErrorCard';
import { LoadingCard } from '@/ui/elements/LoadingCard';

import { localizationKeys } from '../../localization';
import { factorHasLocalStrategy } from '../SignIn/utils';
import { AlternativeMethods } from './AlternativeMethods';
import { UserVerificationFactorOnePasswordCard } from './UserVerificationFactorOnePassword';
import { UVFactorOneEmailCodeCard } from './UVFactorOneEmailCodeCard';
import { UVFactorOnePasskeysCard } from './UVFactorOnePasskeysCard';
import { UVFactorOnePhoneCodeCard } from './UVFactorOnePhoneCodeCard';

export const UserVerificationFactorOneView = ({
  currentFactor,
  showAllStrategies,
  factorAlreadyPrepared,
  hasAlternativeStrategies,
  onToggleAllStrategies,
  onBack,
  onSelectFactor,
  onFactorPrepare,
}: {
  currentFactor: SignInFactor | undefined | null;
  showAllStrategies: boolean;
  factorAlreadyPrepared: boolean;
  hasAlternativeStrategies: boolean;
  onToggleAllStrategies: (() => void) | undefined;
  onBack: () => void;
  onSelectFactor: (factor: SignInFactor) => void;
  onFactorPrepare: () => void;
}): JSX.Element | null => {
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
    return (
      <AlternativeMethods
        onBackLinkClick={canGoBack ? onBack : undefined}
        onFactorSelected={onSelectFactor}
        currentFactor={currentFactor}
      />
    );
  }

  switch (currentFactor.strategy) {
    case 'password':
      return <UserVerificationFactorOnePasswordCard onShowAlternativeMethodsClick={onToggleAllStrategies} />;
    case 'email_code':
      return (
        <UVFactorOneEmailCodeCard
          factorAlreadyPrepared={factorAlreadyPrepared}
          onFactorPrepare={onFactorPrepare}
          onShowAlternativeMethodsClicked={onToggleAllStrategies}
          factor={currentFactor}
          showAlternativeMethods={hasAlternativeStrategies}
        />
      );
    case 'phone_code':
      return (
        <UVFactorOnePhoneCodeCard
          factorAlreadyPrepared={factorAlreadyPrepared}
          onFactorPrepare={onFactorPrepare}
          onShowAlternativeMethodsClicked={onToggleAllStrategies}
          factor={currentFactor}
          showAlternativeMethods={hasAlternativeStrategies}
        />
      );
    case 'passkey':
      return <UVFactorOnePasskeysCard onShowAlternativeMethodsClicked={onToggleAllStrategies} />;
    default:
      return <LoadingCard />;
  }
};

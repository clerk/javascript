import { withCardStateProvider } from '@/elements/contexts';

import { useUserVerificationFactorTwoController } from './user-verification-factor-two.controller';
import {
  useUserVerificationFactorTwoAlternativesModel,
  useUserVerificationFactorTwoModel,
} from './user-verification-factor-two.model';
import { UserVerificationFactorTwoView } from './user-verification-factor-two.view';
import { withUserVerificationSessionGuard } from './useUserVerificationSession';

export function UserVerificationFactorTwoComponent(): JSX.Element {
  const model = useUserVerificationFactorTwoModel();
  const controller = useUserVerificationFactorTwoController(model);
  const alternatives = useUserVerificationFactorTwoAlternativesModel(model.availableFactors, controller.currentFactor);

  return (
    <UserVerificationFactorTwoView
      currentFactor={controller.currentFactor}
      factorAlreadyPrepared={controller.factorAlreadyPrepared}
      showAllStrategies={controller.showAllStrategies}
      hasAlternativeStrategies={alternatives.hasAlternativeStrategies}
      secondFactorsExcludingCurrent={alternatives.secondFactorsExcludingCurrent}
      onFactorPrepare={controller.handleFactorPrepare}
      onSelectFactor={controller.selectFactor}
      onToggleAllStrategies={controller.toggleAllStrategies}
    />
  );
}

export const UserVerificationFactorTwo = withUserVerificationSessionGuard(
  withCardStateProvider(UserVerificationFactorTwoComponent),
);

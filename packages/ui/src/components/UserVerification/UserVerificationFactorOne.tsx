import { withCardStateProvider } from '@/ui/elements/contexts';

import { useUserVerificationFactorOneController } from './user-verification-factor-one.controller';
import {
  useUserVerificationFactorOneAlternativesModel,
  useUserVerificationFactorOneModel,
} from './user-verification-factor-one.model';
import { UserVerificationFactorOneView } from './user-verification-factor-one.view';
import { withUserVerificationSessionGuard } from './useUserVerificationSession';

export function UserVerificationFactorOneInternal(): JSX.Element | null {
  const model = useUserVerificationFactorOneModel();
  const controller = useUserVerificationFactorOneController(model);
  const alternatives = useUserVerificationFactorOneAlternativesModel(model.availableFactors, controller.currentFactor);
  const toggleAllStrategies = alternatives.hasAlternativeStrategies ? controller.toggleAllStrategies : undefined;

  return (
    <UserVerificationFactorOneView
      currentFactor={controller.currentFactor}
      showAllStrategies={controller.showAllStrategies}
      factorAlreadyPrepared={controller.factorAlreadyPrepared}
      hasAlternativeStrategies={alternatives.hasAlternativeStrategies}
      onToggleAllStrategies={toggleAllStrategies}
      onBack={() => {
        controller.clearError();
        toggleAllStrategies?.();
      }}
      onSelectFactor={factor => {
        controller.selectFactor(factor);
        toggleAllStrategies?.();
      }}
      onFactorPrepare={controller.handleFactorPrepare}
    />
  );
}

export const UserVerificationFactorOne = withUserVerificationSessionGuard(
  withCardStateProvider(UserVerificationFactorOneInternal),
);

import type { useSignInClientTrustModel } from './sign-in-client-trust.model';
import { useSecondFactorSelection } from './useSecondFactorSelection';

type SignInClientTrustModel = ReturnType<typeof useSignInClientTrustModel>;

export function useSignInClientTrustController(model: SignInClientTrustModel) {
  const {
    currentFactor,
    factorAlreadyPrepared,
    handleFactorPrepare,
    selectFactor,
    showAllStrategies,
    toggleAllStrategies,
  } = useSecondFactorSelection(model.supportedSecondFactors);
  const onShowAlternativeMethodsClicked =
    model.supportedSecondFactors && model.supportedSecondFactors.length > 1 ? toggleAllStrategies : undefined;

  return {
    currentFactor,
    factorAlreadyPrepared,
    handleFactorPrepare,
    selectFactor,
    showAllStrategies,
    toggleAllStrategies,
    onShowAlternativeMethodsClicked,
  };
}

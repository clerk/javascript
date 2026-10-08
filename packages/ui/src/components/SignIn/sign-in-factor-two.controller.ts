import React from 'react';

import type { useSignInFactorTwoModel } from './sign-in-factor-two.model';
import { useSecondFactorSelection } from './useSecondFactorSelection';

type SignInFactorTwoModel = ReturnType<typeof useSignInFactorTwoModel>;

export function useSignInFactorTwoController(model: SignInFactorTwoModel) {
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

  React.useEffect(() => {
    model.redirectIfInvalid();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only run on mount and when setActiveInProgress changes
  }, [model.setActiveInProgress]);

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

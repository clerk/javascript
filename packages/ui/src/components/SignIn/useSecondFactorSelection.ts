import type { SignInFactor } from '@clerk/shared/types';
import React from 'react';

import { determineStartingSignInSecondFactor, secondFactorKey } from './utils';

export function useSecondFactorSelection(availableFactors: SignInFactor[] | null) {
  const lastPreparedFactorKeyRef = React.useRef('');
  const [currentFactor, setCurrentFactor] = React.useState<SignInFactor | null>(() =>
    determineStartingSignInSecondFactor(availableFactors),
  );

  const [showAllStrategies, setShowAllStrategies] = React.useState<boolean>(!currentFactor);
  const toggleAllStrategies = () => setShowAllStrategies(s => !s);

  const handleFactorPrepare = () => {
    lastPreparedFactorKeyRef.current = secondFactorKey(currentFactor);
  };

  const selectFactor = (factor: SignInFactor) => {
    setCurrentFactor(factor);
    setShowAllStrategies(false);
  };

  const factorAlreadyPrepared = lastPreparedFactorKeyRef.current === secondFactorKey(currentFactor);

  return {
    currentFactor,
    factorAlreadyPrepared,
    handleFactorPrepare,
    selectFactor,
    showAllStrategies,
    toggleAllStrategies,
  };
}

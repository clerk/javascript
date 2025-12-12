import type { SignInFactor } from '@clerk/shared/types';
import React from 'react';

import { determineStartingSignInSecondFactor } from './utils';

const secondFactorKey = (factor: SignInFactor | null | undefined) => {
  if (!factor) {
    return '';
  }
  let key = factor.strategy;
  if ('phoneNumberId' in factor) {
    key += factor.phoneNumberId;
  }
  return key;
};

export function useSecondFactorSelection<T extends SignInFactor = SignInFactor>(availableFactors: T[] | null) {
  const lastPreparedFactorKeyRef = React.useRef('');
  const [currentFactor, setCurrentFactor] = React.useState<T | null>(
    () => determineStartingSignInSecondFactor(availableFactors) as T | null,
  );

  const [showAllStrategies, setShowAllStrategies] = React.useState<boolean>(!currentFactor);
  const toggleAllStrategies = () => setShowAllStrategies(s => !s);

  const handleFactorPrepare = () => {
    lastPreparedFactorKeyRef.current = secondFactorKey(currentFactor);
  };

  const selectFactor = (factor: T) => {
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

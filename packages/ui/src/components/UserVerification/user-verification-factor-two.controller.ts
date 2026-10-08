import type { SessionVerificationSecondFactor, SignInFactor } from '@clerk/shared/types';
import React, { useEffect } from 'react';

import { determineStartingSignInSecondFactor } from '../SignIn/utils';
import type { useUserVerificationFactorTwoModel } from './user-verification-factor-two.model';

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

type FactorTwoState = { currentFactor: SessionVerificationSecondFactor | null; showAllStrategies: boolean };
type FactorTwoEvent = { type: 'SELECT'; factor: SessionVerificationSecondFactor } | { type: 'TOGGLE_STRATEGIES' };

const factorTwoTransition = (state: FactorTwoState, event: FactorTwoEvent): FactorTwoState => {
  switch (event.type) {
    case 'SELECT':
      return { currentFactor: event.factor, showAllStrategies: false };
    case 'TOGGLE_STRATEGIES':
      return { ...state, showAllStrategies: !state.showAllStrategies };
  }
};

export const useUserVerificationFactorTwoController = (model: ReturnType<typeof useUserVerificationFactorTwoModel>) => {
  const lastPreparedFactorKeyRef = React.useRef('');
  const [state, dispatch] = React.useReducer(factorTwoTransition, model.availableFactors, availableFactors => {
    const currentFactor = determineStartingSignInSecondFactor(
      availableFactors,
    ) as SessionVerificationSecondFactor | null;
    return { currentFactor, showAllStrategies: !currentFactor };
  });

  useEffect(() => {
    if (model.sessionStatus === 'needs_first_factor') {
      void model.navigateToFactorOne();
    }
  }, []);

  return {
    currentFactor: state.currentFactor,
    showAllStrategies: state.showAllStrategies,
    factorAlreadyPrepared: lastPreparedFactorKeyRef.current === secondFactorKey(state.currentFactor),
    handleFactorPrepare: () => {
      lastPreparedFactorKeyRef.current = secondFactorKey(state.currentFactor);
    },
    selectFactor: (factor: SessionVerificationSecondFactor) => dispatch({ type: 'SELECT', factor }),
    toggleAllStrategies: () => dispatch({ type: 'TOGGLE_STRATEGIES' }),
  };
};

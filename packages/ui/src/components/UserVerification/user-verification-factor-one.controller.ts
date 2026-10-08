import type { SignInFactor } from '@clerk/shared/types';
import React, { useEffect } from 'react';

import { useCardState } from '@/ui/elements/contexts';

import { determineStartingSignInFactor, factorHasLocalStrategy } from '../SignIn/utils';
import type { useUserVerificationFactorOneModel } from './user-verification-factor-one.model';

const factorKey = (factor: SignInFactor | null | undefined) => {
  if (!factor) {
    return '';
  }
  let key = factor.strategy;
  if ('emailAddressId' in factor) {
    key += factor.emailAddressId;
  }
  if ('phoneNumberId' in factor) {
    key += factor.phoneNumberId;
  }
  return key;
};

type FactorOneState = {
  currentFactor: SignInFactor | undefined | null;
  prevCurrentFactor: SignInFactor | undefined | null;
  showAllStrategies: boolean;
};

type FactorOneEvent = { type: 'SELECT'; factor: SignInFactor } | { type: 'TOGGLE_STRATEGIES' };

const factorOneTransition = (state: FactorOneState, event: FactorOneEvent): FactorOneState => {
  switch (event.type) {
    case 'SELECT':
      return { ...state, currentFactor: event.factor, prevCurrentFactor: state.currentFactor };
    case 'TOGGLE_STRATEGIES':
      return { ...state, showAllStrategies: !state.showAllStrategies };
  }
};

export const useUserVerificationFactorOneController = (model: ReturnType<typeof useUserVerificationFactorOneModel>) => {
  const card = useCardState();
  const lastPreparedFactorKeyRef = React.useRef('');
  const [state, dispatch] = React.useReducer(factorOneTransition, model, currentModel => {
    const currentFactor = determineStartingSignInFactor(
      currentModel.availableFactors,
      null,
      currentModel.preferredSignInStrategy,
    );
    return {
      currentFactor,
      prevCurrentFactor: undefined,
      showAllStrategies: !currentFactor || !factorHasLocalStrategy(currentFactor),
    };
  });

  useEffect(() => {
    if (model.sessionStatus === 'needs_second_factor') {
      void model.navigateToFactorTwo();
    }
  }, []);

  return {
    currentFactor: state.currentFactor,
    showAllStrategies: state.showAllStrategies,
    factorAlreadyPrepared: lastPreparedFactorKeyRef.current === factorKey(state.currentFactor),
    handleFactorPrepare: () => {
      lastPreparedFactorKeyRef.current = factorKey(state.currentFactor);
    },
    selectFactor: (factor: SignInFactor) => dispatch({ type: 'SELECT', factor }),
    toggleAllStrategies: () => {
      card.setError(undefined);
      dispatch({ type: 'TOGGLE_STRATEGIES' });
    },
    clearError: () => card.setError(undefined),
  };
};

import React from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

import type { useSignInFactorOneSSOBypassModel } from './sign-in-factor-one-sso-bypass.model';

type SignInFactorOneSSOBypassModel = ReturnType<typeof useSignInFactorOneSSOBypassModel>;
type Step = 'sso' | 'code';
type State = { step: Step; isRedirecting: boolean };
type Event = { type: 'GO_TO_STEP'; step: Step } | { type: 'START_REDIRECT' } | { type: 'REDIRECT_FAILED' };

function reducer(state: State, event: Event): State {
  switch (event.type) {
    case 'GO_TO_STEP':
      return { ...state, step: event.step };
    case 'START_REDIRECT':
      return { ...state, isRedirecting: true };
    case 'REDIRECT_FAILED':
      return { ...state, isRedirecting: false };
  }
}

export function useSignInFactorOneSSOBypassController(model: SignInFactorOneSSOBypassModel) {
  const card = useCardState();
  const [state, send] = React.useReducer(reducer, { step: 'sso', isRedirecting: false });

  const goToStep = (step: Step) => {
    card.setError(undefined);
    send({ type: 'GO_TO_STEP', step });
  };

  const handleSSOError = (error: Error) => handleError(error, [], card.setError);

  const handleContinueWithSSO = () => {
    send({ type: 'START_REDIRECT' });
    void model.authenticate().catch(error => {
      send({ type: 'REDIRECT_FAILED' });
      handleSSOError(error);
    });
  };

  // The connection button only resets its own loading state on rejection, so surface the error
  // here and rethrow to keep that reset.
  const handleSelectEnterpriseConnection = (enterpriseConnectionId: string) =>
    model.authenticate(enterpriseConnectionId).catch(error => {
      handleSSOError(error);
      throw error;
    });

  return {
    step: state.step,
    isRedirecting: state.isRedirecting,
    error: card.error,
    hasMultipleConnections: model.hasMultipleConnections,
    enterpriseConnections: model.enterpriseConnections,
    goToStep,
    handleContinueWithSSO,
    handleSelectEnterpriseConnection,
  };
}

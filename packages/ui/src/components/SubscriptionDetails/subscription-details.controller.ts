import { useCallback, useReducer } from 'react';

import type { SubscriptionDetailsController, SubscriptionDetailsModel } from './subscription-details.types';

type CancellationState = {
  phase: 'idle' | 'confirming' | 'closed';
  subscriptionId: string | null;
};

type CancellationEvent = { type: 'select'; subscriptionId: string | null } | { type: 'setOpen'; open: boolean };

const cancellationReducer = (state: CancellationState, event: CancellationEvent): CancellationState => {
  if (event.type === 'select') {
    return { phase: state.phase, subscriptionId: event.subscriptionId };
  }

  return {
    phase: event.open ? 'confirming' : state.subscriptionId ? 'closed' : 'idle',
    subscriptionId: state.subscriptionId,
  };
};

export const useSubscriptionDetailsController = (model: SubscriptionDetailsModel): SubscriptionDetailsController => {
  const [cancellation, dispatch] = useReducer(cancellationReducer, { phase: 'idle', subscriptionId: null });
  const setSubscriptionId = useCallback(
    (subscriptionId: string | null) => dispatch({ type: 'select', subscriptionId }),
    [],
  );
  const setConfirmationOpen = useCallback((open: boolean) => dispatch({ type: 'setOpen', open }), []);

  return {
    isLoading: model.isLoading,
    hasSubscription: model.hasSubscription,
    cancellation: {
      subscriptionId: cancellation.subscriptionId,
      setSubscriptionId,
      confirmationOpen: cancellation.phase === 'confirming',
      setConfirmationOpen,
    },
  };
};

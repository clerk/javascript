import { useEffect, useRef } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

import type { CheckoutMutationsData, CheckoutMutationsModel } from './checkout-mutations.types';

export const HIDDEN_INPUT_NAME = 'payment_method_id';

export const useCheckoutMutationsController = (model: CheckoutMutationsModel): CheckoutMutationsData => {
  const card = useCardState();
  const latest = useRef({ model, card });
  latest.current = { model, card };
  const mounted = useRef(true);
  const current = useRef({
    key: model.requestKey,
    pending: undefined as Promise<void> | undefined,
    release: undefined as (() => void) | undefined,
    generation: {},
  });
  if (current.current.key !== model.requestKey) {
    current.current = { key: model.requestKey, pending: undefined, release: undefined, generation: {} };
  }
  const owner = current.current;
  const previousKey = useRef(model.requestKey);
  useEffect(() => {
    mounted.current = true;
    if (previousKey.current !== owner.key) {
      previousKey.current = owner.key;
      latest.current.card.setError(undefined);
    }
    return () => {
      mounted.current = false;
      owner.generation = {};
      owner.release?.();
      owner.release = undefined;
      owner.pending = undefined;
    };
  }, [owner]);
  const canRun = () => mounted.current && current.current === owner && latest.current.model.canRun();

  return {
    isLoading: card.isLoading,
    error: card.error,
    confirmCheckout: params => {
      if (!canRun()) {
        return Promise.resolve();
      }
      if (owner.pending) {
        return owner.pending;
      }
      const release = latest.current.card.beginRequest();
      if (!release) {
        return Promise.resolve();
      }
      owner.release = release;
      latest.current.card.setError(undefined);
      const origin = owner.generation;
      const isCurrent = () => canRun() && owner.generation === origin;
      const pending = latest.current.model
        .confirmCheckout(params, isCurrent)
        .catch(error => {
          if (isCurrent()) {
            handleError(error as Error, [], latest.current.card.setError);
          }
        })
        .finally(() => {
          release();
          if (owner.pending === pending) {
            owner.pending = undefined;
            owner.release = undefined;
          }
        });
      owner.pending = pending;
      return pending;
    },
  };
};

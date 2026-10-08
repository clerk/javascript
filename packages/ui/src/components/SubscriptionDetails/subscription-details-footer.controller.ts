import { useEffect, useRef, useState } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

import type {
  SubscriptionDetailsFooterModel,
  SubscriptionDetailsFooterOptions,
  SubscriptionDetailsFooterViewData,
} from './subscription-details.types';

export const useSubscriptionDetailsFooterController = (
  model: SubscriptionDetailsFooterModel,
  options: SubscriptionDetailsFooterOptions,
): SubscriptionDetailsFooterViewData => {
  const card = useCardState();
  const [isPending, setIsPending] = useState(false);
  const pendingAction = useRef<Promise<void> | null>(null);
  const isMounted = useRef(true);
  const selection = useRef(model.selectionId);
  const previousSelection = useRef(model.selectionId);
  selection.current = model.selectionId;
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (previousSelection.current !== model.selectionId) {
      previousSelection.current = model.selectionId;
      card.setError(undefined);
    }
  }, [model.selectionId, card]);
  const isCurrentSelection = () =>
    isMounted.current && selection.current === model.selectionId && model.isCurrentScope();
  const onOpenChange = (open: boolean) => {
    if (isCurrentSelection() && !pendingAction.current) {
      card.setError(undefined);
      options.setConfirmationOpen(open);
    }
  };
  const cancelSubscription = (): Promise<void> => {
    if (!isCurrentSelection() || !model.hasSelection) {
      return Promise.resolve();
    }
    if (pendingAction.current) {
      return pendingAction.current;
    }
    setIsPending(true);
    card.setError(undefined);
    const pending = (async () => model.cancelSubscription())()
      .then(completed => {
        if (completed && isCurrentSelection()) {
          options.onComplete();
          if (isCurrentSelection()) {
            options.closeDrawer();
          }
        }
      })
      .catch(error => {
        if (isCurrentSelection()) {
          handleError(error as Error, [], card.setError);
        }
      })
      .finally(() => {
        pendingAction.current = null;
        if (isMounted.current) {
          setIsPending(false);
        }
      });
    pendingAction.current = pending;
    return pending;
  };

  return {
    hasNextPayment: model.hasNextPayment,
    confirmationOpen: options.confirmationOpen,
    hasSelection: model.hasSelection,
    isLoading: isPending,
    error: card.error,
    keepLabel: model.keepLabel,
    cancelLabel: model.cancelLabel,
    titleLabel: model.titleLabel,
    descriptionLabel: model.descriptionLabel,
    onOpenChange,
    keepSubscription: () => onOpenChange(false),
    cancelSubscription,
  };
};

import { useEffect, useRef } from 'react';

import type {
  SubscriptionDetailsActionsModel,
  SubscriptionDetailsActionsOptions,
  SubscriptionDetailsActionsViewData,
} from './subscription-details.types';

export const useSubscriptionDetailsActionsController = (
  model: SubscriptionDetailsActionsModel | null,
  options: SubscriptionDetailsActionsOptions,
): SubscriptionDetailsActionsViewData => {
  const isMounted = useRef(true);
  const isOpen = useRef(options.isOpen);
  isOpen.current = options.isOpen;
  const selection = useRef(model?.subscriptionId);
  selection.current = model?.subscriptionId;
  const checkoutStarted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (options.isOpen) {
      checkoutStarted.current = false;
    }
  }, [options.isOpen, model?.subscriptionId]);
  const canRun = (action: 'switch' | 'cancel' | 'resubscribe') =>
    isMounted.current &&
    isOpen.current &&
    !checkoutStarted.current &&
    selection.current === model?.subscriptionId &&
    !!model?.canRun(action);
  const openCheckout = (action: 'switch' | 'resubscribe', command: () => boolean) => {
    if (!canRun(action)) {
      return;
    }
    checkoutStarted.current = true;
    try {
      options.closeDrawer();
      if (!command()) {
        checkoutStarted.current = false;
      }
    } catch (error) {
      checkoutStarted.current = false;
      throw error;
    }
  };
  if (!model?.canManageBilling) {
    return { actions: [] };
  }
  const actions = [
    model.isSwitchable && model.switchLabel
      ? {
          key: 'switch',
          label: model.switchLabel,
          isDestructive: false,
          onClick: () => openCheckout('switch', model.switchPlan),
        }
      : null,
    model.isCancellable
      ? {
          key: 'cancel',
          label: model.cancelLabel,
          isDestructive: true,
          onClick: () => {
            if (canRun('cancel')) {
              options.selectForCancellation(model.subscriptionId);
            }
          },
        }
      : null,
    model.isReSubscribable
      ? {
          key: 'resubscribe',
          label: model.reSubscribeLabel,
          isDestructive: false,
          onClick: () => openCheckout('resubscribe', model.reSubscribe),
        }
      : null,
  ].filter(action => action !== null);
  return { actions };
};

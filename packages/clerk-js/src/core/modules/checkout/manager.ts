import type { __experimental_CheckoutCacheState, ClerkAPIResponseError, CommerceCheckoutResource } from '@clerk/types';

import { createStore, createStoreKey, type StoreKey } from '../../store';

type CheckoutKey = StoreKey;

const CHECKOUT_STATUS = {
  AWAITING_INITIALIZATION: 'awaiting_initialization' as const,
  AWAITING_CONFIRMATION: 'awaiting_confirmation' as const,
  COMPLETED: 'completed' as const,
};

const FETCH_STATUS = {
  IDLE: 'idle' as const,
  FETCHING: 'fetching' as const,
  ERROR: 'error' as const,
};

/**
 * Derives the checkout state from the base state.
 */
function deriveCheckoutState(baseState: Partial<__experimental_CheckoutCacheState>): __experimental_CheckoutCacheState {
  const fetchStatus = (() => {
    if (baseState.isStarting || baseState.isConfirming) return FETCH_STATUS.FETCHING;
    if (baseState.error) return FETCH_STATUS.ERROR;
    return FETCH_STATUS.IDLE;
  })();

  const status = (() => {
    if (baseState.checkout?.status === 'complete') return CHECKOUT_STATUS.COMPLETED;
    if (baseState.isConfirming) return CHECKOUT_STATUS.AWAITING_CONFIRMATION;
    return CHECKOUT_STATUS.AWAITING_INITIALIZATION;
  })();

  return {
    isStarting: false,
    isConfirming: false,
    error: null,
    checkout: null,
    ...baseState,
    fetchStatus,
    status,
  } as __experimental_CheckoutCacheState;
}

const defaultCacheState: __experimental_CheckoutCacheState = Object.freeze(
  deriveCheckoutState({
    isStarting: false,
    isConfirming: false,
    error: null,
    checkout: null,
  }),
);

// Create a global store instance for checkout management using the factory
const checkoutStore = createStore<CheckoutKey, __experimental_CheckoutCacheState>({
  deriveState: deriveCheckoutState,
  defaultState: defaultCacheState,
});

export interface CheckoutManager {
  getCacheState(): __experimental_CheckoutCacheState;
  subscribe(listener: (newState: __experimental_CheckoutCacheState) => void): () => void;
  executeOperation(
    operation: 'start' | 'confirm',
    handler: () => Promise<CommerceCheckoutResource>,
  ): Promise<CommerceCheckoutResource>;
  clearCheckout(): void;
}

/**
 * Creates a checkout manager for a specific checkout configuration.
 */
function createCheckoutManager(options: { planId: string; planPeriod: string; for?: 'organization' }): CheckoutManager {
  const cacheKey = createStoreKey(`${options.for || 'user'}:${options.planId}:${options.planPeriod}`);

  const getCacheState = (): __experimental_CheckoutCacheState => {
    return checkoutStore.getState(cacheKey);
  };

  const updateCacheState = (
    updates: Partial<Omit<__experimental_CheckoutCacheState, 'fetchStatus' | 'status'>>,
  ): void => {
    checkoutStore.setState(cacheKey, updates);
  };

  const executeOperation = async (
    operation: 'start' | 'confirm',
    handler: () => Promise<CommerceCheckoutResource>,
  ): Promise<CommerceCheckoutResource> => {
    const operationId = `${operation}-${Date.now()}`;

    checkoutStore.addPendingOperation(cacheKey, operationId);

    const loadingStateKey = operation === 'start' ? 'isStarting' : 'isConfirming';
    updateCacheState({ [loadingStateKey]: true, error: null });

    try {
      const checkout = await handler();
      updateCacheState({ [loadingStateKey]: false, checkout, error: null });
      return checkout;
    } catch (error) {
      const clerkError = error as ClerkAPIResponseError;
      updateCacheState({ [loadingStateKey]: false, error: clerkError });
      throw error;
    } finally {
      checkoutStore.removePendingOperation(cacheKey, operationId);
    }
  };

  const clearCheckout = (): void => {
    if (!checkoutStore.hasPendingOperations(cacheKey)) {
      checkoutStore.clearState(cacheKey);
    }
  };

  return {
    getCacheState,
    subscribe(listener: (newState: __experimental_CheckoutCacheState) => void): () => void {
      return checkoutStore.subscribe(cacheKey, listener);
    },
    executeOperation,
    clearCheckout,
  };
}

export { createCheckoutManager, type CheckoutKey };

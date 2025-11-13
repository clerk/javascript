import type {
  __experimental_CheckoutCacheState,
  __experimental_CheckoutInstance,
  BillingCheckoutResource,
  ClerkAPIResponseError,
} from '@clerk/shared/types';

type CheckoutKey = string & { readonly __tag: 'CheckoutKey' };

type CheckoutResult = Awaited<ReturnType<__experimental_CheckoutInstance['start']>>;

const createManagerCache = <CacheKey, CacheState>() => {
  const cache = new Map<CacheKey, CacheState>();
  const listeners = new Map<CacheKey, Set<(newState: CacheState) => void>>();
  const pendingOperations = new Map<CacheKey, Map<string, Promise<CheckoutResult>>>();

  return {
    cache,
    listeners,
    pendingOperations,
    safeGet<K extends CacheKey, V extends Set<any>>(key: K, map: Map<K, V>): NonNullable<V> {
      if (!map.has(key)) {
        map.set(key, new Set() as V);
      }
      return map.get(key) as NonNullable<V>;
    },
    safeGetOperations<K extends CacheKey>(key: K): Map<string, Promise<CheckoutResult>> {
      if (!this.pendingOperations.has(key)) {
        this.pendingOperations.set(key, new Map<string, Promise<CheckoutResult>>());
      }
      return this.pendingOperations.get(key) as Map<string, Promise<CheckoutResult>>;
    },
  };
};

const managerCache = createManagerCache<CheckoutKey, __experimental_CheckoutCacheState>();

const CHECKOUT_STATUS = {
  NEEDS_INITIALIZATION: 'needs_initialization',
  NEEDS_CONFIRMATION: 'needs_confirmation',
  COMPLETED: 'completed',
} as const;

export const FETCH_STATUS = {
  IDLE: 'idle',
  FETCHING: 'fetching',
  ERROR: 'error',
} as const;

/**
 * Derives the checkout state from the base state.
 */
function deriveCheckoutState(
  baseState: Omit<__experimental_CheckoutCacheState, 'fetchStatus' | 'status'>,
): __experimental_CheckoutCacheState {
  const fetchStatus = (() => {
    if (baseState.isStarting || baseState.isConfirming) {
      return FETCH_STATUS.FETCHING;
    }
    if (baseState.error) {
      return FETCH_STATUS.ERROR;
    }
    return FETCH_STATUS.IDLE;
  })();

  const status = (() => {
    if (baseState.checkout?.status === CHECKOUT_STATUS.COMPLETED) {
      return CHECKOUT_STATUS.COMPLETED;
    }
    if (baseState.checkout) {
      return CHECKOUT_STATUS.NEEDS_CONFIRMATION;
    }
    return CHECKOUT_STATUS.NEEDS_INITIALIZATION;
  })();

  return {
    ...baseState,
    fetchStatus,
    status,
  };
}

const defaultCacheState: __experimental_CheckoutCacheState = Object.freeze(
  deriveCheckoutState({
    isStarting: false,
    isConfirming: false,
    error: null,
    checkout: null,
  }),
);

/**
 * Creates a checkout manager for handling checkout operations and state management.
 *
 * @param cacheKey - Unique identifier for the checkout instance
 * @returns Manager with methods for checkout operations and state subscription
 *
 * @example
 * ```typescript
 * const manager = createCheckoutManager('user-123-plan-456-monthly');
 * const unsubscribe = manager.subscribe(state => console.log(state));
 * ```
 */
function createCheckoutManager(cacheKey: CheckoutKey) {
  const listeners = managerCache.safeGet(cacheKey, managerCache.listeners);
  const pendingOperations = managerCache.safeGetOperations(cacheKey);

  const notifyListeners = () => {
    listeners.forEach(listener => listener(getCacheState()));
  };

  const getCacheState = (): __experimental_CheckoutCacheState => {
    return managerCache.cache.get(cacheKey) || defaultCacheState;
  };

  const updateCacheState = (
    updates: Partial<Omit<__experimental_CheckoutCacheState, 'fetchStatus' | 'status'>>,
  ): void => {
    const currentState = getCacheState();
    const baseState = { ...currentState, ...updates };
    const newState = deriveCheckoutState(baseState);
    managerCache.cache.set(cacheKey, Object.freeze(newState));
    notifyListeners();
  };

  return {
    subscribe(listener: (newState: __experimental_CheckoutCacheState) => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    getCacheState,

    // Shared operation handler to eliminate duplication
    async executeOperation(
      operationType: 'start' | 'confirm',
      operationFn: () => Promise<BillingCheckoutResource>,
    ): Promise<CheckoutResult> {
      const operationId = `${cacheKey}-${operationType}`;
      const isRunningField = operationType === 'start' ? 'isStarting' : 'isConfirming';

      // Check if there's already a pending operation
      const existingOperation = pendingOperations.get(operationId);
      if (existingOperation) {
        // Wait for the existing operation to complete and return its result
        // If it fails, all callers should receive the same error
        return await existingOperation;
      }

      // Create and store the operation promise
      const operationPromise = (async () => {
        let data: BillingCheckoutResource | null = null;
        let error: ClerkAPIResponseError | null = null;
        try {
          // Mark operation as in progress and clear any previous errors
          updateCacheState({
            [isRunningField]: true,
            error: null,
            ...(operationType === 'start' ? { checkout: null } : {}),
          });

          // Execute the checkout operation
          const result = await operationFn();

          // Update state with successful result
          updateCacheState({ [isRunningField]: false, error: null, checkout: result });
          data = result;
        } catch (e) {
          // Cast error to expected type and update state
          const clerkError = e as ClerkAPIResponseError;
          error = clerkError;
          updateCacheState({ [isRunningField]: false, error: clerkError });
        } finally {
          // Always clean up pending operation tracker
          pendingOperations.delete(operationId);
        }
        return { data, error } as CheckoutResult;
      })();

      pendingOperations.set(operationId, operationPromise);
      return operationPromise;
    },

    clearCheckout(): void {
      // Only reset the state if there are no pending operations
      if (pendingOperations.size === 0) {
        updateCacheState(defaultCacheState);
      }
    },
  };
}

export { createCheckoutManager, type __experimental_CheckoutCacheState as CheckoutCacheState, type CheckoutKey };

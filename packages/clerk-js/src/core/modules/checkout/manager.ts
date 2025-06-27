import type { ClerkAPIResponseError } from '@clerk/shared/error';
import type { CommerceCheckoutResource } from '@clerk/types';

type CheckoutStatus = 'awaiting_initialization' | 'awaiting_confirmation' | 'completed';
type CheckoutKey = string & { readonly __tag: 'CheckoutKey' };

type CheckoutCacheState = Readonly<{
  isStarting: boolean;
  isConfirming: boolean;
  error: ClerkAPIResponseError | null;
  checkout: CommerceCheckoutResource | null;
  fetchStatus: 'idle' | 'fetching' | 'error';
  status: CheckoutStatus;
}>;

const createManagerCache = <CacheKey, CacheState>() => {
  const cache = new Map<CacheKey, CacheState>();
  const listeners = new Map<CacheKey, Set<(newState: CacheState) => void>>();
  const pendingOperations = new Map<CacheKey, Map<string, Promise<CommerceCheckoutResource>>>();

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
    safeGetOperations<K extends CacheKey>(key: K): Map<string, Promise<CommerceCheckoutResource>> {
      if (!this.pendingOperations.has(key)) {
        this.pendingOperations.set(key, new Map<string, Promise<CommerceCheckoutResource>>());
      }
      return this.pendingOperations.get(key) as Map<string, Promise<CommerceCheckoutResource>>;
    },
  };
};

const managerCache = createManagerCache<CheckoutKey, CheckoutCacheState>();

const CHECKOUT_STATUS = {
  AWAITING_INITIALIZATION: 'awaiting_initialization',
  AWAITING_CONFIRMATION: 'awaiting_confirmation',
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
function deriveCheckoutState(baseState: Omit<CheckoutCacheState, 'fetchStatus' | 'status'>): CheckoutCacheState {
  const fetchStatus = (() => {
    if (baseState.isStarting || baseState.isConfirming) return FETCH_STATUS.FETCHING;
    if (baseState.error) return FETCH_STATUS.ERROR;
    return FETCH_STATUS.IDLE;
  })();

  const status = (() => {
    if (baseState.checkout?.status === CHECKOUT_STATUS.COMPLETED) return CHECKOUT_STATUS.COMPLETED;
    if (baseState.checkout) return CHECKOUT_STATUS.AWAITING_CONFIRMATION;
    return CHECKOUT_STATUS.AWAITING_INITIALIZATION;
  })();

  return {
    ...baseState,
    fetchStatus,
    status,
  };
}

const defaultCacheState: CheckoutCacheState = Object.freeze(
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

  const getCacheState = (): CheckoutCacheState => {
    return managerCache.cache.get(cacheKey) || defaultCacheState;
  };

  const updateCacheState = (updates: Partial<Omit<CheckoutCacheState, 'fetchStatus' | 'status'>>): void => {
    const currentState = getCacheState();
    const baseState = { ...currentState, ...updates };
    const newState = deriveCheckoutState(baseState);
    managerCache.cache.set(cacheKey, Object.freeze(newState));
    notifyListeners();
  };

  return {
    subscribe(listener: (newState: CheckoutCacheState) => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    getCacheState,

    // Shared operation handler to eliminate duplication
    async executeOperation(
      operationType: 'start' | 'confirm',
      operationFn: () => Promise<CommerceCheckoutResource>,
    ): Promise<CommerceCheckoutResource> {
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
          return result;
        } catch (error) {
          // Cast error to expected type and update state
          const clerkError = error as ClerkAPIResponseError;
          updateCacheState({ [isRunningField]: false, error: clerkError });
          throw error;
        } finally {
          // Always clean up pending operation tracker
          pendingOperations.delete(operationId);
        }
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

export { createCheckoutManager, type CheckoutCacheState, type CheckoutKey };

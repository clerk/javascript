import type { CommerceCheckoutResource, CommerceSubscriptionPlanPeriod, ConfirmCheckoutParams } from '@clerk/types';

import type { ClerkAPIResponseError } from '../..';
import type { Clerk } from '../clerk';

type CheckoutStatus = 'awaiting_initialization' | 'awaiting_confirmation' | 'completed';

export type CheckoutOptions = {
  for?: 'organization';
  planPeriod: CommerceSubscriptionPlanPeriod;
  planId: string;
};

export type CheckoutInstance = {
  confirm: (params: ConfirmCheckoutParams) => Promise<CommerceCheckoutResource>;
  start: () => Promise<CommerceCheckoutResource>;
  clear: () => void;
  finalize: (params: { redirectUrl?: string }) => void;
  subscribe: (listener: (state: CheckoutCacheState) => void) => () => void;
  getState: () => CheckoutCacheState;
};

type CheckoutKey = string;

type CheckoutCacheState = {
  isStarting: boolean;
  isConfirming: boolean;
  error: ClerkAPIResponseError | null;
  checkout: CommerceCheckoutResource | null;
  fetchStatus: 'idle' | 'fetching' | 'error';
  status: CheckoutStatus;
};

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

/**
 * Derives the checkout state from the base state.
 */
function deriveCheckoutState(baseState: Omit<CheckoutCacheState, 'fetchStatus' | 'status'>): CheckoutCacheState {
  const fetchStatus = (() => {
    if (baseState.isStarting || baseState.isConfirming) return 'fetching' as const;
    if (baseState.error) return 'error' as const;
    return 'idle' as const;
  })();

  const status = (() => {
    const completedCode = 'completed';
    if (baseState.checkout?.status === completedCode) return 'completed' as const;
    if (baseState.checkout) return 'awaiting_confirmation' as const;
    return 'awaiting_initialization' as const;
  })();

  return {
    ...baseState,
    fetchStatus,
    status,
  };
}

const defaultCacheState: CheckoutCacheState = deriveCheckoutState({
  isStarting: false,
  isConfirming: false,
  error: null,
  checkout: null,
});

/**
 * Factory function that creates a checkout manager for a specific cache key.
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
    managerCache.cache.set(cacheKey, newState);
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
          updateCacheState({ [isRunningField]: true, error: null });
          const result = await operationFn();
          updateCacheState({ [isRunningField]: false, error: null, checkout: result });
          return result;
        } catch (error) {
          const clerkError = error as ClerkAPIResponseError;
          updateCacheState({ [isRunningField]: false, error: clerkError });
          throw error;
        } finally {
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

/**
 * Generate cache key for checkout instance
 */
function cacheKey(options: { userId: string; orgId?: string; planId: string; planPeriod: string }): CheckoutKey {
  const { userId, orgId, planId, planPeriod } = options;
  return `${userId}-${orgId || 'user'}-${planId}-${planPeriod}`;
}

export type CheckoutFunction = (options: CheckoutOptions) => CheckoutInstance;

/**
 * Create a checkout instance with the given options
 */
function createCheckoutInstance(clerk: Clerk, options: CheckoutOptions): CheckoutInstance {
  const { for: forOrganization, planId, planPeriod } = options;

  if (!clerk.user) {
    throw new Error('Clerk: User is not authenticated');
  }

  if (forOrganization === 'organization' && !clerk.organization) {
    throw new Error('Clerk: Use `setActive` to set the organization');
  }

  const checkoutKey = cacheKey({
    userId: clerk.user.id,
    orgId: forOrganization === 'organization' ? clerk.organization?.id : undefined,
    planId,
    planPeriod,
  });

  const manager = createCheckoutManager(checkoutKey);

  const start = async (): Promise<CommerceCheckoutResource> => {
    return manager.executeOperation('start', async () => {
      const result = await clerk.billing?.startCheckout({
        ...(forOrganization === 'organization' ? { orgId: clerk.organization?.id } : {}),
        planId,
        planPeriod,
      });
      return result;
    });
  };

  const confirm = async (params: ConfirmCheckoutParams): Promise<CommerceCheckoutResource> => {
    return manager.executeOperation('confirm', async () => {
      const checkout = manager.getCacheState().checkout;
      if (!checkout) {
        throw new Error('Clerk: Call `start` before `confirm`');
      }
      return checkout.confirm(params);
    });
  };

  const finalize = ({ redirectUrl }: { redirectUrl?: string }) => {
    void clerk.setActive({ session: clerk.session?.id, redirectUrl });
  };

  const clear = () => manager.clearCheckout();

  const subscribe = (listener: (state: CheckoutCacheState) => void) => {
    return manager.subscribe(listener);
  };

  return {
    start,
    confirm,
    finalize,
    clear,
    subscribe,
    getState: manager.getCacheState,
  };
}

export { createCheckoutInstance };

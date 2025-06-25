import type { CommerceCheckoutResource, CommerceSubscriptionPlanPeriod, ConfirmCheckoutParams } from '@clerk/types';
import { useCallback, useMemo, useSyncExternalStore } from 'react';

import type { ClerkAPIResponseError } from '../..';
import { useCheckoutContext } from '../contexts';
import { useClerk } from './useClerk';
import { useOrganization } from './useOrganization';
import { useSession } from './useSession';
import { useUser } from './useUser';

type CheckoutStatus = 'awaiting_initialization' | 'awaiting_confirmation' | 'completed';

/**
 * Utility type that removes function properties from a type.
 */
type RemoveFunctions<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? never : K]: T[K];
};

/**
 * Utility type that makes all properties nullable.
 */
type Nullable<T> = {
  [K in keyof T]: null;
};

type CheckoutProperties = Omit<
  RemoveFunctions<CommerceCheckoutResource>,
  'paymentSource' | 'plan' | 'pathRoot' | 'reload' | 'confirm'
> & {
  plan: RemoveFunctions<CommerceCheckoutResource['plan']>;
  paymentSource: RemoveFunctions<CommerceCheckoutResource['paymentSource']>;
  __internal_checkout: CommerceCheckoutResource;
};
type NullableCheckoutProperties = Nullable<
  Omit<RemoveFunctions<CommerceCheckoutResource>, 'paymentSource' | 'plan' | 'pathRoot' | 'reload' | 'confirm'>
> & {
  plan: null;
  paymentSource: null;
  __internal_checkout: null;
};

type UseCheckoutReturn = (CheckoutProperties | NullableCheckoutProperties) & {
  confirm: (params: ConfirmCheckoutParams) => Promise<CommerceCheckoutResource>;
  start: () => Promise<CommerceCheckoutResource>;
  isStarting: boolean;
  isConfirming: boolean;
  error: ClerkAPIResponseError | undefined;
  status: CheckoutStatus;
  clear: () => void;
  finalize: (params: { redirectUrl?: string }) => void;
  fetchStatus: 'idle' | 'fetching' | 'error';
};

type UseCheckoutOptions = {
  for?: 'organization';
  planPeriod: CommerceSubscriptionPlanPeriod;
  planId: string;
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
  const pendingOperations = new Map<CacheKey, Set<string>>();

  return {
    cache,
    listeners,
    pendingOperations,
    safeGet<K extends CacheKey, V extends Set<any>>(key: K, map: Map<K, V>): NonNullable<V> {
      if (!map.has(key)) {
        map.set(key, new Set() as V);
      }
      // We know this is non-null because we just set it above if it didn't exist
      return map.get(key) as NonNullable<V>;
    },
  };
};

const managerCache = createManagerCache<CheckoutKey, CheckoutCacheState>();

/**
 * Derives the checkout state from the base state.
 *
 * @internal
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
 *
 * @internal
 */
function createCheckoutManager(cacheKey: CheckoutKey) {
  // Get or create listeners for this cacheKey
  const listeners = managerCache.safeGet(cacheKey, managerCache.listeners);
  const pendingOperations = managerCache.safeGet(cacheKey, managerCache.pendingOperations);

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

      // Prevent duplicate operations
      if (getCacheState()[isRunningField] || pendingOperations.has(operationId)) {
        throw new Error(`Checkout ${operationType} already in progress`);
      }

      pendingOperations.add(operationId);

      try {
        updateCacheState({ [isRunningField]: true, error: null });
        console.log('dispatching operation', isRunningField, true);
        const result = await operationFn();
        updateCacheState({ [isRunningField]: false, error: null, checkout: result });
        console.log('dispatching operation', isRunningField, false);
        return result;
      } catch (error) {
        const clerkError = error as ClerkAPIResponseError;
        console.log('dispatching operation', isRunningField, false, clerkError);
        updateCacheState({ [isRunningField]: false, error: clerkError });
        throw error;
      } finally {
        pendingOperations.delete(operationId);
      }
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
 * @internal
 */
function cacheKey(options: { userId: string; orgId?: string; planId: string; planPeriod: string }): CheckoutKey {
  const { userId, orgId, planId, planPeriod } = options;
  return `${userId}-${orgId || 'user'}-${planId}-${planPeriod}`;
}

export const useCheckout = (options?: UseCheckoutOptions): UseCheckoutReturn => {
  const contextOptions = useCheckoutContext();
  const { for: forOrganization, planId, planPeriod } = options || contextOptions;

  const clerk = useClerk();
  const { organization } = useOrganization();
  const { user } = useUser();
  const { session } = useSession();

  if (!user) {
    throw new Error('Clerk: User is not authenticated');
  }

  if (forOrganization === 'organization' && !organization) {
    throw new Error('Clerk: Use `setActive` to set the organization');
  }

  const checkoutKey = cacheKey({
    userId: user?.id,
    orgId: forOrganization === 'organization' ? organization?.id : undefined,
    planId,
    planPeriod,
  });

  const manager = useMemo(() => createCheckoutManager(checkoutKey), [checkoutKey]);

  const managerState = useSyncExternalStore(
    (...args) => manager.subscribe(...args),
    () => manager.getCacheState(),
    () => manager.getCacheState(),
  );

  const start = useCallback(async (): Promise<CommerceCheckoutResource> => {
    return manager.executeOperation('start', async () => {
      const result = await clerk.billing?.startCheckout({
        ...(forOrganization === 'organization' ? { orgId: organization?.id } : {}),
        planId,
        planPeriod,
      });
      return result;
    });
  }, [manager, clerk.billing, forOrganization, organization?.id, planId, planPeriod]);

  const confirm = useCallback(
    async (params: ConfirmCheckoutParams): Promise<CommerceCheckoutResource> => {
      return manager.executeOperation('confirm', async () => {
        const checkout = manager.getCacheState().checkout;
        if (!checkout) {
          throw new Error('Clerk: Call `start` before `confirm`');
        }
        return checkout.confirm(params);
      });
    },
    [manager],
  );

  const finalize = useCallback(
    ({ redirectUrl }: { redirectUrl?: string }) => {
      void clerk.setActive({ session: session?.id, redirectUrl });
    },
    [clerk, session?.id],
  );

  const clear = useCallback(() => {
    manager.clearCheckout();
  }, [manager]);

  const properties = useMemo(() => {
    if (!managerState.checkout) {
      return {
        id: null,
        externalClientSecret: null,
        externalGatewayId: null,
        statement_id: null,
        status: null,
        totals: null,
        isImmediatePlanChange: null,
        planPeriod: null,
        plan: null,
        paymentSource: null,
      };
    }
    const {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      reload,
      confirm,
      pathRoot,
      // All the above need to be removed from the properties
      ...rest
    } = managerState.checkout;
    return rest;
  }, [managerState.checkout]);

  return {
    ...properties,
    // @ts-expect-error - checkout can be null but UseCheckoutReturn expects it to be CommerceCheckoutResource | undefined
    __internal_checkout: managerState.checkout,
    start,
    isStarting: managerState.isStarting,
    isConfirming: managerState.isConfirming,
    error: managerState.error || undefined,
    status: managerState.status,
    fetchStatus: managerState.fetchStatus,
    confirm,
    clear,
    finalize,
  };
};

import type { CommerceCheckoutResource, CommerceSubscriptionPlanPeriod, ConfirmCheckoutParams } from '@clerk/types';
import { useCallback, useMemo, useSyncExternalStore } from 'react';

import type { ClerkAPIResponseError } from '../..';
import { useClerk } from './useClerk';
import { useOrganization } from './useOrganization';
import { useSession } from './useSession';
import { useUser } from './useUser';

type CheckoutStatus = 'awaiting_initialization' | 'awaiting_confirmation' | 'completed';

type UseCheckoutReturn = {
  checkout: CommerceCheckoutResource | undefined;
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
};

// Global cache state
const globalCheckoutCache = new Map<string, CheckoutCacheState>();

// Global listeners and pending operations keyed by cacheKey
const globalListeners = new Map<CheckoutKey, Set<(newState: CheckoutCacheState) => void>>();
const globalPendingOperations = new Map<CheckoutKey, Set<string>>();

const defaultCacheState: CheckoutCacheState = {
  isStarting: false,
  isConfirming: false,
  error: null,
  checkout: null,
};

// Factory function that creates a checkout manager for a specific cache key
/**
 *
 */
function createCheckoutManager(cacheKey: CheckoutKey) {
  console.log('[createCheckoutManager] initializing', cacheKey);

  // Get or create listeners for this cacheKey
  if (!globalListeners.has(cacheKey)) {
    globalListeners.set(cacheKey, new Set());
  }
  if (!globalPendingOperations.has(cacheKey)) {
    globalPendingOperations.set(cacheKey, new Set());
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- it is handled above
  const listeners = globalListeners.get(cacheKey)!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- it is handled above
  const pendingOperations = globalPendingOperations.get(cacheKey)!;

  const notifyListeners = () => {
    listeners.forEach(listener => listener(getCacheState()));
  };

  const getCacheState = (): CheckoutCacheState => {
    return globalCheckoutCache.get(cacheKey) || defaultCacheState;
  };

  const updateCacheState = (updates: Partial<CheckoutCacheState>): void => {
    const currentState = getCacheState();
    const newState = { ...currentState, ...updates };
    globalCheckoutCache.set(cacheKey, newState);
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

    async startCheckout(startFn: () => Promise<CommerceCheckoutResource>): Promise<CommerceCheckoutResource> {
      const operationId = `${cacheKey}-start`;

      // Prevent duplicate operations
      if (getCacheState().isStarting || pendingOperations.has(operationId)) {
        // TODO: improve it
        throw new Error('Checkout start already in progress');
      }

      pendingOperations.add(operationId);

      try {
        updateCacheState({ isStarting: true, error: null });
        const result = await startFn();
        updateCacheState({ isStarting: false, error: null, checkout: result });
        return result;
      } catch (error) {
        const clerkError = error as ClerkAPIResponseError;
        updateCacheState({ isStarting: false, error: clerkError });
        throw error;
      } finally {
        pendingOperations.delete(operationId);
      }
    },

    async confirmCheckout(confirmFn: () => Promise<CommerceCheckoutResource>): Promise<CommerceCheckoutResource> {
      const operationId = `${cacheKey}-confirm`;

      // Prevent duplicate operations
      if (getCacheState().isConfirming || pendingOperations.has(operationId)) {
        // TODO: improve it
        throw new Error('Checkout confirm already in progress');
      }

      pendingOperations.add(operationId);

      try {
        updateCacheState({ isConfirming: true, error: null });
        const result = await confirmFn();
        updateCacheState({ isConfirming: false, error: null, checkout: result });
        return result;
      } catch (error) {
        const clerkError = error as ClerkAPIResponseError;
        updateCacheState({ isConfirming: false, error: clerkError });
        throw error;
      } finally {
        pendingOperations.delete(operationId);
      }
    },

    clearCheckout(): void {
      updateCacheState(defaultCacheState);
    },
  };
}

/**
 *
 */
function generateCheckoutKey(options: {
  userId?: string;
  orgId?: string;
  planId: string;
  planPeriod: string;
}): CheckoutKey {
  const { userId, orgId, planId, planPeriod } = options;
  return `${userId || 'anonymous'}-${orgId || 'user'}-${planId}-${planPeriod}`;
}

export const useCheckout = (options: UseCheckoutOptions): UseCheckoutReturn => {
  const { for: forOrganization, planId, planPeriod } = options;
  const clerk = useClerk();
  const { organization } = useOrganization();
  const { user } = useUser();
  const { session } = useSession();

  if (!user) {
    throw new Error('Clerk: User is not authenticated');
  }

  const checkoutKey = generateCheckoutKey({
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
    return manager.startCheckout(async () => {
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
      if (!manager.getCacheState().checkout) {
        throw new Error('No checkout to confirm');
      }
      // @ts-ignore Handle this
      return manager.confirmCheckout(() => manager.getCacheState().checkout.confirm(params));
    },
    [manager],
  );

  const fetchStatus = useMemo(() => {
    if (managerState.isStarting || managerState.isConfirming) return 'fetching';
    if (managerState.error) return 'error';
    return 'idle';
  }, [managerState.isStarting, managerState.isConfirming, managerState.error]);

  const finalize = useCallback(
    ({ redirectUrl }: { redirectUrl?: string }) => {
      void clerk.setActive({ session: session?.id, redirectUrl });
    },
    [clerk, session?.id],
  );

  const clear = useCallback(() => {
    manager.clearCheckout();
  }, [manager]);

  const status = useMemo(() => {
    const completedCode = 'completed';
    if (managerState.checkout?.status === completedCode) return 'completed';
    if (managerState.checkout) {
      return 'awaiting_confirmation';
    }
    return 'awaiting_initialization';
  }, [managerState.checkout?.status]);

  return {
    checkout: managerState.checkout || undefined,
    start,
    isStarting: managerState.isStarting,
    isConfirming: managerState.isConfirming,
    error: managerState.error || undefined,
    status,
    fetchStatus,
    confirm,
    clear,
    finalize,
  };
};

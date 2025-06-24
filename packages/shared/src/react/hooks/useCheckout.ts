import type { CommerceCheckoutResource, CommerceSubscriptionPlanPeriod, ConfirmCheckoutParams } from '@clerk/types';
import { useCallback, useEffect, useMemo, useState } from 'react';

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

type CheckoutOperationState = {
  isStarting: boolean;
  isConfirming: boolean;
  error: ClerkAPIResponseError | undefined;
};

type CheckoutKey = string;

type CheckoutGlobalState = {
  checkouts: Map<CheckoutKey, CommerceCheckoutResource>;
  operations: Map<CheckoutKey, CheckoutOperationState>;
};

const defaultOperationState: CheckoutOperationState = {
  isStarting: false,
  isConfirming: false,
  error: undefined,
};

// Global state manager using a simple class-based singleton
class CheckoutGlobalManager {
  private static instance: CheckoutGlobalManager;
  private state: CheckoutGlobalState = {
    checkouts: new Map(),
    operations: new Map(),
  };
  private listeners = new Set<() => void>();
  private pendingOperations = new Set<string>();

  static getInstance(): CheckoutGlobalManager {
    if (!CheckoutGlobalManager.instance) {
      CheckoutGlobalManager.instance = new CheckoutGlobalManager();
    }
    return CheckoutGlobalManager.instance;
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getCheckout(key: CheckoutKey): CommerceCheckoutResource | undefined {
    return this.state.checkouts.get(key);
  }

  getOperationState(key: CheckoutKey): CheckoutOperationState {
    return this.state.operations.get(key) || defaultOperationState;
  }

  private setCheckout(key: CheckoutKey, checkout: CommerceCheckoutResource | undefined): void {
    if (checkout) {
      this.state.checkouts.set(key, checkout);
    } else {
      this.state.checkouts.delete(key);
    }
    this.notifyListeners();
  }

  private updateOperationState(key: CheckoutKey, updates: Partial<CheckoutOperationState>): void {
    const currentState = this.getOperationState(key);
    const newState = { ...currentState, ...updates };
    this.state.operations.set(key, newState);
    this.notifyListeners();
  }

  async startCheckout(
    key: CheckoutKey,
    startFn: () => Promise<CommerceCheckoutResource>,
  ): Promise<CommerceCheckoutResource> {
    const operationId = `${key}-start`;

    // Prevent duplicate operations
    if (this.getOperationState(key).isStarting || this.pendingOperations.has(operationId)) {
      throw new Error('Checkout start already in progress');
    }

    this.pendingOperations.add(operationId);

    try {
      this.updateOperationState(key, { isStarting: true, error: undefined });
      const result = await startFn();
      this.updateOperationState(key, { isStarting: false, error: undefined });
      this.setCheckout(key, result);
      return result;
    } catch (error) {
      const clerkError = error as ClerkAPIResponseError;
      this.updateOperationState(key, { isStarting: false, error: clerkError });
      throw error;
    } finally {
      this.pendingOperations.delete(operationId);
    }
  }

  async confirmCheckout(
    key: CheckoutKey,
    confirmFn: () => Promise<CommerceCheckoutResource>,
  ): Promise<CommerceCheckoutResource> {
    const operationId = `${key}-confirm`;

    // Prevent duplicate operations
    if (this.getOperationState(key).isConfirming || this.pendingOperations.has(operationId)) {
      throw new Error('Checkout confirm already in progress');
    }

    this.pendingOperations.add(operationId);

    try {
      this.updateOperationState(key, { isConfirming: true, error: undefined });
      const result = await confirmFn();
      this.updateOperationState(key, { isConfirming: false, error: undefined });
      this.setCheckout(key, result);
      return result;
    } catch (error) {
      const clerkError = error as ClerkAPIResponseError;
      this.updateOperationState(key, { isConfirming: false, error: clerkError });
      throw error;
    } finally {
      this.pendingOperations.delete(operationId);
    }
  }

  clearCheckout(key: CheckoutKey): void {
    this.setCheckout(key, undefined);
    this.updateOperationState(key, defaultOperationState);
  }
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

  const manager = CheckoutGlobalManager.getInstance();
  const [, forceUpdate] = useState({});

  const checkoutKey = generateCheckoutKey({
    userId: user?.id,
    orgId: forOrganization === 'organization' ? organization?.id : undefined,
    planId,
    planPeriod,
  });

  // Subscribe to global state changes
  useEffect(() => {
    const unsubscribe = manager.subscribe(() => forceUpdate({}));
    return unsubscribe;
  }, [manager]);

  // Get current state from global manager
  const checkout = manager.getCheckout(checkoutKey);
  const operationState = manager.getOperationState(checkoutKey);

  const start = useCallback(async (): Promise<CommerceCheckoutResource> => {
    return manager.startCheckout(checkoutKey, async () => {
      const result = await clerk.billing?.startCheckout({
        ...(forOrganization === 'organization' ? { orgId: organization?.id } : {}),
        planId,
        planPeriod,
      });
      if (!result) {
        throw new Error('Failed to start checkout');
      }
      return result;
    });
  }, [manager, checkoutKey, clerk.billing, forOrganization, organization?.id, planId, planPeriod]);

  const confirm = useCallback(
    async (params: ConfirmCheckoutParams): Promise<CommerceCheckoutResource> => {
      if (!checkout) {
        throw new Error('No checkout to confirm');
      }

      return manager.confirmCheckout(checkoutKey, () => checkout.confirm(params));
    },
    [manager, checkoutKey, checkout],
  );

  const fetchStatus = useMemo(() => {
    if (operationState.isStarting || operationState.isConfirming) return 'fetching';
    if (operationState.error) return 'error';
    return 'idle';
  }, [operationState.isStarting, operationState.isConfirming, operationState.error]);

  const finalize = useCallback(
    ({ redirectUrl }: { redirectUrl?: string }) => {
      void clerk.setActive({ session: session?.id, redirectUrl });
    },
    [clerk, session?.id],
  );

  const clear = useCallback(() => {
    manager.clearCheckout(checkoutKey);
  }, [manager, checkoutKey]);

  const status = useMemo(() => {
    const completedCode = 'completed';
    if (checkout?.status === completedCode) return 'completed';
    if (checkout) {
      return 'awaiting_confirmation';
    }
    return 'awaiting_initialization';
  }, [checkout, checkout?.status]);

  return {
    checkout,
    start,
    isStarting: operationState.isStarting,
    isConfirming: operationState.isConfirming,
    error: operationState.error,
    status,
    fetchStatus,
    confirm,
    clear,
    finalize,
  };
};

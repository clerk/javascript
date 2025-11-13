import type { BillingCheckoutResource, ClerkAPIResponseError } from '@clerk/shared/types';
import type { MockedFunction } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type CheckoutCacheState, type CheckoutKey, createCheckoutManager, FETCH_STATUS } from '../manager';

// Type-safe mock for BillingCheckoutResource
const createMockCheckoutResource = (overrides: Partial<BillingCheckoutResource> = {}): BillingCheckoutResource => ({
  id: 'checkout_123',
  status: 'needs_confirmation',
  externalClientSecret: 'cs_test_123',
  externalGatewayId: 'gateway_123',
  totals: {
    totalDueNow: { amount: 1000, currency: 'USD', currencySymbol: '$', amountFormatted: '10.00' },
    credit: { amount: 0, currency: 'USD', currencySymbol: '$', amountFormatted: '0.00' },
    pastDue: { amount: 0, currency: 'USD', currencySymbol: '$', amountFormatted: '0.00' },
    subtotal: { amount: 1000, currency: 'USD', currencySymbol: '$', amountFormatted: '10.00' },
    grandTotal: { amount: 1000, currency: 'USD', currencySymbol: '$', amountFormatted: '10.00' },
    taxTotal: { amount: 0, currency: 'USD', currencySymbol: '$', amountFormatted: '0.00' },
  },
  isImmediatePlanChange: false,
  planPeriod: 'month',
  freeTrialEndsAt: null,
  needsPaymentMethod: true,
  payer: {
    id: 'payer_123',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    firstName: 'Test Payer',
    lastName: 'Test Payer',
    email: 'test@clerk.com',
    imageUrl: 'https://example.com/avatar.png',
    pathRoot: '',
    reload: vi.fn(),
  },
  plan: {
    id: 'plan_123',
    name: 'Pro Plan',
    description: 'Professional plan',
    features: [],
    fee: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
    annualFee: { amount: 12000, amountFormatted: '120.00', currency: 'USD', currencySymbol: '$' },
    annualMonthlyFee: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
    slug: 'pro-plan',
    isDefault: false,
    isRecurring: true,
    hasBaseFee: false,
    forPayerType: 'user',
    publiclyVisible: true,
    freeTrialDays: 0,
    freeTrialEnabled: false,
    avatarUrl: '',
    pathRoot: '',
    reload: vi.fn(),
  },
  paymentMethod: undefined,
  confirm: vi.fn(),
  reload: vi.fn(),
  pathRoot: '/checkout',
  ...overrides,
});

// Type-safe mock for ClerkAPIResponseError
const createMockError = (message = 'Test error'): ClerkAPIResponseError => {
  const error = new Error(message) as ClerkAPIResponseError;
  error.status = 400;
  error.clerkTraceId = 'trace_123';
  error.clerkError = true;
  return error;
};

// Helper to create a typed cache key
const createCacheKey = (key: string): CheckoutKey => key as CheckoutKey;

describe('createCheckoutManager', () => {
  const testCacheKey = createCacheKey('user-123-plan-456-monthly');
  let manager: ReturnType<typeof createCheckoutManager>;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = createCheckoutManager(testCacheKey);
  });

  describe('getCacheState', () => {
    it('should return default state when cache is empty', () => {
      const state = manager.getCacheState();

      expect(state).toEqual({
        isStarting: false,
        isConfirming: false,
        error: null,
        checkout: null,
        fetchStatus: 'idle',
        status: 'needs_initialization',
      });
    });

    it('should return immutable state object', () => {
      const state = manager.getCacheState();

      // State should be frozen
      expect(Object.isFrozen(state)).toBe(true);
    });
  });

  describe('subscribe', () => {
    it('should add listener and return unsubscribe function', () => {
      const listener: MockedFunction<(state: CheckoutCacheState) => void> = vi.fn();

      const unsubscribe = manager.subscribe(listener);

      expect(typeof unsubscribe).toBe('function');
      expect(listener).not.toHaveBeenCalled();
    });

    it('should remove listener when unsubscribe is called', async () => {
      const listener: MockedFunction<(state: CheckoutCacheState) => void> = vi.fn();

      const unsubscribe = manager.subscribe(listener);

      // Trigger a state change
      const mockCheckout = createMockCheckoutResource();
      const mockOperation = vi.fn().mockResolvedValue(mockCheckout);
      await manager.executeOperation('start', mockOperation);

      expect(listener).toHaveBeenCalled();

      // Clear the mock and unsubscribe
      listener.mockClear();
      unsubscribe();

      // Trigger another state change
      const anotherMockOperation = vi.fn().mockResolvedValue(mockCheckout);
      await manager.executeOperation('confirm', anotherMockOperation);

      // Listener should not be called after unsubscribing
      expect(listener).not.toHaveBeenCalled();
    });

    it('should notify all listeners when state changes', async () => {
      const listener1: MockedFunction<(state: CheckoutCacheState) => void> = vi.fn();
      const listener2: MockedFunction<(state: CheckoutCacheState) => void> = vi.fn();
      const mockCheckout = createMockCheckoutResource();

      manager.subscribe(listener1);
      manager.subscribe(listener2);

      const mockOperation = vi.fn().mockResolvedValue(mockCheckout);
      await manager.executeOperation('start', mockOperation);

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();

      // Verify they were called with the updated state
      const expectedState = expect.objectContaining({
        checkout: mockCheckout,
        isStarting: false,
        error: null,
        fetchStatus: 'idle',
        status: 'needs_confirmation',
      });

      expect(listener1).toHaveBeenCalledWith(expectedState);
      expect(listener2).toHaveBeenCalledWith(expectedState);
    });

    it('should handle multiple subscribe/unsubscribe cycles', () => {
      const listener: MockedFunction<(state: CheckoutCacheState) => void> = vi.fn();

      // Subscribe and unsubscribe multiple times
      const unsubscribe1 = manager.subscribe(listener);
      unsubscribe1();

      const unsubscribe2 = manager.subscribe(listener);
      const unsubscribe3 = manager.subscribe(listener);

      unsubscribe2();
      unsubscribe3();

      // Should not throw errors
      expect(() => unsubscribe1()).not.toThrow();
      expect(() => unsubscribe2()).not.toThrow();
    });
  });

  describe('executeOperation - start operations', () => {
    it('should execute start operation successfully', async () => {
      const mockCheckout = createMockCheckoutResource();
      const mockOperation: MockedFunction<() => Promise<BillingCheckoutResource>> = vi
        .fn()
        .mockResolvedValue(mockCheckout);

      const result = await manager.executeOperation('start', mockOperation);

      expect(mockOperation).toHaveBeenCalledOnce();
      expect(result).toEqual({
        data: mockCheckout,
        error: null,
      });

      const finalState = manager.getCacheState();
      expect(finalState).toEqual(
        expect.objectContaining({
          isStarting: false,
          checkout: mockCheckout,
          error: null,
          fetchStatus: 'idle',
          status: 'needs_confirmation',
        }),
      );
    });

    it('should set isStarting to true during operation', async () => {
      let capturedState: CheckoutCacheState | null = null;
      const mockOperation: MockedFunction<() => Promise<BillingCheckoutResource>> = vi
        .fn()
        .mockImplementation(async () => {
          // Capture state while operation is running
          capturedState = manager.getCacheState();
          return createMockCheckoutResource();
        });

      await manager.executeOperation('start', mockOperation);

      expect(capturedState).toEqual(
        expect.objectContaining({
          isStarting: true,
          fetchStatus: 'fetching',
        }),
      );
    });

    it('should handle operation errors correctly', async () => {
      const mockError = createMockError('Operation failed');
      const mockOperation: MockedFunction<() => Promise<BillingCheckoutResource>> = vi
        .fn()
        .mockRejectedValue(mockError);

      const result = await manager.executeOperation('start', mockOperation);

      expect(result).toEqual({
        data: null,
        error: mockError,
      });

      const finalState = manager.getCacheState();
      expect(finalState).toEqual(
        expect.objectContaining({
          isStarting: false,
          error: mockError,
          fetchStatus: 'error',
          status: 'needs_initialization',
        }),
      );
    });

    it('should clear previous errors when starting new operation', async () => {
      // First, create an error state
      const mockError = createMockError('Previous error');
      const failingOperation: MockedFunction<() => Promise<BillingCheckoutResource>> = vi
        .fn()
        .mockRejectedValue(mockError);

      const result = await manager.executeOperation('start', failingOperation);
      expect(result).toEqual({
        data: null,
        error: mockError,
      });

      const errorState = manager.getCacheState();
      expect(errorState.error).toBe(mockError);

      // Now start a successful operation
      const mockCheckout = createMockCheckoutResource();
      const successfulOperation: MockedFunction<() => Promise<BillingCheckoutResource>> = vi
        .fn()
        .mockResolvedValue(mockCheckout);

      const successResult = await manager.executeOperation('start', successfulOperation);
      expect(successResult).toEqual({
        data: mockCheckout,
        error: null,
      });

      const finalState = manager.getCacheState();
      expect(finalState.error).toBeNull();
      expect(finalState.checkout).toBe(mockCheckout);
    });
  });

  describe('executeOperation - confirm operations', () => {
    it('should execute confirm operation successfully', async () => {
      const mockCheckout = createMockCheckoutResource({ status: 'completed' });
      const mockOperation: MockedFunction<() => Promise<BillingCheckoutResource>> = vi
        .fn()
        .mockResolvedValue(mockCheckout);

      const result = await manager.executeOperation('confirm', mockOperation);

      expect(result).toEqual({
        data: mockCheckout,
        error: null,
      });

      const finalState = manager.getCacheState();
      expect(finalState).toEqual(
        expect.objectContaining({
          isConfirming: false,
          checkout: mockCheckout,
          error: null,
          fetchStatus: 'idle',
          status: 'completed',
        }),
      );
    });

    it('should set isConfirming to true during operation', async () => {
      let capturedState: CheckoutCacheState | null = null;
      const mockOperation: MockedFunction<() => Promise<BillingCheckoutResource>> = vi
        .fn()
        .mockImplementation(async () => {
          capturedState = manager.getCacheState();
          return createMockCheckoutResource();
        });

      await manager.executeOperation('confirm', mockOperation);

      expect(capturedState).toEqual(
        expect.objectContaining({
          isConfirming: true,
          fetchStatus: 'fetching',
        }),
      );
    });

    it('should handle confirm operation errors', async () => {
      const mockError = createMockError('Confirm failed');
      const mockOperation: MockedFunction<() => Promise<BillingCheckoutResource>> = vi
        .fn()
        .mockRejectedValue(mockError);

      const result = await manager.executeOperation('confirm', mockOperation);
      expect(result).toEqual({
        data: null,
        error: mockError,
      });

      const finalState = manager.getCacheState();
      expect(finalState).toEqual(
        expect.objectContaining({
          isConfirming: false,
          error: mockError,
          fetchStatus: 'error',
        }),
      );
    });
  });

  describe('operation deduplication', () => {
    it('should deduplicate concurrent start operations', async () => {
      const mockCheckout = createMockCheckoutResource();
      const mockOperation: MockedFunction<() => Promise<BillingCheckoutResource>> = vi
        .fn()
        .mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockCheckout), 50)));

      // Start multiple operations concurrently
      const [result1, result2, result3] = await Promise.all([
        manager.executeOperation('start', mockOperation),
        manager.executeOperation('start', mockOperation),
        manager.executeOperation('start', mockOperation),
      ]);

      // Operation should only be called once
      expect(mockOperation).toHaveBeenCalledOnce();

      // All results should be the same
      expect(result1).toEqual({
        data: mockCheckout,
        error: null,
      });
      expect(result2).toEqual({
        data: mockCheckout,
        error: null,
      });
      expect(result3).toEqual({
        data: mockCheckout,
        error: null,
      });
    });

    it('should deduplicate concurrent confirm operations', async () => {
      const mockCheckout = createMockCheckoutResource();
      const mockOperation: MockedFunction<() => Promise<BillingCheckoutResource>> = vi
        .fn()
        .mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockCheckout), 50)));

      const [result1, result2] = await Promise.all([
        manager.executeOperation('confirm', mockOperation),
        manager.executeOperation('confirm', mockOperation),
      ]);

      expect(mockOperation).toHaveBeenCalledOnce();
      expect(result1).toBe(result2);
    });

    it('should allow different operation types to run concurrently', async () => {
      const startCheckout = createMockCheckoutResource({ id: 'start_checkout' });
      const confirmCheckout = createMockCheckoutResource({ id: 'confirm_checkout' });

      const startOperation: MockedFunction<() => Promise<BillingCheckoutResource>> = vi
        .fn()
        .mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(startCheckout), 50)));
      const confirmOperation: MockedFunction<() => Promise<BillingCheckoutResource>> = vi
        .fn()
        .mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(confirmCheckout), 50)));

      const [startResult, confirmResult] = await Promise.all([
        manager.executeOperation('start', startOperation),
        manager.executeOperation('confirm', confirmOperation),
      ]);

      expect(startOperation).toHaveBeenCalledOnce();
      expect(confirmOperation).toHaveBeenCalledOnce();
      expect(startResult).toEqual({
        data: startCheckout,
        error: null,
      });
      expect(confirmResult).toEqual({
        data: confirmCheckout,
        error: null,
      });
    });

    it('should propagate errors to all concurrent callers', async () => {
      const mockError = createMockError('Concurrent operation failed');
      const mockOperation: MockedFunction<() => Promise<BillingCheckoutResource>> = vi
        .fn()
        .mockImplementation(() => new Promise((_, reject) => setTimeout(() => reject(mockError), 50)));

      const promises = [
        manager.executeOperation('start', mockOperation),
        manager.executeOperation('start', mockOperation),
        manager.executeOperation('start', mockOperation),
      ];

      const results = await Promise.all(promises);

      // All promises should resolve with the same error
      results.forEach(result => {
        expect(result).toEqual({
          data: null,
          error: mockError,
        });
      });
      expect(mockOperation).toHaveBeenCalledOnce();
    });

    it('should allow sequential operations of the same type', async () => {
      const checkout1 = createMockCheckoutResource({ id: 'checkout1' });
      const checkout2 = createMockCheckoutResource({ id: 'checkout2' });

      const operation1: MockedFunction<() => Promise<BillingCheckoutResource>> = vi.fn().mockResolvedValue(checkout1);
      const operation2: MockedFunction<() => Promise<BillingCheckoutResource>> = vi.fn().mockResolvedValue(checkout2);

      const result1 = await manager.executeOperation('start', operation1);
      const result2 = await manager.executeOperation('start', operation2);

      expect(operation1).toHaveBeenCalledOnce();
      expect(operation2).toHaveBeenCalledOnce();
      expect(result1).toEqual({
        data: checkout1,
        error: null,
      });
      expect(result2).toEqual({
        data: checkout2,
        error: null,
      });
    });
  });

  describe('clearCheckout', () => {
    it('should clear checkout state when no operations are pending', () => {
      const listener: MockedFunction<(state: CheckoutCacheState) => void> = vi.fn();
      manager.subscribe(listener);

      manager.clearCheckout();

      const state = manager.getCacheState();
      expect(state).toEqual({
        isStarting: false,
        isConfirming: false,
        error: null,
        checkout: null,
        fetchStatus: 'idle',
        status: 'needs_initialization',
      });

      // Should notify listeners
      expect(listener).toHaveBeenCalledWith(state);
    });

    it('should not clear checkout state when operations are pending', async () => {
      const mockCheckout = createMockCheckoutResource();
      let resolveOperation: ((value: BillingCheckoutResource) => void) | undefined;

      const mockOperation: MockedFunction<() => Promise<BillingCheckoutResource>> = vi.fn().mockImplementation(
        () =>
          new Promise<BillingCheckoutResource>(resolve => {
            resolveOperation = resolve;
          }),
      );

      // Start an operation but don't resolve it yet
      const operationPromise = manager.executeOperation('start', mockOperation);

      // Verify operation is in progress
      let state = manager.getCacheState();
      expect(state.isStarting).toBe(true);
      expect(state.fetchStatus).toBe('fetching');

      // Try to clear while operation is pending
      manager.clearCheckout();

      // State should not be cleared
      state = manager.getCacheState();
      expect(state.isStarting).toBe(true);
      expect(state.fetchStatus).toBe('fetching');

      // Resolve the operation
      resolveOperation?.(mockCheckout);
      await operationPromise;

      // Now clearing should work
      manager.clearCheckout();
      state = manager.getCacheState();
      expect(state.checkout).toBeNull();
      expect(state.status).toBe('needs_initialization');
    });
  });

  describe('state derivation', () => {
    it('should derive fetchStatus correctly based on operation state', async () => {
      // Initially idle
      expect(manager.getCacheState().fetchStatus).toBe(FETCH_STATUS.IDLE);

      // During operation - fetching
      let capturedState: CheckoutCacheState | null = null;
      const mockOperation: MockedFunction<() => Promise<BillingCheckoutResource>> = vi
        .fn()
        .mockImplementation(async () => {
          capturedState = manager.getCacheState();
          return createMockCheckoutResource();
        });

      await manager.executeOperation('start', mockOperation);
      expect(capturedState?.fetchStatus).toBe(FETCH_STATUS.FETCHING);

      // After successful operation - idle
      expect(manager.getCacheState().fetchStatus).toBe(FETCH_STATUS.IDLE);

      // After error - error
      const mockError = createMockError();
      const failingOperation: MockedFunction<() => Promise<BillingCheckoutResource>> = vi
        .fn()
        .mockRejectedValue(mockError);

      const result = await manager.executeOperation('start', failingOperation);
      expect(result).toEqual({
        data: null,
        error: mockError,
      });
      expect(manager.getCacheState().fetchStatus).toBe(FETCH_STATUS.ERROR);
    });

    it('should derive status based on checkout state', async () => {
      // Initially needs initialization
      expect(manager.getCacheState().status).toBe('needs_initialization');

      // After starting checkout - needs confirmation
      const pendingCheckout = createMockCheckoutResource({ status: 'needs_confirmation' });
      const startOperation: MockedFunction<() => Promise<BillingCheckoutResource>> = vi
        .fn()
        .mockResolvedValue(pendingCheckout);

      await manager.executeOperation('start', startOperation);
      expect(manager.getCacheState().status).toBe('needs_confirmation');

      // After completing checkout - completed
      const completedCheckout = createMockCheckoutResource({ status: 'completed' });
      const confirmOperation: MockedFunction<() => Promise<BillingCheckoutResource>> = vi
        .fn()
        .mockResolvedValue(completedCheckout);

      await manager.executeOperation('confirm', confirmOperation);
      expect(manager.getCacheState().status).toBe('completed');
    });

    it('should handle both operations running simultaneously', async () => {
      let startCapturedState: CheckoutCacheState | null = null;
      let confirmCapturedState: CheckoutCacheState | null = null;

      const startOperation: MockedFunction<() => Promise<BillingCheckoutResource>> = vi
        .fn()
        .mockImplementation(async () => {
          await new Promise(resolve => setTimeout(resolve, 30));
          startCapturedState = manager.getCacheState();
          return createMockCheckoutResource({ id: 'start' });
        });

      const confirmOperation: MockedFunction<() => Promise<BillingCheckoutResource>> = vi
        .fn()
        .mockImplementation(async () => {
          await new Promise(resolve => setTimeout(resolve, 20));
          confirmCapturedState = manager.getCacheState();
          return createMockCheckoutResource({ id: 'confirm' });
        });

      await Promise.all([
        manager.executeOperation('start', startOperation),
        manager.executeOperation('confirm', confirmOperation),
      ]);

      // Both should have seen fetching status
      expect(startCapturedState?.fetchStatus).toBe(FETCH_STATUS.FETCHING);
      expect(confirmCapturedState?.fetchStatus).toBe(FETCH_STATUS.FETCHING);

      // At least one should have seen both operations running
      expect(
        (startCapturedState?.isStarting && startCapturedState?.isConfirming) ||
          (confirmCapturedState?.isStarting && confirmCapturedState?.isConfirming),
      ).toBe(true);
    });
  });

  describe('cache isolation', () => {
    it('should isolate state between different cache keys', async () => {
      const manager1 = createCheckoutManager(createCacheKey('key1'));
      const manager2 = createCheckoutManager(createCacheKey('key2'));

      const checkout1 = createMockCheckoutResource({ id: 'checkout1' });
      const checkout2 = createMockCheckoutResource({ id: 'checkout2' });

      const operation1: MockedFunction<() => Promise<BillingCheckoutResource>> = vi.fn().mockResolvedValue(checkout1);
      const operation2: MockedFunction<() => Promise<BillingCheckoutResource>> = vi.fn().mockResolvedValue(checkout2);

      await manager1.executeOperation('start', operation1);
      await manager2.executeOperation('confirm', operation2);

      const state1 = manager1.getCacheState();
      const state2 = manager2.getCacheState();

      expect(state1.checkout?.id).toBe('checkout1');
      expect(state1.status).toBe('needs_confirmation');

      expect(state2.checkout?.id).toBe('checkout2');
      expect(state2.isStarting).toBe(false);
      expect(state2.isConfirming).toBe(false);
    });

    it('should isolate listeners between different cache keys', async () => {
      const manager1 = createCheckoutManager(createCacheKey('key1'));
      const manager2 = createCheckoutManager(createCacheKey('key2'));

      const listener1: MockedFunction<(state: CheckoutCacheState) => void> = vi.fn();
      const listener2: MockedFunction<(state: CheckoutCacheState) => void> = vi.fn();

      manager1.subscribe(listener1);
      manager2.subscribe(listener2);

      // Trigger operation on manager1
      const mockOperation: MockedFunction<() => Promise<BillingCheckoutResource>> = vi
        .fn()
        .mockResolvedValue(createMockCheckoutResource());
      await manager1.executeOperation('start', mockOperation);

      // Only listener1 should be called
      expect(listener1).toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });

    it('should isolate pending operations between different cache keys', async () => {
      const manager1 = createCheckoutManager(createCacheKey('key1'));
      const manager2 = createCheckoutManager(createCacheKey('key2'));

      const checkout1 = createMockCheckoutResource({ id: 'checkout1' });
      const checkout2 = createMockCheckoutResource({ id: 'checkout2' });

      const operation1: MockedFunction<() => Promise<BillingCheckoutResource>> = vi
        .fn()
        .mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(checkout1), 50)));
      const operation2: MockedFunction<() => Promise<BillingCheckoutResource>> = vi
        .fn()
        .mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(checkout2), 50)));

      // Start concurrent operations on both managers
      const [result1, result2] = await Promise.all([
        manager1.executeOperation('start', operation1),
        manager2.executeOperation('start', operation2),
      ]);

      // Both operations should execute (not deduplicated across managers)
      expect(operation1).toHaveBeenCalledOnce();
      expect(operation2).toHaveBeenCalledOnce();
      expect(result1).toEqual({
        data: checkout1,
        error: null,
      });
      expect(result2).toEqual({
        data: checkout2,
        error: null,
      });
    });
  });
});

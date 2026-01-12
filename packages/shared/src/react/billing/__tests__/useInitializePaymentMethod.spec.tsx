import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { __internal_useInitializePaymentMethod as useInitializePaymentMethod } from '../useInitializePaymentMethod';
import {
  createMockClerk,
  createMockOrganization,
  createMockQueryClient,
  createMockUser,
} from '../../hooks/__tests__/mocks/clerk';
import { wrapper } from '../../hooks/__tests__/wrapper';

// Dynamic mock state for contexts
let mockUser: any = createMockUser();
let mockOrganization: any = createMockOrganization();
let userBillingEnabled = true;
let orgBillingEnabled = true;

const initializePaymentMethodSpy = vi.fn(() =>
  Promise.resolve({ externalClientSecret: 'secret_123', gateway: 'stripe' }),
);

const defaultQueryClient = createMockQueryClient();

const mockClerk = createMockClerk({
  environment: {
    commerceSettings: {
      billing: {
        user: { enabled: userBillingEnabled },
        organization: { enabled: orgBillingEnabled },
      },
    },
  },
  queryClient: defaultQueryClient,
});

vi.mock('../../contexts', () => {
  return {
    useAssertWrappedByClerkProvider: () => {},
    useClerkInstanceContext: () => mockClerk,
    useUserContext: () => (mockClerk.loaded ? mockUser : null),
    useOrganizationContext: () => ({ organization: mockClerk.loaded ? mockOrganization : null }),
  };
});

describe('useInitializePaymentMethod', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment flags and state
    userBillingEnabled = true;
    orgBillingEnabled = true;
    mockUser = createMockUser();
    mockUser.initializePaymentMethod = initializePaymentMethodSpy;
    mockOrganization = createMockOrganization();
    mockOrganization.initializePaymentMethod = initializePaymentMethodSpy;
    mockClerk.__internal_environment.commerceSettings.billing.user.enabled = userBillingEnabled;
    mockClerk.__internal_environment.commerceSettings.billing.organization.enabled = orgBillingEnabled;
    defaultQueryClient.client.clear();
  });

  it('returns the expected shape', () => {
    const { result } = renderHook(() => useInitializePaymentMethod(), { wrapper });

    expect(result.current).toHaveProperty('initializedPaymentMethod');
    expect(result.current).toHaveProperty('initializePaymentMethod');
    expect(result.current.initializePaymentMethod).toBeInstanceOf(Function);
  });

  it('does not fetch when billing disabled for user', () => {
    mockClerk.__internal_environment.commerceSettings.billing.user.enabled = false;

    const { result } = renderHook(() => useInitializePaymentMethod(), { wrapper });

    expect(initializePaymentMethodSpy).not.toHaveBeenCalled();
    expect(result.current.initializedPaymentMethod).toBeUndefined();
  });

  it('fetches user payment method initialization when billing enabled', async () => {
    const { result } = renderHook(() => useInitializePaymentMethod(), { wrapper });

    await waitFor(() => expect(result.current.initializedPaymentMethod).toBeDefined());

    expect(initializePaymentMethodSpy).toHaveBeenCalledTimes(1);
    expect(initializePaymentMethodSpy).toHaveBeenCalledWith({ gateway: 'stripe' });
    expect(result.current.initializedPaymentMethod).toEqual({
      externalClientSecret: 'secret_123',
      gateway: 'stripe',
    });
  });

  it('fetches organization payment method initialization when for=organization', async () => {
    const { result } = renderHook(() => useInitializePaymentMethod({ for: 'organization' }), { wrapper });

    await waitFor(() => expect(result.current.initializedPaymentMethod).toBeDefined());

    expect(initializePaymentMethodSpy).toHaveBeenCalledTimes(1);
    expect(initializePaymentMethodSpy).toHaveBeenCalledWith({ gateway: 'stripe' });
    expect(result.current.initializedPaymentMethod).toEqual({
      externalClientSecret: 'secret_123',
      gateway: 'stripe',
    });
  });

  it('clears cached data on sign-out', async () => {
    const { result, rerender } = renderHook(() => useInitializePaymentMethod(), { wrapper });

    await waitFor(() => expect(result.current.initializedPaymentMethod).toBeDefined());
    expect(result.current.initializedPaymentMethod).toEqual({
      externalClientSecret: 'secret_123',
      gateway: 'stripe',
    });
    expect(initializePaymentMethodSpy).toHaveBeenCalledTimes(1);

    // Simulate sign-out
    mockUser = null;
    rerender();

    await waitFor(() => expect(result.current.initializedPaymentMethod).toBeUndefined());

    // Should not have fetched again
    expect(initializePaymentMethodSpy).toHaveBeenCalledTimes(1);
  });

  it('initializePaymentMethod function fetches and updates cache', async () => {
    const { result } = renderHook(() => useInitializePaymentMethod(), { wrapper });

    await waitFor(() => expect(result.current.initializedPaymentMethod).toBeDefined());

    // Reset spy to track new calls
    initializePaymentMethodSpy.mockClear();
    initializePaymentMethodSpy.mockResolvedValueOnce({
      externalClientSecret: 'secret_456',
      gateway: 'stripe',
    });

    let returnedResult: any;
    await act(async () => {
      returnedResult = await result.current.initializePaymentMethod();
    });

    expect(initializePaymentMethodSpy).toHaveBeenCalledTimes(1);
    expect(initializePaymentMethodSpy).toHaveBeenCalledWith({ gateway: 'stripe' });
    expect(returnedResult).toEqual({
      externalClientSecret: 'secret_456',
      gateway: 'stripe',
    });
  });

  it('uses correct query key format for cache clearing', async () => {
    const { result, rerender } = renderHook(() => useInitializePaymentMethod(), { wrapper });

    await waitFor(() => expect(result.current.initializedPaymentMethod).toBeDefined());

    // Verify cache has the data
    const cacheData = defaultQueryClient.client.getQueryData([
      'billing-payment-method-initialize',
      true,
      { resourceId: 'user_1' },
      {},
    ]);
    expect(cacheData).toEqual({
      externalClientSecret: 'secret_123',
      gateway: 'stripe',
    });

    // Simulate sign-out
    mockUser = null;
    rerender();

    await waitFor(() => expect(result.current.initializedPaymentMethod).toBeUndefined());

    // Verify cache was cleared
    const clearedCacheData = defaultQueryClient.client.getQueryData([
      'billing-payment-method-initialize',
      true,
      { resourceId: 'user_1' },
      {},
    ]);
    expect(clearedCacheData).toBeUndefined();
  });
});

import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createDeferredPromise } from '../../../utils/createDeferredPromise';
import { useSubscription } from '../useSubscription';
import { createMockClerk, createMockOrganization, createMockQueryClient, createMockUser } from './mocks/clerk';
import { wrapper } from './wrapper';

// Dynamic mock state for contexts
let mockUser: any = createMockUser();
let mockOrganization: any = createMockOrganization();
let userBillingEnabled = true;
let orgBillingEnabled = true;

// Prepare mock clerk with billing.getSubscription behavior
const getSubscriptionSpy = vi.fn((args?: { orgId?: string }) =>
  Promise.resolve({ id: args?.orgId ? `sub_org_${args.orgId}` : 'sub_user_user_1' }),
);

const defaultQueryClient = createMockQueryClient();

const mockClerk = createMockClerk({
  billing: {
    getSubscription: getSubscriptionSpy,
  },
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

describe('useSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment flags and state
    userBillingEnabled = true;
    orgBillingEnabled = true;
    mockUser = createMockUser();
    mockOrganization = createMockOrganization();
    mockClerk.__unstable__environment.commerceSettings.billing.user.enabled = userBillingEnabled;
    mockClerk.__unstable__environment.commerceSettings.billing.organization.enabled = orgBillingEnabled;
    defaultQueryClient.client.clear();
    mockClerk.user = mockUser;
    mockClerk.organization = mockOrganization;
    mockClerk.__unsafe__emitResources({ user: mockUser, organization: mockOrganization });
  });

  it('does not fetch when billing disabled for user', () => {
    mockClerk.__unstable__environment.commerceSettings.billing.user.enabled = false;

    const { result } = renderHook(() => useSubscription(), { wrapper });

    expect(getSubscriptionSpy).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
    expect(result.current.revalidate).toBeInstanceOf(Function);
  });

  it('fetches user subscription when billing enabled (no org)', async () => {
    const { result } = renderHook(() => useSubscription(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getSubscriptionSpy).toHaveBeenCalledTimes(1);
    expect(getSubscriptionSpy).toHaveBeenCalledWith({});
    expect(result.current.data).toEqual({ id: 'sub_user_user_1' });
  });

  it('fetches organization subscription when for=organization', async () => {
    const { result } = renderHook(() => useSubscription({ for: 'organization' }), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getSubscriptionSpy).toHaveBeenCalledTimes(1);
    expect(getSubscriptionSpy).toHaveBeenCalledWith({ orgId: 'org_1' });
    expect(result.current.data).toEqual({ id: 'sub_org_org_1' });
    expect(result.current.error).toBeUndefined();
  });

  it('hides stale data on sign-out', async () => {
    const { result, rerender } = renderHook(() => useSubscription({ for: 'organization' }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(true));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual({ id: 'sub_org_org_1' });
    expect(getSubscriptionSpy).toHaveBeenCalledTimes(1);

    // Simulate sign-out
    mockUser = null;
    mockClerk.user = mockUser;
    act(() => {
      mockClerk.__unsafe__emitResources({ user: null });
    });
    rerender();

    if (__CLERK_USE_RQ__) {
      await waitFor(() => expect(result.current.data).toBeUndefined());
    } else {
      // Assert that SWR will flip to fetching because the fetcherFN runs, but it forces `null` when userId is falsy.
      await waitFor(() => expect(result.current.isFetching).toBe(true));
      // The fetcher returns null when userId is falsy, so data should become null
      await waitFor(() => expect(result.current.data).toBeNull());
    }

    expect(getSubscriptionSpy).toHaveBeenCalledTimes(1);
    expect(result.current.isFetching).toBe(false);
  });

  it('hides stale data on sign-out even with keepPreviousData=true', async () => {
    const { result, rerender } = renderHook(({ kp }) => useSubscription({ keepPreviousData: kp }), {
      wrapper,
      initialProps: { kp: true },
    });

    await waitFor(() => expect(result.current.isLoading).toBe(true));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual({ id: 'sub_user_user_1' });
    expect(getSubscriptionSpy).toHaveBeenCalledTimes(1);

    // Simulate sign-out
    mockUser = null;
    mockClerk.user = mockUser;
    act(() => {
      mockClerk.__unsafe__emitResources({ user: null });
    });
    rerender({ kp: true });

    if (__CLERK_USE_RQ__) {
      await waitFor(() => expect(result.current.data).toBeUndefined());
    } else {
      // Assert that SWR will flip to fetching because the fetcherFN runs, but it forces `null` when userId is falsy.
      await waitFor(() => expect(result.current.isFetching).toBe(true));

      // The fetcher returns null when userId is falsy, so data should become null
      await waitFor(() => expect(result.current.data).toBeNull());
    }

    expect(getSubscriptionSpy).toHaveBeenCalledTimes(1);
    expect(result.current.isFetching).toBe(false);
  });

  it('retains previous data while refetching when keepPreviousData=true', async () => {
    const { result, rerender } = renderHook(
      ({ orgId, keepPreviousData }) => {
        mockOrganization = createMockOrganization({ id: orgId });
        return useSubscription({ for: 'organization', keepPreviousData });
      },
      {
        wrapper,
        initialProps: { orgId: 'org_1', keepPreviousData: true },
      },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual({ id: 'sub_org_org_1' });

    const deferred = createDeferredPromise();
    getSubscriptionSpy.mockImplementationOnce(() => deferred.promise as Promise<{ id: string }>);

    rerender({ orgId: 'org_2', keepPreviousData: true });

    await waitFor(() => expect(result.current.isFetching).toBe(true));

    // Slight difference in behavior between SWR and React Query, but acceptable for the migration.
    if (__CLERK_USE_RQ__) {
      await waitFor(() => expect(result.current.isLoading).toBe(false));
    } else {
      await waitFor(() => expect(result.current.isLoading).toBe(true));
    }
    expect(result.current.data).toEqual({ id: 'sub_org_org_1' });

    deferred.resolve({ id: 'sub_org_org_2' });

    await waitFor(() => expect(result.current.data).toEqual({ id: 'sub_org_org_2' }));
    expect(getSubscriptionSpy).toHaveBeenCalledTimes(2);
  });

  it('clears data while refetching when keepPreviousData=false', async () => {
    const { result, rerender } = renderHook(
      ({ orgId, keepPreviousData }) => {
        mockOrganization = createMockOrganization({ id: orgId });
        return useSubscription({ for: 'organization', keepPreviousData });
      },
      {
        wrapper,
        initialProps: { orgId: 'org_1', keepPreviousData: false },
      },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual({ id: 'sub_org_org_1' });

    const deferred = createDeferredPromise();
    getSubscriptionSpy.mockImplementationOnce(() => deferred.promise as Promise<{ id: string }>);

    rerender({ orgId: 'org_2', keepPreviousData: false });

    await waitFor(() => expect(result.current.isFetching).toBe(true));
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    deferred.resolve({ id: 'sub_org_org_2' });

    await waitFor(() => expect(result.current.isFetching).toBe(false));
    expect(result.current.data).toEqual({ id: 'sub_org_org_2' });
    expect(result.current.isLoading).toBe(false);
    expect(getSubscriptionSpy).toHaveBeenCalledTimes(2);
  });
});

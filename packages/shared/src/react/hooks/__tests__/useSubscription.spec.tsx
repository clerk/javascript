import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSubscription } from '../useSubscription';
import { wrapper } from './wrapper';

// Dynamic mock state for contexts
let mockUser: any = { id: 'user_1' };
let mockOrganization: any = { id: 'org_1' };
let userBillingEnabled = true;
let orgBillingEnabled = true;

// Prepare mock clerk with billing.getSubscription behavior
const getSubscriptionSpy = vi.fn((args?: { orgId?: string }) =>
  Promise.resolve({ id: args?.orgId ? `sub_org_${args.orgId}` : 'sub_user_user_1' }),
);

const mockClerk = {
  loaded: true,
  billing: {
    getSubscription: getSubscriptionSpy,
  },
  telemetry: { record: vi.fn() },
  __unstable__environment: {
    commerceSettings: {
      billing: {
        user: { enabled: userBillingEnabled },
        organization: { enabled: orgBillingEnabled },
      },
    },
  },
};

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
    mockUser = { id: 'user_1' };
    mockOrganization = { id: 'org_1' };
    mockClerk.__unstable__environment.commerceSettings.billing.user.enabled = userBillingEnabled;
    mockClerk.__unstable__environment.commerceSettings.billing.organization.enabled = orgBillingEnabled;
  });

  it('does not fetch when billing disabled for user', () => {
    mockClerk.__unstable__environment.commerceSettings.billing.user.enabled = false;

    const { result } = renderHook(() => useSubscription(), { wrapper });

    expect(getSubscriptionSpy).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toBeUndefined();
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
    rerender();

    // Asser that SWR will flip to fetching because the fetcherFN runs, but it forces `null` when userId is falsy.
    await waitFor(() => expect(result.current.isFetching).toBe(true));

    // The fetcher returns null when userId is falsy, so data should become null
    await waitFor(() => expect(result.current.data).toBeNull());
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
    rerender({ kp: true });

    // Asser that SWR will flip to fetching because the fetcherFN runs, but it forces `null` when userId is falsy.
    await waitFor(() => expect(result.current.isFetching).toBe(true));

    // The fetcher returns null when userId is falsy, so data should become null
    await waitFor(() => expect(result.current.data).toBeNull());
    expect(getSubscriptionSpy).toHaveBeenCalledTimes(1);
    expect(result.current.isFetching).toBe(false);
  });
});

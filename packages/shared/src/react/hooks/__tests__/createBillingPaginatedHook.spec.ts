import type { ClerkResource } from '@clerk/types';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createBillingPaginatedHook } from '../createBillingPaginatedHook';

// Mocks for contexts
let mockUser: any = { id: 'user_1' };
let mockOrganization: any = { id: 'org_1' };

const mockClerk = {
  loaded: true,
  __unstable__environment: {
    commerceSettings: {
      billing: {
        user: { enabled: true },
        organization: { enabled: true },
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

type DummyResource = { id: string } & ClerkResource;
type DummyParams = { initialPage?: number; pageSize?: number } & { orgId?: string };

const useFetcherMock = vi.fn(() => {
  return vi.fn();
});

const useDummyAuth = createBillingPaginatedHook<DummyResource, DummyParams>({
  hookName: 'useDummyAuth',
  resourceType: 'dummy',
  useFetcher: useFetcherMock,
});

const useDummyUnauth = createBillingPaginatedHook<DummyResource, DummyParams>({
  hookName: 'useDummyUnauth',
  resourceType: 'dummy',
  useFetcher: useFetcherMock,
  options: { unauthenticated: true },
});

describe('createBillingPaginatedHook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClerk.loaded = true;
    mockClerk.__unstable__environment.commerceSettings.billing.user.enabled = true;
    mockClerk.__unstable__environment.commerceSettings.billing.organization.enabled = true;
    mockUser = { id: 'user_1' };
    mockOrganization = { id: 'org_1' };
  });

  it('fetches with default params when called with no params', async () => {
    const { result } = renderHook(() => useDummyAuth());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(useFetcherMock).toHaveBeenCalledWith('user');

    const fetcher = useFetcherMock.mock.results[0].value;
    expect(fetcher).toHaveBeenCalled();
    expect(fetcher.mock.calls[0][0]).toStrictEqual({ initialPage: 1, pageSize: 10 });
  });

  it('does not fetch when clerk.loaded is false', () => {
    mockClerk.loaded = false;

    const { result } = renderHook(() => useDummyAuth({ initialPage: 1, pageSize: 5 }));

    // useFetcher is invoked eagerly, but the returned function should not be called
    expect(useFetcherMock).toHaveBeenCalledWith('user');

    const fetcher = useFetcherMock.mock.results[0].value;
    expect(fetcher).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual([]);
  });

  it('does not fetch when billing disabled (user)', () => {
    mockClerk.__unstable__environment.commerceSettings.billing.user.enabled = false;

    const { result } = renderHook(() => useDummyAuth({ initialPage: 1, pageSize: 5 }));

    expect(useFetcherMock).toHaveBeenCalledWith('user');

    const fetcher = useFetcherMock.mock.results[0].value;
    expect(fetcher).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('authenticated hook: does not fetch when user is null', () => {
    mockUser = null;

    const { result } = renderHook(() => useDummyAuth({ initialPage: 1, pageSize: 5 }));

    expect(useFetcherMock).toHaveBeenCalledWith('user');

    const fetcher = useFetcherMock.mock.results[0].value;
    expect(fetcher).not.toHaveBeenCalled();
    expect(result.current.data).toEqual([]);
  });

  it('unauthenticated hook: fetches even when user is null', async () => {
    mockUser = null;

    const { result } = renderHook(() => useDummyUnauth({ initialPage: 1, pageSize: 4 }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(useFetcherMock).toHaveBeenCalledWith('user');

    const fetcher = useFetcherMock.mock.results[0].value;
    expect(fetcher).toHaveBeenCalled();
    expect(useFetcherMock.mock.results[0].value.mock.calls[0][0]).toStrictEqual({ initialPage: 1, pageSize: 4 });
  });

  it('unauthenticated hook: does not fetch when billing disabled for both user and organization', () => {
    mockUser = null;
    mockClerk.__unstable__environment.commerceSettings.billing.user.enabled = false;
    mockClerk.__unstable__environment.commerceSettings.billing.organization.enabled = false;

    const { result } = renderHook(() => useDummyUnauth({ initialPage: 1, pageSize: 4 }));

    expect(useFetcherMock).toHaveBeenCalledWith('user');
    expect(useFetcherMock.mock.results[0].value).not.toHaveBeenCalled();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual([]);
  });

  it('allows fetching for user when organization billing disabled', async () => {
    mockClerk.__unstable__environment.commerceSettings.billing.organization.enabled = false;
    mockClerk.__unstable__environment.commerceSettings.billing.user.enabled = true;

    const { result } = renderHook(() => useDummyAuth({ initialPage: 1, pageSize: 5 }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(useFetcherMock).toHaveBeenCalledWith('user');
    const fetcher = useFetcherMock.mock.results[0].value;
    expect(fetcher.mock.calls[0][0]).toStrictEqual({ initialPage: 1, pageSize: 5 });
  });

  it('when for=organization orgId should be forwarded to fetcher', async () => {
    const { result } = renderHook(() => useDummyAuth({ initialPage: 1, pageSize: 7, for: 'organization' } as any));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(useFetcherMock).toHaveBeenCalledWith('organization');
    const fetcher = useFetcherMock.mock.results[0].value;
    expect(fetcher.mock.calls[0][0]).toStrictEqual({
      initialPage: 1,
      pageSize: 7,
      orgId: 'org_1',
    });
  });

  it('does not fetch in organization mode when organization billing disabled', () => {
    mockClerk.__unstable__environment.commerceSettings.billing.organization.enabled = false;

    const { result } = renderHook(() => useDummyAuth({ initialPage: 1, pageSize: 5, for: 'organization' } as any));

    expect(useFetcherMock).toHaveBeenCalledWith('organization');
    const fetcher = useFetcherMock.mock.results[0].value;
    expect(fetcher).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('unauthenticated hook: does not fetch in organization mode when organization billing disabled', () => {
    mockClerk.__unstable__environment.commerceSettings.billing.organization.enabled = false;

    const { result } = renderHook(() => useDummyUnauth({ initialPage: 1, pageSize: 5, for: 'organization' } as any));

    expect(useFetcherMock).toHaveBeenCalledWith('organization');
    const fetcher = useFetcherMock.mock.results[0].value;
    expect(fetcher).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });
});

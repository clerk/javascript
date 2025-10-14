import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUser: any = { id: 'user_1' };
const mockOrganization: any = { id: 'org_1' };

const getPlansSpy = vi.fn((args: any) =>
  Promise.resolve({
    // pageSize maps to limit; default to 10 if missing
    data: Array.from({ length: args.limit ?? args.pageSize ?? 10 }, (_, i) => ({ id: `plan_${i + 1}` })),
    total_count: 25,
  }),
);

const mockClerk = {
  loaded: true,
  billing: {
    getPlans: getPlansSpy,
  },
  telemetry: { record: vi.fn() },
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

import { usePlans } from '../usePlans';

describe('usePlans', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClerk.loaded = true;
    mockClerk.__unstable__environment.commerceSettings.billing.user.enabled = true;
    mockClerk.__unstable__environment.commerceSettings.billing.organization.enabled = true;
  });

  it('does not call fetcher when clerk.loaded is false', () => {
    mockClerk.loaded = false;
    const { result } = renderHook(() => usePlans({ initialPage: 1, pageSize: 5 }));

    expect(getPlansSpy).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it('fetches plans for user when loaded', async () => {
    const { result } = renderHook(() => usePlans({ initialPage: 1, pageSize: 5 }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getPlansSpy).toHaveBeenCalledTimes(1);
    // ensure correct args passed: for: 'user' and limit/page (rest)
    expect(getPlansSpy.mock.calls[0][0]).toMatchObject({ for: 'user' });
    expect(getPlansSpy.mock.calls[0][0].orgId).toBeUndefined();
    expect(result.current.data.length).toBe(5);
    expect(result.current.count).toBe(25);
  });

  it('fetches plans for organization when for=organization', async () => {
    const { result } = renderHook(() => usePlans({ initialPage: 1, pageSize: 5, for: 'organization' } as any));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getPlansSpy).toHaveBeenCalledTimes(1);
    expect(getPlansSpy.mock.calls[0][0]).toMatchObject({ for: 'organization' });
    // orgId must not leak to fetcher
    expect(getPlansSpy.mock.calls[0][0].orgId).toBeUndefined();
    expect(result.current.data.length).toBe(5);
  });

  it('fetches plans without a user (unauthenticated allowed)', async () => {
    // simulate no user
    mockUser.id = undefined;

    const { result } = renderHook(() => usePlans({ initialPage: 1, pageSize: 4 }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getPlansSpy).toHaveBeenCalledTimes(1);
    expect(getPlansSpy.mock.calls[0][0]).toStrictEqual({ for: 'user', pageSize: 4, initialPage: 1 });
    expect(getPlansSpy.mock.calls[0][0].orgId).toBeUndefined();
    expect(result.current.data.length).toBe(4);
  });

  it('fetches organization plans even when organization id is missing', async () => {
    // simulate no organization id
    mockOrganization.id = undefined;

    const { result } = renderHook(() => usePlans({ initialPage: 1, pageSize: 3, for: 'organization' } as any));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getPlansSpy).toHaveBeenCalledTimes(1);
    expect(getPlansSpy.mock.calls[0][0]).toStrictEqual({ for: 'organization', pageSize: 3, initialPage: 1 });
    // orgId should not leak to fetcher
    expect(getPlansSpy.mock.calls[0][0].orgId).toBeUndefined();
    expect(result.current.data.length).toBe(3);
  });
});

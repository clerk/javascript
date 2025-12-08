import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { BillingPlanResource } from '@/types/billing';

import { usePlans } from '../usePlans';
import { createMockClerk, createMockOrganization, createMockQueryClient, createMockUser } from './mocks/clerk';
import { wrapper } from './wrapper';

const mockUser: any = createMockUser();
const mockOrganization: any = createMockOrganization();

const getPlansSpy = vi.fn((args: any) =>
  Promise.resolve({
    // pageSize maps to limit; default to 10 if missing
    data: Array.from<Partial<BillingPlanResource>, Partial<BillingPlanResource>>(
      { length: args.limit ?? args.pageSize ?? 10 },
      (_, i) => ({ id: `plan_${i + 1}`, forPayerType: args.for }),
    ),
    total_count: 25,
  }),
);

const defaultQueryClient = createMockQueryClient();

const mockClerk = createMockClerk({
  billing: {
    getPlans: getPlansSpy,
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

describe('usePlans', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClerk.loaded = true;
    mockClerk.__internal_environment.commerceSettings.billing.user.enabled = true;
    mockClerk.__internal_environment.commerceSettings.billing.organization.enabled = true;
    defaultQueryClient.client.clear();
  });

  it('does not call fetcher when clerk.loaded is false', () => {
    mockClerk.loaded = false;
    const { result } = renderHook(() => usePlans({ initialPage: 1, pageSize: 5 }), { wrapper });

    expect(getPlansSpy).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it('fetches plans for user when loaded', async () => {
    const { result } = renderHook(() => usePlans({ initialPage: 1, pageSize: 5 }), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getPlansSpy).toHaveBeenCalledTimes(1);
    // ensure correct args passed: for: 'user' and limit/page (rest)
    expect(getPlansSpy.mock.calls[0][0]).toStrictEqual({ for: 'user', initialPage: 1, pageSize: 5 });
    expect(result.current.data.length).toBe(5);
    expect(result.current.count).toBe(25);
  });

  it('fetches plans for organization when for=organization', async () => {
    const { result } = renderHook(() => usePlans({ initialPage: 1, pageSize: 5, for: 'organization' } as any), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getPlansSpy).toHaveBeenCalledTimes(1);
    // orgId must not leak to fetcher
    expect(getPlansSpy.mock.calls[0][0]).toStrictEqual({ for: 'organization', initialPage: 1, pageSize: 5 });
    expect(result.current.data.length).toBe(5);
  });

  it('fetches plans without a user (unauthenticated allowed)', async () => {
    // simulate no user
    mockUser.id = undefined;

    const { result } = renderHook(() => usePlans({ initialPage: 1, pageSize: 4 }), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(true));

    expect(getPlansSpy).toHaveBeenCalledTimes(1);
    expect(getPlansSpy.mock.calls[0][0]).toStrictEqual({ for: 'user', pageSize: 4, initialPage: 1 });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data.length).toBe(4);
  });

  it('fetches organization plans even when organization id is missing', async () => {
    // simulate no organization id
    mockOrganization.id = undefined;

    const { result } = renderHook(() => usePlans({ initialPage: 1, pageSize: 3, for: 'organization' } as any), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(true));

    expect(getPlansSpy).toHaveBeenCalledTimes(1);
    // orgId must not leak to fetcher
    expect(getPlansSpy.mock.calls[0][0]).toStrictEqual({ for: 'organization', pageSize: 3, initialPage: 1 });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data.length).toBe(3);
  });

  it('mounts user and organization hooks together and renders their respective data', async () => {
    const DualPlans = () => {
      const userPlans = usePlans({ initialPage: 1, pageSize: 2 });
      const orgPlans = usePlans({ initialPage: 1, pageSize: 2, for: 'organization' } as any);

      return (
        <>
          <div data-testid='user-count'>{userPlans.data.length}</div>
          <div data-testid='org-count'>{orgPlans.data.length}</div>
        </>
      );
    };

    render(<DualPlans />, { wrapper });

    await waitFor(() => expect(screen.getByTestId('user-count').textContent).toBe('2'));
    await waitFor(() => expect(screen.getByTestId('org-count').textContent).toBe('2'));

    expect(getPlansSpy).toHaveBeenCalledTimes(2);
    const calls = getPlansSpy.mock.calls.map(c => c[0]);
    expect(calls).toEqual(
      expect.arrayContaining([
        { for: 'user', initialPage: 1, pageSize: 2 },
        { for: 'organization', initialPage: 1, pageSize: 2 },
      ]),
    );

    // Ensure orgId does not leak into the fetcher params
    for (const call of calls) {
      expect(call).not.toHaveProperty('orgId');
    }
  });

  it('conditionally renders hooks based on prop passed to render', async () => {
    const UserPlansCount = () => {
      const userPlans = usePlans({ initialPage: 1, pageSize: 2 });
      return <div data-testid='user-type'>{userPlans.data.map(p => p.forPayerType)[0]}</div>;
    };

    const OrgPlansCount = () => {
      const orgPlans = usePlans({ initialPage: 1, pageSize: 2, for: 'organization' } as any);
      return <div data-testid='org-type'>{orgPlans.data.map(p => p.forPayerType)[0]}</div>;
    };

    const Conditional = ({ showOrg }: { showOrg: boolean }) => (showOrg ? <OrgPlansCount /> : <UserPlansCount />);

    const { rerender } = render(<Conditional showOrg={false} />, { wrapper });

    await waitFor(() => expect(screen.getByTestId('user-type').textContent).toBe('user'));
    expect(getPlansSpy).toHaveBeenCalledTimes(1);
    expect(getPlansSpy.mock.calls[0][0]).toStrictEqual({ for: 'user', initialPage: 1, pageSize: 2 });

    rerender(<Conditional showOrg />);

    await waitFor(() => expect(screen.getByTestId('org-type').textContent).toBe('organization'));
    expect(getPlansSpy).toHaveBeenCalledTimes(2);
    const calls = getPlansSpy.mock.calls.map(c => c[0]);
    expect(calls).toEqual(
      expect.arrayContaining([
        { for: 'user', initialPage: 1, pageSize: 2 },
        { for: 'organization', initialPage: 1, pageSize: 2 },
      ]),
    );
  });

  it('does not clear data after user sign out', async () => {
    const { result, rerender } = renderHook(() => usePlans({ initialPage: 1, pageSize: 5 }), { wrapper });

    // Wait for initial data to load
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getPlansSpy).toHaveBeenCalledTimes(1);
    expect(getPlansSpy.mock.calls[0][0]).toStrictEqual({ for: 'user', initialPage: 1, pageSize: 5 });
    expect(result.current.data.length).toBe(5);
    expect(result.current.count).toBe(25);

    const initialData = result.current.data;

    // Simulate user sign out
    mockUser.id = null;
    rerender();

    // Data should persist after sign out
    expect(result.current.data).toEqual(initialData);
    expect(result.current.data.length).toBe(5);
    expect(result.current.count).toBe(25);
  });

  it('revalidate refetches plans and updates cache', async () => {
    const firstResponse = {
      data: [{ id: 'plan_initial', forPayerType: 'user' } as Partial<BillingPlanResource>],
      total_count: 1,
    };

    const secondResponse = {
      data: [{ id: 'plan_updated', forPayerType: 'user' } as Partial<BillingPlanResource>],
      total_count: 1,
    };

    getPlansSpy.mockImplementationOnce(() => Promise.resolve(firstResponse));
    getPlansSpy.mockImplementationOnce(() => Promise.resolve(secondResponse));

    const { result } = renderHook(() => usePlans({ initialPage: 1, pageSize: 1 }), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual(firstResponse.data);

    await act(async () => {
      await result.current.revalidate();
    });

    await waitFor(() => expect(result.current.data).toEqual(secondResponse.data));
    expect(getPlansSpy).toHaveBeenCalledTimes(2);
  });

  it('revalidate for user plans does not refetch organization plans', async () => {
    getPlansSpy.mockImplementation(({ for: forParam, initialPage, pageSize }) =>
      Promise.resolve({
        data: [
          {
            id: `${forParam}-plan-${initialPage}-${pageSize}`,
            forPayerType: forParam,
          } as Partial<BillingPlanResource>,
        ],
        total_count: 1,
      }),
    );

    const useBoth = () => {
      const userPlans = usePlans({ initialPage: 1, pageSize: 1 });
      const orgPlans = usePlans({ initialPage: 1, pageSize: 1, for: 'organization' } as any);
      return { userPlans, orgPlans };
    };

    const { result } = renderHook(useBoth, { wrapper });

    await waitFor(() => expect(result.current.userPlans.isLoading).toBe(false));
    await waitFor(() => expect(result.current.orgPlans.isLoading).toBe(false));

    getPlansSpy.mockClear();

    await act(async () => {
      await result.current.userPlans.revalidate();
    });

    const isRQ = Boolean((globalThis as any).__CLERK_USE_RQ__);
    const calls = getPlansSpy.mock.calls.map(call => call[0]?.for);

    if (isRQ) {
      await waitFor(() => expect(getPlansSpy.mock.calls.length).toBeGreaterThanOrEqual(1));
      expect(calls.every(value => value === 'user')).toBe(true);
    } else {
      await waitFor(() => expect(getPlansSpy.mock.calls.length).toBe(1));
      expect(getPlansSpy.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          for: 'user',
        }),
      );
    }
  });
});

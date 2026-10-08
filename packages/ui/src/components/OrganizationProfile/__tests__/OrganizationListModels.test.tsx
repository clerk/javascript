import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHook } from '@/test/utils';

import { useDomainListModel } from '../domain-list.model';
import type { DomainListModelOptions } from '../domain-list.types';
import { useMembersActionsModel } from '../members-actions.model';
import { createFakeDomain } from './utils';

const state = vi.hoisted(() => ({
  organization: { id: 'org_1', maxAllowedMemberships: 5, membersCount: 2, pendingInvitationsCount: 1 },
  clerk: { user: { id: 'user_1' }, organization: { id: 'org_1' } },
  domains: {
    data: [] as ReturnType<typeof createFakeDomain>[],
    hasNextPage: true,
    isFetching: false,
    isLoading: false,
    fetchNext: vi.fn(),
  },
  subscriptionItems: [] as Array<{
    plan: { unitPrices: Array<{ name: string; tiers: Array<{ feePerBlock: { amount: number } }> }> };
  }>,
}));

vi.mock('@clerk/shared/react', async importOriginal => ({
  ...(await importOriginal<typeof import('@clerk/shared/react')>()),
  useClerk: () => state.clerk,
  useUser: () => ({ user: { id: 'user_1' } }),
  useOrganization: () => ({ organization: state.organization, domains: state.domains }),
}));
vi.mock('@/common', () => ({ useProtect: () => true }));
vi.mock('@/contexts', () => ({ useSubscription: () => ({ subscriptionItems: state.subscriptionItems }) }));

beforeEach(() => {
  state.clerk.user = { id: 'user_1' };
  state.clerk.organization = { id: 'org_1' };
  state.organization = { id: 'org_1', maxAllowedMemberships: 5, membersCount: 2, pendingInvitationsCount: 1 };
  state.domains.data = [
    createFakeDomain({
      id: 'domain_1',
      name: 'clerk.com',
      organizationId: 'org_1',
      enrollmentMode: 'manual_invitation',
    }),
  ];
  state.domains.hasNextPage = true;
  state.domains.isFetching = false;
  state.domains.fetchNext = vi.fn();
  state.subscriptionItems = [];
});

describe('Organization list model boundaries', () => {
  it('copies domain display data and refreshes it when the resource array stays the same', () => {
    const { result, rerender } = renderHook(() => useDomainListModel({}));
    const snapshot = result.current.rows[0];
    state.domains.data[0].name = 'changed.com';
    expect(snapshot.name).toBe('clerk.com');
    expect(Object.keys(snapshot).sort()).toEqual([
      'enrollmentMode',
      'id',
      'isVerificationComplete',
      'isVerified',
      'name',
    ]);
    rerender();
    expect(result.current.rows[0].name).toBe('changed.com');
    expect(result.current).not.toHaveProperty('domains');
    expect(result.current).not.toHaveProperty('organization');
  });

  it('updates filters when props change without a query update', () => {
    state.domains.data.push(
      createFakeDomain({
        id: 'domain_2',
        name: 'second.com',
        organizationId: 'org_1',
        enrollmentMode: 'automatic_invitation',
        verification: { status: 'verified', strategy: 'email_code', attempts: 0, expiresAt: new Date() },
      }),
    );
    const { result, rerender } = renderHook((options: DomainListModelOptions) => useDomainListModel(options), {
      initialProps: {} as DomainListModelOptions,
    });
    expect(result.current.rows).toHaveLength(2);
    rerender({ verificationStatus: 'verified', enrollmentMode: 'automatic_invitation' });
    expect(result.current.rows.map(row => row.id)).toEqual(['domain_2']);
    rerender({ enrollmentMode: 'manual_invitation' });
    expect(result.current.rows.map(row => row.id)).toEqual(['domain_1']);
  });

  it.each(['user', 'organization'] as const)('blocks retained pagination after the %s changes', key => {
    const { result } = renderHook(() => useDomainListModel({}));
    const fetchNext = result.current.fetchNext;
    fetchNext();
    expect(state.domains.fetchNext).toHaveBeenCalledOnce();
    state.clerk[key] = { id: 'changed' };
    fetchNext();
    expect(state.domains.fetchNext).toHaveBeenCalledOnce();
  });

  it('withholds pagination while fetching and at the end of the query', () => {
    state.domains.isFetching = true;
    const { result, rerender } = renderHook(() => useDomainListModel({}));
    result.current.fetchNext();
    expect(result.current.canFetchNext).toBe(false);
    state.domains.isFetching = false;
    state.domains.hasNextPage = false;
    rerender();
    result.current.fetchNext();
    expect(state.domains.fetchNext).not.toHaveBeenCalled();
  });

  it('recomputes invitation limits when the organization resource changes in place', () => {
    const { result, rerender } = renderHook(() => useMembersActionsModel());
    expect(result.current.isBelowLimit).toBe(true);
    state.organization.membersCount = 4;
    rerender();
    expect(result.current.isBelowLimit).toBe(false);
    state.organization.pendingInvitationsCount = 0;
    rerender();
    expect(result.current.isBelowLimit).toBe(true);
    state.organization.maxAllowedMemberships = 0;
    state.organization.membersCount = 100;
    rerender();
    expect(result.current.isBelowLimit).toBe(true);
  });

  it('recomputes the paid-seat exemption when a plan changes in place', () => {
    state.organization.maxAllowedMemberships = 1;
    state.subscriptionItems = [
      { plan: { unitPrices: [{ name: 'seats', tiers: [{ feePerBlock: { amount: 100 } }] }] } },
    ];
    const { result, rerender } = renderHook(() => useMembersActionsModel());
    expect(result.current.isBelowLimit).toBe(true);
    state.subscriptionItems[0].plan.unitPrices[0].tiers[0].feePerBlock.amount = 0;
    rerender();
    expect(result.current.isBelowLimit).toBe(false);
    expect(Object.keys(result.current).sort()).toEqual(['canManageMemberships', 'isBelowLimit']);
  });
});

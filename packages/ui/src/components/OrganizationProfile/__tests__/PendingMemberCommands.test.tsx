import { createDeferredPromise } from '@clerk/shared/utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHook } from '@/test/utils';

import { useInvitedMembersListModel } from '../invited-members-list.model';
import { useRequestToJoinListModel } from '../request-to-join-list.model';
import { createFakeOrganizationInvitation, createFakeOrganizationMembershipRequest } from './utils';

const state = vi.hoisted(() => ({
  clerk: { user: { id: 'user_1' }, organization: { id: 'org_1' } },
  organization: { id: 'org_1' },
  membership: {} as object | undefined,
  invitations: {} as Record<string, unknown>,
  membershipRequests: {} as Record<string, unknown>,
}));

vi.mock('@clerk/shared/react', async importOriginal => ({
  ...(await importOriginal<typeof import('@clerk/shared/react')>()),
  useClerk: () => state.clerk,
  useUser: () => ({ user: { id: 'user_1' } }),
  useOrganization: () => state,
}));
vi.mock('@/hooks/useFetchRoles', () => ({
  useFetchRoles: () => ({ options: [{ value: 'org:member', label: 'Member' }], isLoading: false }),
  useLocalizeCustomRoles: () => ({ localizeCustomRole: () => undefined }),
}));

function setup() {
  const invitation = createFakeOrganizationInvitation({
    id: 'inv_1',
    organizationId: 'org_1',
    emailAddress: 'invite@clerk.com',
    role: 'org:member',
  });
  const request = createFakeOrganizationMembershipRequest({
    id: 'request_1',
    organizationId: 'org_1',
    publicUserData: { userId: 'user_2', identifier: 'request@clerk.com' },
  });
  invitation.revoke = vi.fn().mockResolvedValue(invitation);
  request.accept = vi.fn().mockResolvedValue(request);
  request.reject = vi.fn().mockResolvedValue(request);
  const invitations = { data: [invitation], revalidate: vi.fn().mockResolvedValue(undefined), fetchPage: vi.fn() };
  const requests = { data: [request], revalidate: vi.fn().mockResolvedValue(undefined), fetchPage: vi.fn() };
  state.invitations = invitations;
  state.membershipRequests = requests;
  const hook = renderHook(() => ({
    invitations: useInvitedMembersListModel(),
    requests: useRequestToJoinListModel(),
  }));
  return { ...hook, invitation, request, invitations, requests };
}

beforeEach(() => {
  state.clerk.user = { id: 'user_1' };
  state.clerk.organization = { id: 'org_1' };
  state.membership = {};
});

describe('Pending member command boundaries', () => {
  it('copies display values and keeps resources and queries private', () => {
    const { result, invitation, request } = setup();
    const invited = result.current.invitations.invitations[0];
    const requested = result.current.requests.requests[0];
    const date = invited.view.invitedAt;
    invitation.emailAddress = 'changed@clerk.com';
    invitation.createdAt.setFullYear(2000);
    request.publicUserData.identifier = 'changed@clerk.com';
    expect(invited.view).toEqual({ emailAddress: 'invite@clerk.com', invitedAt: date, roleLabel: 'Member' });
    expect(requested.view.identifier).toBe('request@clerk.com');
    expect(Object.keys(invited).sort()).toEqual(['id', 'revoke', 'view']);
    expect(Object.keys(requested).sort()).toEqual(['accept', 'id', 'reject', 'view']);
    expect(result.current.invitations).not.toHaveProperty('invitationsResource');
    expect(result.current.requests).not.toHaveProperty('membershipRequests');
  });

  it('discards SDK results and refreshes the correct query after each action', async () => {
    const { result, invitation, request, invitations, requests } = setup();
    await expect(result.current.invitations.invitations[0].revoke()).resolves.toBeUndefined();
    await expect(result.current.requests.requests[0].accept()).resolves.toBeUndefined();
    await expect(result.current.requests.requests[0].reject()).resolves.toBeUndefined();
    expect(invitation.revoke).toHaveBeenCalledOnce();
    expect(request.accept).toHaveBeenCalledOnce();
    expect(request.reject).toHaveBeenCalledOnce();
    expect(invitations.revalidate).toHaveBeenCalledOnce();
    expect(requests.revalidate).toHaveBeenCalledTimes(2);
  });

  it.each(['user', 'organization'] as const)(
    'blocks retained commands and pagination after the %s changes',
    async key => {
      const { result, invitation, request, invitations, requests } = setup();
      state.clerk[key] = { id: 'changed' };
      await result.current.invitations.invitations[0].revoke();
      await result.current.requests.requests[0].accept();
      await result.current.requests.requests[0].reject();
      result.current.invitations.table.onPageChange(2);
      result.current.requests.table.onPageChange(2);
      expect(invitation.revoke).not.toHaveBeenCalled();
      expect(request.accept).not.toHaveBeenCalled();
      expect(request.reject).not.toHaveBeenCalled();
      expect(invitations.fetchPage).not.toHaveBeenCalled();
      expect(requests.fetchPage).not.toHaveBeenCalled();
    },
  );

  it('does not refresh a previous scope after actions finish', async () => {
    const { result, invitation, request, invitations, requests } = setup();
    const completion = createDeferredPromise();
    invitation.revoke = vi.fn().mockReturnValue(completion.promise);
    request.accept = vi.fn().mockReturnValue(completion.promise);
    const pending = [result.current.invitations.invitations[0].revoke(), result.current.requests.requests[0].accept()];
    state.clerk.organization = { id: 'org_2' };
    completion.resolve(undefined);
    await Promise.all(pending);
    expect(invitations.revalidate).not.toHaveBeenCalled();
    expect(requests.revalidate).not.toHaveBeenCalled();
  });

  it('withholds request mutations when membership is absent', async () => {
    state.membership = undefined;
    const { result, request } = setup();
    expect(result.current.requests.canAct).toBe(false);
    await result.current.requests.requests[0].accept();
    await result.current.requests.requests[0].reject();
    expect(request.accept).not.toHaveBeenCalled();
    expect(request.reject).not.toHaveBeenCalled();
  });
});

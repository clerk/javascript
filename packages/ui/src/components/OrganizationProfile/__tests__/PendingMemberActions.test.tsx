import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook } from '@/test/utils';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';

import { useInvitedMembersListController } from '../invited-members-list.controller';
import type { InvitationRowModel } from '../invited-members-list.types';
import { useRequestToJoinListController } from '../request-to-join-list.controller';
import type { RequestRowModel } from '../request-to-join-list.types';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

async function setup(canAct = true) {
  const { wrapper: Fixture } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
  const wrapper = ({ children }: PropsWithChildren) => (
    <Fixture>
      <CardStateProvider>{children}</CardStateProvider>
    </Fixture>
  );
  const invitations: InvitationRowModel[] = ['first', 'second'].map(id => ({
    id,
    view: { emailAddress: id, invitedAt: '1/1/2026', roleLabel: 'Member' },
    revoke: vi.fn().mockResolvedValue(undefined),
  }));
  const requests: RequestRowModel[] = ['first', 'second'].map(id => ({
    id,
    view: { identifier: id, requestedAt: '1/1/2026' },
    accept: vi.fn().mockResolvedValue(undefined),
    reject: vi.fn().mockResolvedValue(undefined),
  }));
  const table = { page: 1, onPageChange: vi.fn(), itemCount: 2, pageCount: 1, itemsPerPage: 10, isLoading: false };
  const hook = renderHook(
    () => ({
      invitations: useInvitedMembersListController({ scope: 'scope', hasOrganization: true, invitations, table }),
      requests: useRequestToJoinListController({ scope: 'scope', hasOrganization: true, canAct, requests, table }),
      card: useCardState(),
    }),
    { wrapper },
  );
  return { ...hook, invitations, requests };
}

describe('Pending member action ownership', () => {
  it('uses one invitation lock across rows and releases it after completion', async () => {
    const { result, invitations, rerender } = await setup();
    const completion = createDeferredPromise();
    invitations[0].revoke = vi.fn().mockReturnValue(completion.promise);
    rerender();
    const initial = result.current.invitations.invitations;
    let pending!: Promise<void>;
    act(() => {
      pending = initial[0].interaction.onRevoke();
      expect(initial[0].interaction.onRevoke()).toBe(pending);
      expect(initial[1].interaction.onRevoke()).toBe(pending);
    });
    expect(invitations[0].revoke).toHaveBeenCalledOnce();
    expect(invitations[1].revoke).not.toHaveBeenCalled();
    expect(result.current.invitations.invitations.every(row => row.interaction.isDisabled)).toBe(true);
    expect(result.current.card.isLoading).toBe(false);
    await act(async () => {
      completion.resolve(undefined);
      await pending;
    });
    await act(() => result.current.invitations.invitations[1].interaction.onRevoke());
    expect(invitations[1].revoke).toHaveBeenCalledOnce();
  });

  it('locks opposite actions on the same request while allowing separate rows', async () => {
    const { result, requests, rerender } = await setup();
    const completion = createDeferredPromise();
    requests[0].accept = vi.fn().mockReturnValue(completion.promise);
    rerender();
    const initial = result.current.requests.requests;
    let pending!: Promise<void>;
    let other!: Promise<void>;
    act(() => {
      pending = initial[0].interaction.onAccept();
      expect(initial[0].interaction.onReject()).toBe(pending);
      expect(initial[0].interaction.onAccept()).toBe(pending);
      other = initial[1].interaction.onReject();
    });
    expect(requests[0].accept).toHaveBeenCalledOnce();
    expect(requests[0].reject).not.toHaveBeenCalled();
    expect(requests[1].reject).toHaveBeenCalledOnce();
    expect(result.current.requests.requests[0].interaction).toMatchObject({
      acceptIsLoading: true,
      rejectIsLoading: false,
      acceptIsDisabled: true,
      rejectIsDisabled: true,
    });
    await act(async () => {
      await other;
      completion.resolve(undefined);
      await pending;
    });
    expect(result.current.requests.requests.every(row => !row.interaction.acceptIsDisabled)).toBe(true);
    expect(result.current.card.isLoading).toBe(false);
  });

  it.each(['invitation', 'request'])('clears a %s error on retry and releases a failed action', async kind => {
    const { result, invitations, requests, rerender } = await setup();
    const effect = vi
      .fn()
      .mockRejectedValueOnce(
        new ClerkAPIResponseError('Action failed', {
          status: 422,
          data: [{ code: 'action_failed', message: 'Action failed' }],
        }),
      )
      .mockImplementationOnce(() => {
        throw new Error('Unexpected failure');
      })
      .mockResolvedValue(undefined);
    invitations[0].revoke = effect;
    requests[0].accept = effect;
    rerender();
    const action = () =>
      kind === 'invitation'
        ? result.current.invitations.invitations[0].interaction.onRevoke()
        : result.current.requests.requests[0].interaction.onAccept();
    await act(action);
    expect(result.current.card.error).toBe('Action failed');
    await act(async () => {
      await expect(action()).rejects.toThrow('Unexpected failure');
    });
    expect(result.current.card.error).toBeUndefined();
    await act(action);
    expect(effect).toHaveBeenCalledTimes(3);
  });

  it('ignores late failures and retained callbacks after unmount', async () => {
    const { result, invitations, requests, unmount, rerender } = await setup();
    const completion = createDeferredPromise();
    invitations[0].revoke = vi.fn().mockReturnValue(completion.promise);
    requests[0].accept = vi.fn().mockReturnValue(completion.promise);
    rerender();
    const invitation = result.current.invitations.invitations[0].interaction;
    const request = result.current.requests.requests[0].interaction;
    let pending!: Promise<void>[];
    act(() => {
      pending = [invitation.onRevoke(), request.onAccept()];
    });
    unmount();
    completion.reject(new Error('Late failure'));
    await expect(Promise.all(pending)).resolves.toEqual([undefined, undefined]);
    await invitation.onRevoke();
    await request.onAccept();
    await request.onReject();
    expect(invitations[0].revoke).toHaveBeenCalledOnce();
    expect(requests[0].accept).toHaveBeenCalledOnce();
    expect(requests[0].reject).not.toHaveBeenCalled();
  });

  it('withholds actions for requests without membership', async () => {
    const { result, requests } = await setup(false);
    await result.current.requests.requests[0].interaction.onAccept();
    await result.current.requests.requests[0].interaction.onReject();
    expect(requests[0].accept).not.toHaveBeenCalled();
    expect(requests[0].reject).not.toHaveBeenCalled();
    expect(result.current.requests.requests[0].interaction.acceptIsDisabled).toBe(true);
  });
});

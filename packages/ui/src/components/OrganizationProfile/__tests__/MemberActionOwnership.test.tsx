import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook } from '@/test/utils';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';

import { useActiveMembersListController } from '../active-members-list.controller';
import type { ActiveMembersListModel, MemberRowModel } from '../active-members-list.types';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

function member(id: string): MemberRowModel {
  return {
    id,
    preview: { user: undefined, identifier: id, isCurrentUser: false, isDeprovisioned: false, isBanned: false },
    view: {
      isDeprovisioned: false,
      date: '1/1/2026',
      canManageMemberships: true,
      role: 'org:member',
      roleName: 'Member',
      localizedRoleLabel: 'Member',
      options: [],
    },
    updateRole: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
  };
}

async function setup(members: MemberRowModel[], hasRoleSetMigration = false) {
  const { wrapper: Fixture } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
  const wrapper = ({ children }: PropsWithChildren) => (
    <Fixture>
      <CardStateProvider>{children}</CardStateProvider>
    </Fixture>
  );
  const model: ActiveMembersListModel = {
    subject: 'org_1',
    hasOrganization: true,
    hasRoleSetMigration,
    members,
    table: {
      page: 1,
      onPageChange: vi.fn(),
      itemCount: members.length,
      pageCount: 1,
      itemsPerPage: 10,
      isLoading: false,
    },
  };
  return renderHook(() => ({ controller: useActiveMembersListController(model), card: useCardState() }), { wrapper });
}

describe('Member action ownership', () => {
  it('shares one pending action across rows and allows another action after completion', async () => {
    const first = member('first');
    const second = member('second');
    const completion = createDeferredPromise();
    first.updateRole = vi.fn().mockReturnValue(completion.promise);
    const { result } = await setup([first, second]);
    const initial = result.current.controller.members;
    let pending!: Promise<void>;
    let duplicate!: Promise<void>;
    let competing!: Promise<void>;
    act(() => {
      pending = initial[0].interaction.onRoleChange('org:admin');
      duplicate = initial[0].interaction.onRoleChange('org:admin');
      competing = initial[1].interaction.onRemove();
    });
    expect(duplicate).toBe(pending);
    expect(competing).toBe(pending);
    expect(first.updateRole).toHaveBeenCalledOnce();
    expect(second.remove).not.toHaveBeenCalled();
    expect(
      result.current.controller.members.every(
        row => row.interaction.isRoleSelectDisabled && row.interaction.isRemoveDisabled,
      ),
    ).toBe(true);
    expect(result.current.card.isLoading).toBe(false);
    await act(async () => {
      completion.resolve(undefined);
      await pending;
    });
    expect(result.current.controller.members[1].interaction.isRemoveDisabled).toBe(false);
    await act(() => result.current.controller.members[1].interaction.onRemove());
    expect(second.remove).toHaveBeenCalledOnce();
  });

  it('clears a failed action error when the user retries', async () => {
    const source = member('first');
    source.updateRole = vi
      .fn()
      .mockRejectedValueOnce(
        new ClerkAPIResponseError('Role change failed', {
          status: 422,
          data: [{ code: 'role_change_failed', message: 'Role change failed' }],
        }),
      )
      .mockResolvedValue(undefined);
    const { result } = await setup([source]);
    await act(() => result.current.controller.members[0].interaction.onRoleChange('org:admin'));
    expect(result.current.card.error).toBe('Role change failed');
    expect(result.current.controller.members[0].interaction.isRoleSelectDisabled).toBe(false);
    await act(() => result.current.controller.members[0].interaction.onRoleChange('org:admin'));
    expect(result.current.card.error).toBeUndefined();
    expect(source.updateRole).toHaveBeenCalledTimes(2);
  });

  it('releases pending ownership after a synchronous command failure', async () => {
    const source = member('first');
    source.updateRole = vi
      .fn()
      .mockImplementationOnce(() => {
        throw new Error('Unexpected failure');
      })
      .mockResolvedValue(undefined);
    const { result } = await setup([source]);
    await act(async () => {
      await expect(result.current.controller.members[0].interaction.onRoleChange('org:admin')).rejects.toThrow(
        'Unexpected failure',
      );
    });
    expect(result.current.controller.members[0].interaction.isRoleSelectDisabled).toBe(false);
    await act(() => result.current.controller.members[0].interaction.onRoleChange('org:admin'));
    expect(source.updateRole).toHaveBeenCalledTimes(2);
  });

  it('ignores late failure and retained commands after the list closes', async () => {
    const source = member('first');
    const completion = createDeferredPromise();
    source.remove = vi.fn().mockReturnValue(completion.promise);
    const { result, unmount } = await setup([source]);
    const retained = result.current.controller.members[0].interaction;
    let pending!: Promise<void>;
    act(() => {
      pending = retained.onRemove();
    });
    unmount();
    completion.reject(new Error('Late failure'));
    await expect(pending).resolves.toBeUndefined();
    await retained.onRemove();
    await retained.onRoleChange('org:admin');
    expect(source.remove).toHaveBeenCalledOnce();
    expect(source.updateRole).not.toHaveBeenCalled();
  });

  it('withholds commands for protected rows and role migrations', async () => {
    const source = member('first');
    source.preview.isCurrentUser = true;
    const { result } = await setup([source], true);
    await result.current.controller.members[0].interaction.onRemove();
    await result.current.controller.members[0].interaction.onRoleChange('org:admin');
    expect(source.remove).not.toHaveBeenCalled();
    expect(source.updateRole).not.toHaveBeenCalled();
    expect(result.current.controller.members[0].interaction.isRemoveDisabled).toBe(true);
    expect(result.current.controller.members[0].interaction.isRoleSelectDisabled).toBe(true);
  });
});

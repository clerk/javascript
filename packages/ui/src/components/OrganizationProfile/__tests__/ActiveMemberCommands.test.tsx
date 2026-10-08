import { createDeferredPromise } from '@clerk/shared/utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook } from '@/test/utils';

import { useActiveMembersListModel } from '../active-members-list.model';
import { useMembersSearchController } from '../members-search.controller';
import { createFakeMember } from './utils';

const state = vi.hoisted(() => ({ options: [{ label: 'Member', value: 'org:member' }] }));
vi.mock('@/hooks/useFetchRoles', () => ({
  useFetchRoles: () => ({ options: state.options, isLoading: false, hasRoleSetMigration: false }),
  useLocalizeCustomRoles: () => ({ localizeCustomRole: () => undefined }),
}));

const { createFixtures } = bindCreateFixtures('OrganizationProfile');
type MembershipQuery = Parameters<typeof useActiveMembersListModel>[0]['memberships'];

beforeEach(() => {
  state.options = [{ label: 'Member', value: 'org:member' }];
});

async function setup() {
  const { wrapper, fixtures } = await createFixtures(f => {
    f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'Org1', role: 'admin' }] });
  });
  const source = createFakeMember({ id: 'member_1', orgId: fixtures.clerk.organization!.id, role: 'org:member' });
  source.update = vi.fn().mockResolvedValue(source);
  source.destroy = vi.fn().mockResolvedValue(source);
  const revalidate = vi.fn().mockResolvedValue({ data: [source] });
  const memberships = {
    data: [source],
    revalidate,
    fetchPage: vi.fn(),
    page: 1,
    count: 1,
    pageCount: 1,
    isLoading: false,
  } as unknown as MembershipQuery;
  const { result, rerender } = renderHook(() => useActiveMembersListModel({ memberships, pageSize: 10 }), { wrapper });
  return { source, revalidate, result, rerender, fixtures };
}

describe('Active member commands', () => {
  it('copies member display values and role options', async () => {
    const { source, result, rerender } = await setup();
    const snapshot = result.current.members[0];
    const date = snapshot.view.date;
    source.publicUserData!.firstName = 'Changed';
    source.createdAt.setFullYear(2000);
    state.options[0].label = 'Changed role';

    expect(snapshot.preview.display!.avatar!.firstName).toBe('test_firstName');
    expect(snapshot.preview.display!.name).toBe('test_firstName test_lastName');
    expect(snapshot.view.date).toBe(date);
    expect(snapshot.view.options![0].label).toBe('Member');
    expect(snapshot).not.toHaveProperty('organization');
    expect(snapshot).not.toHaveProperty('publicMetadata');
    rerender();
    expect(result.current.members[0].preview.display!.avatar!.firstName).toBe('Changed');
    expect(result.current.members[0].preview.display!.name).toBe('Changed test_lastName');
    expect(result.current.members[0].view.options![0].label).toBe('Changed role');
  });

  it('discards SDK results and refreshes after removal', async () => {
    const { source, revalidate, result } = await setup();
    await expect(result.current.members[0].updateRole('org:admin')).resolves.toBeUndefined();
    await expect(result.current.members[0].remove()).resolves.toBeUndefined();
    expect(source.update).toHaveBeenCalledExactlyOnceWith({ role: 'org:admin' });
    expect(source.destroy).toHaveBeenCalledOnce();
    expect(revalidate).toHaveBeenCalledTimes(2);
  });

  it('does not run retained commands after the active organization changes', async () => {
    const { source, revalidate, result, fixtures } = await setup();
    const commands = result.current.members[0];
    vi.spyOn(fixtures.clerk, 'organization', 'get').mockReturnValue({
      ...fixtures.clerk.organization!,
      id: 'org_second',
    });
    await commands.updateRole('org:admin');
    await commands.remove();
    expect(source.update).not.toHaveBeenCalled();
    expect(source.destroy).not.toHaveBeenCalled();
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('does not run retained commands after the active user changes within the same organization', async () => {
    const { source, revalidate, result, fixtures } = await setup();
    const commands = result.current.members[0];
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'user_second' });
    await commands.updateRole('org:admin');
    await commands.remove();
    result.current.table.onPageChange(2);
    expect(source.update).not.toHaveBeenCalled();
    expect(source.destroy).not.toHaveBeenCalled();
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('does not refresh an old organization after removal completes', async () => {
    const { source, revalidate, result, fixtures } = await setup();
    const completion = createDeferredPromise();
    source.destroy = vi.fn().mockReturnValue(completion.promise);
    const pending = result.current.members[0].remove();
    vi.spyOn(fixtures.clerk, 'organization', 'get').mockReturnValue({
      ...fixtures.clerk.organization!,
      id: 'org_second',
    });
    completion.resolve(source);
    await pending;
    expect(source.destroy).toHaveBeenCalledOnce();
    expect(revalidate).not.toHaveBeenCalled();
  });
  it('cancels a pending search when its owner unmounts', () => {
    vi.useFakeTimers();
    try {
      const onQueryTrigger = vi.fn();
      const { result, unmount } = renderHook(() =>
        useMembersSearchController(
          {
            value: 'next query',
            query: '',
            memberships: { page: 1, hasData: true, count: 0, hasRows: false, isLoading: false, fetchPage: vi.fn() },
            onSearchChange: vi.fn(),
            onQueryTrigger,
          },
          10,
        ),
      );
      act(() => result.current.handleChange('next query'));
      unmount();
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(onQueryTrigger).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});

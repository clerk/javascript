import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, renderHook, waitFor } from '@/test/utils';

import {
  createFakeUserOrganizationInvitation,
  createFakeUserOrganizationMembership,
  createFakeUserOrganizationSuggestion,
} from '../../OrganizationSwitcher/__tests__/test-utils';
import { OrganizationList } from '..';
import { useOrganizationListItemsModel } from '../organization-list.model';

const { createFixtures } = bindCreateFixtures('OrganizationList');

async function setup() {
  const { wrapper, fixtures, props } = await createFixtures(f => {
    f.withOrganizations();
    f.withUser({ email_addresses: ['first@clerk.com'] });
  });
  props.setProps({ afterSelectOrganizationUrl: '/organization', afterSelectPersonalUrl: '/personal' });
  const membership = createFakeUserOrganizationMembership({
    id: 'membership_first',
    organization: {
      id: 'org_first',
      name: 'First organization',
      slug: 'first',
      membersCount: 1,
      pendingInvitationsCount: 0,
      adminDeleteEnabled: false,
      maxAllowedMemberships: 10,
    },
  });
  const invitation = createFakeUserOrganizationInvitation({
    id: 'invitation_first',
    emailAddress: 'first@clerk.com',
    publicOrganizationData: { id: 'org_invited', name: 'Invited organization' },
  });
  const suggestion = createFakeUserOrganizationSuggestion({
    id: 'suggestion_first',
    emailAddress: 'first@clerk.com',
    publicOrganizationData: { id: 'org_suggested', name: 'Suggested organization' },
  });
  fixtures.clerk.user?.getOrganizationMemberships.mockResolvedValue({ data: [membership], total_count: 1 });
  fixtures.clerk.user?.getOrganizationInvitations.mockResolvedValue({ data: [invitation], total_count: 1 });
  fixtures.clerk.user?.getOrganizationSuggestions.mockResolvedValue({ data: [suggestion], total_count: 1 });
  const hook = renderHook(useOrganizationListItemsModel, { wrapper });
  await waitFor(() => expect(hook.result.current.memberships).toHaveLength(1));
  await waitFor(() => expect(hook.result.current.invitations).toHaveLength(1));
  await waitFor(() => expect(hook.result.current.suggestions).toHaveLength(1));
  fixtures.clerk.setActive.mockResolvedValue(undefined);
  return { ...hook, fixtures, props, membership, invitation, suggestion };
}

describe('OrganizationList action ownership', () => {
  it.each(['organization', 'personal'] as const)('checks the caller before %s dispatch and navigation', async kind => {
    const { result, fixtures } = await setup();
    const select =
      kind === 'organization'
        ? result.current.memberships[0].model.selectOrganization
        : result.current.personalAccount.selectPersonal!;
    let active = false;
    await select(() => active);
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
    active = true;
    const deferred = createDeferredPromise<void>();
    fixtures.clerk.setActive.mockReturnValueOnce(deferred.promise);
    const pending = select(() => active);
    expect(fixtures.clerk.setActive).toHaveBeenCalledOnce();
    active = false;
    await act(async () => {
      deferred.resolve();
      await pending;
    });
    expect(fixtures.router.navigate).not.toHaveBeenCalled();
  });

  it('does not fetch an accepted organization after the list closes', async () => {
    const { result, fixtures, invitation, unmount } = await setup();
    const deferred = createDeferredPromise<typeof invitation>();
    vi.mocked(invitation.accept).mockReturnValueOnce(deferred.promise);
    const pending = result.current.invitations[0].model.accept();
    unmount();
    deferred.resolve({ ...invitation, status: 'accepted' });
    expect(await pending).toBeUndefined();
    expect(fixtures.clerk.getOrganization).not.toHaveBeenCalled();
  });

  it('discards an organization fetched after the list closes', async () => {
    const { result, fixtures, invitation, membership, unmount } = await setup();
    const deferred = createDeferredPromise<typeof membership.organization>();
    vi.mocked(invitation.accept).mockResolvedValueOnce({ ...invitation, status: 'accepted' });
    fixtures.clerk.getOrganization.mockReturnValueOnce(deferred.promise);
    const pending = result.current.invitations[0].model.accept();
    await waitFor(() => expect(fixtures.clerk.getOrganization).toHaveBeenCalledOnce());
    unmount();
    deferred.resolve({ ...membership.organization, id: 'org_invited' });
    expect(await pending).toBeUndefined();
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it.each(['invitation', 'suggestion'] as const)('ignores a late %s failure after the list closes', async kind => {
    const { result, invitation, suggestion, unmount } = await setup();
    const deferred = createDeferredPromise<never>();
    const resource = kind === 'invitation' ? invitation : suggestion;
    vi.mocked(resource.accept).mockReturnValueOnce(deferred.promise);
    const pending =
      kind === 'invitation'
        ? result.current.invitations[0].model.accept()
        : result.current.suggestions[0].model.accept();
    unmount();
    deferred.reject(new Error('Late failure'));
    await expect(pending).resolves.toBeUndefined();
  });

  it('does not revive a selection after redirect settings change and return', async () => {
    const { result, fixtures, props, rerender } = await setup();
    const select = result.current.memberships[0].model.selectOrganization;
    props.setProps({ afterSelectOrganizationUrl: '/changed', afterSelectPersonalUrl: '/personal' });
    rerender();
    props.setProps({ afterSelectOrganizationUrl: '/organization', afterSelectPersonalUrl: '/personal' });
    rerender();
    await select();
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it('uses the latest redirect callback for a pending selection', async () => {
    const { result, fixtures, props, rerender } = await setup();
    const first = vi.fn(() => '/first');
    const latest = vi.fn(() => '/latest');
    props.setProps({ afterSelectOrganizationUrl: first });
    rerender();
    const deferred = createDeferredPromise<void>();
    fixtures.clerk.setActive.mockReturnValueOnce(deferred.promise);
    const pending = result.current.memberships[0].model.selectOrganization();
    props.setProps({ afterSelectOrganizationUrl: latest });
    rerender();
    await act(async () => {
      deferred.resolve();
      await pending;
    });
    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledOnce();
    expect(fixtures.router.navigate).toHaveBeenCalledWith('/latest');
  });

  it('uses the existing resource argument and navigation after a current selection', async () => {
    const { result, fixtures, membership } = await setup();
    await act(async () => {
      await result.current.memberships[0].model.selectOrganization();
    });
    expect(fixtures.clerk.setActive).toHaveBeenCalledWith({ organization: membership.organization });
    expect(fixtures.router.navigate).toHaveBeenCalledWith('/organization');
  });

  it('copies display data and rejects a replaced organization ID', async () => {
    const { result, fixtures, membership } = await setup();
    const row = result.current.memberships[0].model;
    membership.organization.id = 'org_replaced';
    membership.organization.name = 'Replaced organization';
    expect(row.organizationPreview.name).toBe('First organization');
    await act(async () => {
      await row.selectOrganization();
    });
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });

  it.each(['account', 'session', 'client'] as const)(
    'rejects selection, personal selection, invitations, and suggestions after a %s change',
    async kind => {
      const { result, fixtures, invitation, suggestion } = await setup();
      if (kind === 'account') {
        vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'user_changed' });
      } else if (kind === 'client') {
        vi.spyOn(fixtures.clerk, 'client', 'get').mockReturnValue({ ...fixtures.clerk.client, id: 'client_changed' });
      } else {
        vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue({
          ...fixtures.clerk.session!,
          id: 'session_changed',
        });
      }
      await act(async () => {
        await result.current.memberships[0].model.selectOrganization();
        await result.current.personalAccount.selectPersonal?.();
        expect(await result.current.invitations[0].model.accept()).toBeUndefined();
        await result.current.suggestions[0].model.accept();
      });
      expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
      expect(invitation.accept).not.toHaveBeenCalled();
      expect(suggestion.accept).not.toHaveBeenCalled();
      expect(fixtures.router.navigate).not.toHaveBeenCalled();
    },
  );

  it.each(['organization', 'personal'] as const)(
    'does not navigate after a pending %s selection loses its source',
    async kind => {
      const { result, fixtures, unmount } = await setup();
      const deferred = createDeferredPromise<void>();
      fixtures.clerk.setActive.mockReturnValueOnce(deferred.promise);
      const pending =
        kind === 'organization'
          ? result.current.memberships[0].model.selectOrganization()
          : result.current.personalAccount.selectPersonal?.();
      expect(fixtures.clerk.setActive).toHaveBeenCalledOnce();
      unmount();
      await act(async () => {
        deferred.resolve();
        await pending;
      });
      expect(fixtures.router.navigate).not.toHaveBeenCalled();
    },
  );

  it('does not continue invitation acceptance after an account change during the request', async () => {
    const { result, invitation, fixtures } = await setup();
    const deferred = createDeferredPromise<typeof invitation>();
    vi.mocked(invitation.accept).mockReturnValueOnce(deferred.promise);
    const pending = result.current.invitations[0].model.accept();
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'user_changed' });
    await act(async () => {
      deferred.resolve({ ...invitation, status: 'accepted' });
      await pending;
    });
    expect(fixtures.clerk.getOrganization).not.toHaveBeenCalled();
  });

  it('returns a plain accepted membership whose resource remains private', async () => {
    const { result, invitation, fixtures, membership } = await setup();
    vi.mocked(invitation.accept).mockResolvedValueOnce({ ...invitation, status: 'accepted' });
    const organization = { ...membership.organization, id: 'org_invited', name: 'Invited organization' };
    fixtures.clerk.getOrganization.mockResolvedValueOnce(organization);
    await act(async () => {
      const accepted = await result.current.invitations[0].model.accept();
      expect(accepted?.organizationPreview.name).toBe('Invited organization');
      await accepted?.selectOrganization();
    });
    expect(fixtures.clerk.setActive).toHaveBeenCalledWith({ organization });
  });

  it('does not revive an old selection after the session changes and returns', async () => {
    const { result, fixtures, rerender } = await setup();
    const select = result.current.memberships[0].model.selectOrganization;
    const session = fixtures.clerk.session;
    const changed = { ...session!, id: 'session_changed' };
    const getter = vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue(changed);
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources!,
      session: changed,
    };
    rerender();
    getter.mockReturnValue(session);
    fixtures.clerk.__internal_lastEmittedResources = { ...fixtures.clerk.__internal_lastEmittedResources, session };
    rerender();
    await act(async () => {
      await select();
    });
    expect(fixtures.clerk.setActive).not.toHaveBeenCalled();
  });
  it('does not expose previous account rows while the new membership request is pending', async () => {
    const { result, fixtures, membership: _membership, rerender } = await setup();
    const deferred = createDeferredPromise<{ data: (typeof _membership)[]; total_count: number }>();
    const user = {
      ...fixtures.clerk.user!,
      id: 'user_changed',
      getOrganizationMemberships: vi.fn(() => deferred.promise),
      getOrganizationInvitations: vi.fn().mockResolvedValue({ data: [], total_count: 0 }),
      getOrganizationSuggestions: vi.fn().mockResolvedValue({ data: [], total_count: 0 }),
    };
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(user);
    fixtures.clerk.__internal_lastEmittedResources = { ...fixtures.clerk.__internal_lastEmittedResources!, user };
    rerender();
    await waitFor(() => expect(user.getOrganizationMemberships).toHaveBeenCalledOnce());
    expect(result.current.memberships).toEqual([]);
    expect(result.current.invitations).toEqual([]);
    expect(result.current.suggestions).toEqual([]);
    await act(async () => {
      deferred.resolve({ data: [], total_count: 0 });
      await deferred.promise;
    });
  });

  it('keeps the new page loading when an old selection finishes after a session change', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['first@clerk.com'] });
    });
    props.setProps({ afterSelectOrganizationUrl: '/organization' });
    const membership = createFakeUserOrganizationMembership({
      id: 'membership_first',
      organization: {
        id: 'org_first',
        name: 'First organization',
        slug: 'first',
        membersCount: 1,
        pendingInvitationsCount: 0,
        adminDeleteEnabled: false,
        maxAllowedMemberships: 10,
      },
    });
    fixtures.clerk.user?.getOrganizationMemberships.mockResolvedValue({ data: [membership], total_count: 1 });
    const first = createDeferredPromise<void>();
    const second = createDeferredPromise<void>();
    fixtures.clerk.setActive.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { findByRole, getByRole, rerender, userEvent } = render(<OrganizationList />, { wrapper });
    await userEvent.click(await findByRole('button', { name: /First organization/ }));
    const session = { ...fixtures.clerk.session!, id: 'session_changed' };
    vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue(session);
    fixtures.clerk.__internal_lastEmittedResources = { ...fixtures.clerk.__internal_lastEmittedResources!, session };
    rerender(<OrganizationList />);
    await waitFor(() => expect(getByRole('button', { name: /First organization/ })).toBeEnabled());
    await userEvent.click(getByRole('button', { name: /First organization/ }));
    expect(fixtures.clerk.setActive).toHaveBeenCalledTimes(2);
    await act(async () => {
      first.resolve();
      await first.promise;
    });
    expect(getByRole('button', { name: /First organization/ })).toBeDisabled();
    expect(fixtures.router.navigate).not.toHaveBeenCalled();
    await act(async () => {
      second.resolve();
      await second.promise;
    });
    expect(fixtures.router.navigate).toHaveBeenCalledWith('/organization');
  });
});

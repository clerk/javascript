import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { renderHook, waitFor } from '@/test/utils';
import {
  createFakeOrganization,
  createFakeUserOrganizationInvitation,
  createFakeUserOrganizationSuggestion,
} from '@/ui/components/OrganizationSwitcher/__tests__/test-utils';

import { useChooseOrganizationScreenModel } from '../choose-organization-screen.model';

const { createFixtures } = bindCreateFixtures('TaskChooseOrganization');
async function setup() {
  const result = await createFixtures(f => {
    f.withOrganizations();
    f.withForceOrganizationSelection();
    f.withUser({ email_addresses: ['first@clerk.com'], tasks: [{ key: 'choose-organization' }] });
  });
  const invitation = createFakeUserOrganizationInvitation({
    id: 'inv_1',
    emailAddress: 'first@clerk.com',
    publicOrganizationData: { id: 'org_1', name: 'Invited organization' },
  });
  const suggestion = createFakeUserOrganizationSuggestion({
    id: 'sug_1',
    emailAddress: 'first@clerk.com',
    publicOrganizationData: { id: 'org_1', name: 'Suggested organization' },
  });
  result.fixtures.clerk.user?.getOrganizationInvitations.mockResolvedValue({ data: [invitation], total_count: 1 });
  result.fixtures.clerk.user?.getOrganizationSuggestions.mockResolvedValue({ data: [suggestion], total_count: 1 });
  const hook = renderHook(useChooseOrganizationScreenModel, { wrapper: result.wrapper });
  await waitFor(() => expect(hook.result.current.invitations).toHaveLength(1));
  await waitFor(() => expect(hook.result.current.suggestions).toHaveLength(1));
  return { ...result, ...hook, invitation, suggestion };
}

const failure = () =>
  new ClerkAPIResponseError('Request failed', {
    status: 500,
    data: [{ code: 'internal_server_error', message: 'Request failed', long_message: 'Please try again' }],
  });

describe('task organization acceptance ownership', () => {
  it.each(['user', 'session', 'client'] as const)(
    'rejects captured acceptance commands after %s changes',
    async key => {
      const { result, fixtures, invitation, suggestion } = await setup();
      const acceptInvitation = result.current.invitations[0].accept;
      const acceptSuggestion = result.current.suggestions[0].accept;
      vi.spyOn(fixtures.clerk, key, 'get').mockReturnValue({ ...fixtures.clerk[key], id: 'replacement' } as any);
      await acceptInvitation();
      await acceptSuggestion();
      expect(invitation.accept).not.toHaveBeenCalled();
      expect(suggestion.accept).not.toHaveBeenCalled();
    },
  );

  it.each(['unmount', 'account change'] as const)('stops invitation follow-up after %s', async change => {
    const { result, fixtures, invitation, unmount } = await setup();
    const deferred = createDeferredPromise<typeof invitation>();
    invitation.accept = vi.fn().mockReturnValue(deferred.promise);
    const request = result.current.invitations[0].accept();
    if (change === 'unmount') {
      unmount();
    } else {
      vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'replacement' });
    }
    deferred.resolve({ ...invitation, status: 'accepted' });
    await expect(request).resolves.toBeUndefined();
    expect(fixtures.clerk.getOrganization).not.toHaveBeenCalled();
  });

  it('does not return a membership after the source closes during organization lookup', async () => {
    const { result, fixtures, invitation, unmount } = await setup();
    invitation.accept = vi.fn().mockResolvedValue({ ...invitation, status: 'accepted' });
    const organization = createFakeOrganization({
      id: 'org_1',
      name: 'Invited organization',
      slug: 'invited',
      membersCount: 1,
      pendingInvitationsCount: 0,
      adminDeleteEnabled: false,
      maxAllowedMemberships: 3,
    });
    const deferred = createDeferredPromise<typeof organization>();
    fixtures.clerk.getOrganization.mockReturnValue(deferred.promise);
    const request = result.current.invitations[0].accept();
    await waitFor(() => expect(fixtures.clerk.getOrganization).toHaveBeenCalledWith('org_1'));
    unmount();
    deferred.resolve(organization);
    await expect(request).resolves.toBeUndefined();
  });

  it.each(['invitation', 'suggestion'] as const)('suppresses a late %s failure after source closure', async kind => {
    const { result, invitation, suggestion, unmount } = await setup();
    const deferred = createDeferredPromise<never>();
    const resource = kind === 'invitation' ? invitation : suggestion;
    resource.accept = vi.fn().mockReturnValue(deferred.promise);
    const command = kind === 'invitation' ? result.current.invitations[0].accept : result.current.suggestions[0].accept;
    const request = command();
    unmount();
    deferred.reject(failure());
    await expect(request).resolves.toBeUndefined();
  });

  it.each(['invitation', 'suggestion'] as const)('keeps a live %s failure available to the controller', async kind => {
    const { result, invitation, suggestion } = await setup();
    const error = failure();
    const resource = kind === 'invitation' ? invitation : suggestion;
    resource.accept = vi.fn().mockRejectedValue(error);
    const command = kind === 'invitation' ? result.current.invitations[0].accept : result.current.suggestions[0].accept;
    await expect(command()).rejects.toBe(error);
  });
});

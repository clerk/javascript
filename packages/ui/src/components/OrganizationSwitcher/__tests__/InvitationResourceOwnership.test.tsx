import { createDeferredPromise } from '@clerk/shared/utils';
import { type PropsWithChildren, StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, renderHook, waitFor } from '@/test/utils';
import { AcceptedInvitationsProvider, useAcceptedInvitations } from '@/ui/contexts';
import { withCardStateProvider } from '@/ui/elements/contexts';
import { useInvitationAcceptanceController } from '@/ui/hooks/useInvitationAcceptanceController';

import { OrganizationSwitcher } from '..';
import { useOrganizationSwitcherInvitationsModel } from '../organization-switcher-invitations.model';
import { createFakeUserOrganizationInvitation, createFakeUserOrganizationSuggestion } from './test-utils';

const { createFixtures } = bindCreateFixtures('OrganizationSwitcher');
const CardBoundary = withCardStateProvider(({ children }: PropsWithChildren) => <>{children}</>);

async function setup() {
  const { wrapper, fixtures } = await createFixtures(f => {
    f.withOrganizations();
    f.withUser({ email_addresses: ['first@clerk.com'] });
  });
  const invitation = createFakeUserOrganizationInvitation({
    id: 'invitation_first',
    emailAddress: 'first@clerk.com',
    publicOrganizationData: { id: 'org_first', name: 'First organization' },
  });
  const suggestion = createFakeUserOrganizationSuggestion({
    id: 'suggestion_first',
    emailAddress: 'first@clerk.com',
    publicOrganizationData: { id: 'org_suggested', name: 'Suggested organization' },
  });
  fixtures.clerk.user?.getOrganizationInvitations.mockResolvedValue({ data: [invitation], total_count: 1 });
  fixtures.clerk.user?.getOrganizationSuggestions.mockResolvedValue({ data: [suggestion], total_count: 1 });
  fixtures.clerk.getOrganization.mockResolvedValue({ id: 'org_first', name: 'First organization' });
  const FixtureWrapper = wrapper;
  const wrapped = ({ children }: PropsWithChildren) => (
    <FixtureWrapper>
      <AcceptedInvitationsProvider>
        <CardBoundary>{children}</CardBoundary>
      </AcceptedInvitationsProvider>
    </FixtureWrapper>
  );
  const select = vi.fn();
  const hook = renderHook(
    () => ({ model: useOrganizationSwitcherInvitationsModel(select), accepted: useAcceptedInvitations() }),
    { wrapper: wrapped },
  );
  await waitFor(() => expect(hook.result.current.model.invitations).toHaveLength(1));
  await waitFor(() => expect(hook.result.current.model.suggestions).toHaveLength(1));
  return { ...hook, invitation, suggestion, fixtures, select, wrapped };
}

describe('Organization invitation resource ownership', () => {
  it('does not return an organization fetched after the switcher root closes', async () => {
    const { result, invitation, fixtures, unmount } = await setup();
    vi.mocked(invitation.accept).mockResolvedValueOnce({ ...invitation, status: 'accepted' });
    const deferred = createDeferredPromise<Awaited<ReturnType<typeof fixtures.clerk.getOrganization>>>();
    fixtures.clerk.getOrganization.mockReturnValueOnce(deferred.promise);
    const pending = result.current.model.invitations[0].accept();
    await waitFor(() => expect(fixtures.clerk.getOrganization).toHaveBeenCalledOnce());
    unmount();
    deferred.resolve({ id: 'org_first', name: 'First organization' } as Awaited<
      ReturnType<typeof fixtures.clerk.getOrganization>
    >);
    expect(await pending).toBeUndefined();
  });

  it.each(['invitation', 'suggestion'] as const)(
    'ignores a late %s failure after the switcher root closes',
    async kind => {
      const { result, invitation, suggestion, unmount } = await setup();
      const deferred = createDeferredPromise<never>();
      vi.mocked((kind === 'invitation' ? invitation : suggestion).accept).mockReturnValueOnce(deferred.promise);
      const pending =
        kind === 'invitation'
          ? result.current.model.invitations[0].accept()
          : result.current.model.suggestions[0].accept();
      unmount();
      deferred.reject(new Error('Late acceptance failure'));
      await expect(pending).resolves.toBeUndefined();
    },
  );

  it('keeps one fallback organization per invitation and stores no invitation resource', async () => {
    const { result, invitation } = await setup();
    vi.mocked(invitation.accept).mockResolvedValue({ ...invitation, status: 'accepted' });
    const accept = result.current.model.invitations[0].accept;
    await act(async () => {
      await accept();
      await accept();
    });
    expect(result.current.accepted.acceptedInvitations).toHaveLength(1);
    expect(result.current.accepted.acceptedInvitations[0]).toEqual({
      invitationId: 'invitation_first',
      organization: { id: 'org_first', name: 'First organization' },
    });
  });

  it('copies display data and rejects a replaced organization', async () => {
    const { result, invitation, fixtures } = await setup();
    const row = result.current.model.invitations[0];
    invitation.publicOrganizationData.id = 'org_replaced';
    invitation.publicOrganizationData.name = 'Replaced organization';
    expect(row.organizationData.name).toBe('First organization');
    await act(async () => {
      expect(await row.accept()).toBeUndefined();
    });
    expect(invitation.accept).not.toHaveBeenCalled();
    expect(fixtures.clerk.getOrganization).not.toHaveBeenCalled();
  });

  it('rejects invitation acceptance after an account change before rendering', async () => {
    const { result, invitation, fixtures } = await setup();
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'user_changed' });
    await act(async () => {
      await result.current.model.invitations[0].accept();
    });
    expect(invitation.accept).not.toHaveBeenCalled();
  });

  it('stops account data updates after the switcher root closes', async () => {
    const { result, invitation, fixtures, unmount, select } = await setup();
    const deferred = createDeferredPromise<typeof invitation>();
    vi.mocked(invitation.accept).mockReturnValueOnce(deferred.promise);
    const pending = result.current.model.invitations[0].accept();
    unmount();
    deferred.resolve({ ...invitation, status: 'accepted' });
    const accepted = await pending;
    expect(fixtures.clerk.getOrganization).not.toHaveBeenCalled();
    expect(accepted).toBeUndefined();
    accepted?.onClick();
    expect(select).not.toHaveBeenCalled();
  });

  it('does not continue acceptance when the active account changes during the request', async () => {
    const { result, invitation, fixtures } = await setup();
    const deferred = createDeferredPromise<typeof invitation>();
    vi.mocked(invitation.accept).mockReturnValueOnce(deferred.promise);
    const pending = result.current.model.invitations[0].accept();
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'user_changed' });
    await act(async () => {
      deferred.resolve({ ...invitation, status: 'accepted' });
      await pending;
    });
    expect(fixtures.clerk.getOrganization).not.toHaveBeenCalled();
    expect(result.current.accepted.acceptedInvitations).toEqual([]);
  });

  it('does not store an organization when the session changes during lookup', async () => {
    const { result, invitation, fixtures } = await setup();
    vi.mocked(invitation.accept).mockResolvedValueOnce({ ...invitation, status: 'accepted' });
    const deferred = createDeferredPromise<Awaited<ReturnType<typeof fixtures.clerk.getOrganization>>>();
    fixtures.clerk.getOrganization.mockReturnValueOnce(deferred.promise);
    let pending = Promise.resolve<unknown>(undefined);
    act(() => {
      pending = result.current.model.invitations[0].accept();
    });
    await waitFor(() => expect(fixtures.clerk.getOrganization).toHaveBeenCalledOnce());
    vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue({ ...fixtures.clerk.session!, id: 'session_changed' });
    await act(async () => {
      deferred.resolve({ id: 'org_first', name: 'First organization' } as Awaited<
        ReturnType<typeof fixtures.clerk.getOrganization>
      >);
      await pending;
    });
    expect(result.current.accepted.acceptedInvitations).toEqual([]);
  });

  it.each(['account', 'session'] as const)('selects by ID and resets accepted data on a %s change', async kind => {
    const { result, invitation, fixtures, select, rerender } = await setup();
    vi.mocked(invitation.accept).mockResolvedValueOnce({ ...invitation, status: 'accepted' });
    let acceptedClick: (() => unknown) | undefined;
    await act(async () => {
      const accepted = await result.current.model.invitations[0].accept();
      acceptedClick = accepted?.onClick;
      acceptedClick?.();
    });
    expect(select).toHaveBeenCalledWith('org_first');
    expect(result.current.accepted.acceptedInvitations).toHaveLength(1);
    if (kind === 'session') {
      const session = { ...fixtures.clerk.session!, id: 'session_changed' };
      vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue(session);
      fixtures.clerk.__internal_lastEmittedResources = { ...fixtures.clerk.__internal_lastEmittedResources!, session };
    } else {
      const user = { ...fixtures.clerk.user!, id: 'user_changed' };
      vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue(user);
      fixtures.clerk.__internal_lastEmittedResources = { ...fixtures.clerk.__internal_lastEmittedResources!, user };
    }
    rerender();
    expect(result.current.accepted.acceptedInvitations).toEqual([]);
    acceptedClick?.();
    expect(select).toHaveBeenCalledOnce();
  });

  it('shows and selects an invitation that finishes after the menu is reopened', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['first@clerk.com'] });
    });
    const invitation = createFakeUserOrganizationInvitation({
      id: 'invitation_first',
      emailAddress: 'first@clerk.com',
      publicOrganizationData: { id: 'org_first', name: 'First organization' },
    });
    const deferred = createDeferredPromise<typeof invitation>();
    vi.mocked(invitation.accept).mockReturnValueOnce(deferred.promise);
    fixtures.clerk.user?.getOrganizationInvitations.mockResolvedValue({ data: [invitation], total_count: 1 });
    fixtures.clerk.getOrganization.mockResolvedValue({ id: 'org_first', name: 'First organization' });
    fixtures.clerk.setActive.mockResolvedValue(undefined);
    const { getByRole, findByRole, getByText, queryByRole, userEvent } = render(
      <StrictMode>
        <OrganizationSwitcher />
      </StrictMode>,
      { wrapper },
    );
    await userEvent.click(getByRole('button', { name: 'Open organization switcher' }));
    await userEvent.click(await findByRole('button', { name: 'Join' }));
    expect(invitation.accept).toHaveBeenCalledOnce();
    await userEvent.keyboard('{Escape}');
    await userEvent.click(getByRole('button', { name: 'Open organization switcher' }));
    expect(await findByRole('button', { name: 'Join' })).not.toBeDisabled();
    await act(async () => {
      deferred.resolve({ ...invitation, status: 'accepted' });
      await deferred.promise;
    });
    await waitFor(() => expect(queryByRole('button', { name: 'Join' })).not.toBeInTheDocument());
    await userEvent.click(getByText('First organization'));
    expect(fixtures.clerk.setActive).toHaveBeenCalledWith(
      expect.objectContaining({ organization: expect.objectContaining({ id: 'org_first' }) }),
    );
  });

  it('updates a suggestion cache after the menu closes and reopens in Strict Mode', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['first@clerk.com'] });
    });
    const suggestion = createFakeUserOrganizationSuggestion({
      id: 'suggestion_first',
      emailAddress: 'first@clerk.com',
      publicOrganizationData: { id: 'org_first', name: 'Suggested organization' },
    });
    const deferred = createDeferredPromise<typeof suggestion>();
    vi.mocked(suggestion.accept).mockReturnValueOnce(deferred.promise);
    fixtures.clerk.user?.getOrganizationSuggestions.mockResolvedValue({ data: [suggestion], total_count: 1 });
    const { getByRole, findByRole, findByText, queryByRole, userEvent } = render(
      <StrictMode>
        <OrganizationSwitcher />
      </StrictMode>,
      { wrapper },
    );
    await userEvent.click(getByRole('button', { name: 'Open organization switcher' }));
    await userEvent.click(await findByRole('button', { name: 'Request to join' }));
    expect(suggestion.accept).toHaveBeenCalledOnce();
    await userEvent.keyboard('{Escape}');
    await userEvent.click(getByRole('button', { name: 'Open organization switcher' }));
    expect(await findByRole('button', { name: 'Request to join' })).not.toBeDisabled();
    await act(async () => {
      deferred.resolve({ ...suggestion, status: 'accepted' });
      await deferred.promise;
    });
    expect(await findByText('Pending approval')).toBeVisible();
    expect(queryByRole('button', { name: 'Request to join' })).not.toBeInTheDocument();
  });

  it('rejects suggestion acceptance after a session change before rendering', async () => {
    const { result, suggestion, fixtures } = await setup();
    vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue({ ...fixtures.clerk.session!, id: 'session_changed' });
    await act(async () => {
      await result.current.model.suggestions[0].accept();
    });
    expect(suggestion.accept).not.toHaveBeenCalled();
  });

  it('rejects retained invitation and suggestion actions after the Clerk client changes', async () => {
    const { result, invitation, suggestion, fixtures } = await setup();
    vi.mocked(invitation.accept).mockResolvedValueOnce({ ...invitation, status: 'accepted' });
    vi.mocked(suggestion.accept).mockResolvedValueOnce({ ...suggestion, status: 'accepted' });
    vi.spyOn(fixtures.clerk, 'client', 'get').mockReturnValue({
      ...fixtures.clerk.client,
      id: 'client_changed',
    } as never);
    await act(async () => {
      await result.current.model.invitations[0].accept();
      await result.current.model.suggestions[0].accept();
    });
    expect(invitation.accept).not.toHaveBeenCalled();
    expect(suggestion.accept).not.toHaveBeenCalled();
  });

  it('does not continue invitation acceptance after the Clerk client changes', async () => {
    const { result, invitation, fixtures } = await setup();
    const deferred = createDeferredPromise<typeof invitation>();
    vi.mocked(invitation.accept).mockReturnValueOnce(deferred.promise);
    const pending = result.current.model.invitations[0].accept();
    vi.spyOn(fixtures.clerk, 'client', 'get').mockReturnValue({
      ...fixtures.clerk.client,
      id: 'client_changed',
    } as never);
    await act(async () => {
      deferred.resolve({ ...invitation, status: 'accepted' });
      await pending;
    });
    expect(fixtures.clerk.getOrganization).not.toHaveBeenCalled();
    expect(result.current.accepted.acceptedInvitations).toEqual([]);
  });

  it('clears accepted SDK resources when the Clerk client changes', async () => {
    const { result, invitation, fixtures, rerender, select } = await setup();
    vi.mocked(invitation.accept).mockResolvedValueOnce({ ...invitation, status: 'accepted' });
    let acceptedClick: (() => unknown) | undefined;
    await act(async () => {
      acceptedClick = (await result.current.model.invitations[0].accept())?.onClick;
    });
    expect(result.current.accepted.acceptedInvitations).toHaveLength(1);
    vi.spyOn(fixtures.clerk, 'client', 'get').mockReturnValue({
      ...fixtures.clerk.client,
      id: 'client_changed',
    } as never);
    rerender();
    expect(result.current.accepted.acceptedInvitations).toEqual([]);
    acceptedClick?.();
    expect(select).not.toHaveBeenCalled();
  });

  it('starts one suggestion request when acceptance is requested twice', async () => {
    const { suggestion, wrapped } = await setup();
    const deferred = createDeferredPromise<typeof suggestion>();
    vi.mocked(suggestion.accept).mockReturnValueOnce(deferred.promise);
    const hook = renderHook(
      () => {
        const model = useOrganizationSwitcherInvitationsModel(vi.fn());
        return useInvitationAcceptanceController(model.suggestions[0]?.accept ?? (async () => {}));
      },
      { wrapper: wrapped },
    );
    let first = Promise.resolve();
    let second = Promise.resolve();
    act(() => {
      first = hook.result.current.onAccept();
      second = hook.result.current.onAccept();
    });
    expect(first).toBe(second);
    expect(suggestion.accept).toHaveBeenCalledOnce();
    await act(async () => {
      deferred.resolve({ ...suggestion, status: 'accepted' });
      await first;
    });
  });
});

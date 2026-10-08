import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, waitFor } from '@/test/utils';
import { withCardStateProvider } from '@/ui/elements/contexts';

import { UserInvitationSuggestionList } from '../UserInvitationSuggestionList';
import { UserMembershipList } from '../UserMembershipList';
import {
  createFakeUserOrganizationInvitation,
  createFakeUserOrganizationMembership,
  createFakeUserOrganizationSuggestion,
} from './test-utils';

const { createFixtures } = bindCreateFixtures('OrganizationSwitcher');
const CardBoundary = withCardStateProvider(({ children }: PropsWithChildren) => <>{children}</>);
afterEach(() => vi.unstubAllGlobals());

describe('Organization list pagination', () => {
  it.each(['memberships', 'invitations', 'suggestions'] as const)(
    'observes the %s spinner and fetches the next page',
    async kind => {
      const observers: {
        notify: () => void;
        observe: ReturnType<typeof vi.fn>;
        disconnect: ReturnType<typeof vi.fn>;
      }[] = [];
      vi.stubGlobal(
        'IntersectionObserver',
        class {
          observe = vi.fn();
          disconnect = vi.fn();
          constructor(callback: IntersectionObserverCallback) {
            observers.push({
              observe: this.observe,
              disconnect: this.disconnect,
              notify: () =>
                callback(
                  [{ isIntersecting: true, intersectionRatio: 1 } as IntersectionObserverEntry],
                  this as unknown as IntersectionObserver,
                ),
            });
          }
        },
      );
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({ email_addresses: ['first@clerk.com'] });
      });
      const user = fixtures.clerk.user;
      if (!user) {
        throw new Error('Missing fixture user');
      }
      user.getOrganizationMemberships.mockResolvedValue({ data: [], total_count: 0 });
      user.getOrganizationInvitations.mockResolvedValue({ data: [], total_count: 0 });
      user.getOrganizationSuggestions.mockResolvedValue({ data: [], total_count: 0 });
      const organizationData = { id: 'org_first', name: 'First organization' };
      const membership = createFakeUserOrganizationMembership({
        id: 'membership_first',
        organization: {
          ...organizationData,
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
        publicOrganizationData: organizationData,
      });
      const suggestion = createFakeUserOrganizationSuggestion({
        id: 'suggestion_first',
        emailAddress: 'first@clerk.com',
        publicOrganizationData: organizationData,
      });
      const fetch =
        kind === 'memberships'
          ? user.getOrganizationMemberships
          : kind === 'invitations'
            ? user.getOrganizationInvitations
            : user.getOrganizationSuggestions;
      const item = kind === 'memberships' ? membership : kind === 'invitations' ? invitation : suggestion;
      fetch
        .mockResolvedValueOnce({ data: [item], total_count: 11 })
        .mockResolvedValueOnce({ data: [item], total_count: 11 });
      const lists = () => (
        <CardBoundary>
          {kind === 'memberships' ? (
            <UserMembershipList
              onOrganizationClick={vi.fn()}
              onPersonalWorkspaceClick={vi.fn()}
            />
          ) : (
            <UserInvitationSuggestionList onOrganizationClick={vi.fn()} />
          )}
        </CardBoundary>
      );
      const { findByText, unmount, rerender } = render(lists(), { wrapper });
      await findByText('First organization');
      await waitFor(() =>
        expect(observers.some(observer => observer.observe.mock.calls.some(([node]) => node.isConnected))).toBe(true),
      );
      const observer = observers.findLast(observer => observer.observe.mock.calls.some(([node]) => node.isConnected));
      if (!observer) {
        throw new Error('Missing pagination observer');
      }
      const session = fixtures.clerk.session;
      const sessionGetter = vi
        .spyOn(fixtures.clerk, 'session', 'get')
        .mockReturnValue({ ...session, id: 'session_changed' });
      act(() => observer.notify());
      expect(fetch).toHaveBeenCalledTimes(1);
      sessionGetter.mockRestore();
      const clientGetter = vi.spyOn(fixtures.clerk, 'client', 'get').mockReturnValue({
        ...fixtures.clerk.client,
        id: 'client_changed',
      } as never);
      act(() => observer.notify());
      expect(fetch).toHaveBeenCalledTimes(1);
      clientGetter.mockRestore();
      rerender(lists());
      act(() => observer.notify());
      await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
      expect(fetch).toHaveBeenLastCalledWith(expect.objectContaining({ initialPage: 2, pageSize: 10 }));
      unmount();
      expect(observer.disconnect).toHaveBeenCalled();
      act(() => observer.notify());
      expect(fetch).toHaveBeenCalledTimes(2);
    },
  );
});

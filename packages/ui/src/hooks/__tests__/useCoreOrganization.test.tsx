import { useOrganization } from '@clerk/shared/react';
import { createDeferredPromise } from '@clerk/shared/utils/index';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook, waitFor } from '@/test/utils';
import {
  createFakeDomain,
  createFakeOrganizationInvitation,
  createFakeOrganizationMembershipRequest,
} from '@/ui/components/OrganizationProfile/__tests__/utils';
import { createFakeUserOrganizationMembership } from '@/ui/components/OrganizationSwitcher/__tests__/test-utils';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

const defaultRenderer = () =>
  useOrganization({
    domains: {
      pageSize: 2,
    },
    invitations: {
      pageSize: 2,
    },
    membershipRequests: {
      pageSize: 2,
    },
    memberships: {
      pageSize: 2,
    },
  });

const undefinedPaginatedResource = {
  data: [],
  count: 0,
  isLoading: false,
  isFetching: false,
  isError: false,
  page: 1,
  pageCount: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

describe('useOrganization', () => {
  it('returns default values', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
      });
    });

    const { result } = renderHook(() => useOrganization(), { wrapper });

    expect(result.current.isLoaded).toBe(true);
    expect(result.current.organization).toBeDefined();
    expect(result.current.organization).not.toBeNull();
    expect(result.current.organization).toEqual(
      expect.objectContaining({
        name: 'Org1',
        id: 'Org1',
      }),
    );

    expect(result.current.memberships).toEqual(expect.objectContaining(undefinedPaginatedResource));
    expect(result.current.domains).toEqual(expect.objectContaining(undefinedPaginatedResource));
    expect(result.current.membershipRequests).toEqual(expect.objectContaining(undefinedPaginatedResource));

    expect(fixtures.clerk.organization?.getMemberships).not.toHaveBeenCalled();
    expect(fixtures.clerk.organization?.getDomains).not.toHaveBeenCalled();
    expect(fixtures.clerk.organization?.getMembershipRequests).not.toHaveBeenCalled();
    expect(fixtures.clerk.organization?.getInvitations).not.toHaveBeenCalled();
  });

  it('returns null when a organization is not active', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
      });
    });

    const { result } = renderHook(() => useOrganization(), { wrapper });

    expect(result.current.isLoaded).toBe(true);
    expect(result.current.organization).toBeNull();

    expect(result.current.memberships).toBeNull();
    expect(result.current.domains).toBeNull();
    expect(result.current.membershipRequests).toBeNull();

    expect(fixtures.clerk.organization).toBeNull();
  });

  describe('memberships', () => {
    it('fetch with pages', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
        });
      });

      fixtures.clerk.organization?.getDomains.mockRejectedValue(null);
      fixtures.clerk.organization?.getMembershipRequests.mockRejectedValue(null);
      fixtures.clerk.organization?.getInvitations.mockRejectedValue(null);

      fixtures.clerk.organization?.getMemberships.mockReturnValue(
        Promise.resolve({
          data: [
            createFakeUserOrganizationMembership({
              id: '1',
              organization: {
                id: '1',
                name: 'Org1',
                slug: 'org1',
                membersCount: 1,
                adminDeleteEnabled: false,
                maxAllowedMemberships: 0,
                pendingInvitationsCount: 1,
              },
            }),
            createFakeUserOrganizationMembership({
              id: '2',
              organization: {
                id: '2',
                name: 'Org2',
                slug: 'org2',
                membersCount: 1,
                adminDeleteEnabled: false,
                maxAllowedMemberships: 0,
                pendingInvitationsCount: 1,
              },
            }),
          ],
          total_count: 4,
        }),
      );
      const { result } = renderHook(defaultRenderer, { wrapper });

      expect(result.current.memberships).not.toBeNull();
      expect(result.current.memberships?.isLoading).toBe(true);
      expect(result.current.memberships?.isFetching).toBe(true);
      expect(result.current.memberships?.count).toBe(0);

      await waitFor(() => expect(result.current.memberships?.isLoading).toBe(false));
      expect(fixtures.clerk.organization?.getMemberships).toHaveBeenCalledTimes(1);
      expect(fixtures.clerk.organization?.getMemberships.mock.calls[0][0]).toStrictEqual({
        initialPage: 1,
        pageSize: 2,
        role: undefined,
        query: undefined,
      });

      expect(result.current.memberships?.count).toBe(4);
      expect(result.current.memberships?.page).toBe(1);
      expect(result.current.memberships?.pageCount).toBe(2);
      expect(result.current.memberships?.hasNextPage).toBe(true);
      expect(result.current.memberships?.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: '1',
          }),
          expect.objectContaining({
            id: '2',
          }),
        ]),
      );

      fixtures.clerk.organization?.getMemberships.mockReturnValue(
        Promise.resolve({
          data: [
            createFakeUserOrganizationMembership({
              id: '3',
              organization: {
                id: '3',
                name: 'Org3',
                slug: 'org3',
                membersCount: 1,
                adminDeleteEnabled: false,
                maxAllowedMemberships: 0,
                pendingInvitationsCount: 1,
              },
            }),
            createFakeUserOrganizationMembership({
              id: '4',
              organization: {
                id: '4',
                name: 'Org4',
                slug: 'org4',
                membersCount: 1,
                adminDeleteEnabled: false,
                maxAllowedMemberships: 0,
                pendingInvitationsCount: 1,
              },
            }),
          ],
          total_count: 4,
        }),
      );

      act(() => result.current.memberships?.fetchNext?.());

      await waitFor(() => expect(result.current.memberships?.isLoading).toBe(true));
      await waitFor(() => expect(result.current.memberships?.isLoading).toBe(false));
      expect(fixtures.clerk.organization?.getMemberships).toHaveBeenCalledTimes(2);
      expect(fixtures.clerk.organization?.getMemberships.mock.calls[1][0]).toStrictEqual({
        initialPage: 2,
        pageSize: 2,
        role: undefined,
        query: undefined,
      });

      expect(result.current.memberships?.page).toBe(2);
      expect(result.current.memberships?.hasNextPage).toBe(false);
      expect(result.current.memberships?.data).toEqual(
        expect.arrayContaining([
          expect.not.objectContaining({
            id: '1',
          }),
          expect.not.objectContaining({
            id: '2',
          }),
          expect.objectContaining({
            id: '3',
          }),
          expect.objectContaining({
            id: '4',
          }),
        ]),
      );
    });
  });

  describe('domains', () => {
    it('fetch with pages', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
        });
      });

      fixtures.clerk.organization?.getMemberships.mockRejectedValue(null);
      fixtures.clerk.organization?.getMembershipRequests.mockRejectedValue(null);
      fixtures.clerk.organization?.getInvitations.mockRejectedValue(null);

      fixtures.clerk.organization?.getDomains.mockReturnValue(
        Promise.resolve({
          data: [
            createFakeDomain({
              id: '1',
              name: 'one.dev',
              organizationId: '1',
            }),
            createFakeDomain({
              id: '2',
              name: 'two.dev',
              organizationId: '2',
            }),
          ],
          total_count: 4,
        }),
      );
      const { result } = renderHook(defaultRenderer, { wrapper });
      expect(result.current.domains?.isLoading).toBe(true);
      expect(result.current.domains?.isFetching).toBe(true);
      expect(result.current.domains?.count).toBe(0);

      await waitFor(() => expect(result.current.domains?.isLoading).toBe(false));
      expect(fixtures.clerk.organization?.getDomains).toHaveBeenCalledTimes(1);
      expect(fixtures.clerk.organization?.getDomains.mock.calls[0][0]).toStrictEqual({
        initialPage: 1,
        pageSize: 2,
        enrollmentMode: undefined,
      });

      expect(result.current.domains?.isLoading).toBe(false);
      expect(result.current.domains?.count).toBe(4);
      expect(result.current.domains?.page).toBe(1);
      expect(result.current.domains?.pageCount).toBe(2);
      expect(result.current.domains?.hasNextPage).toBe(true);
      expect(result.current.domains?.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: '1',
            name: 'one.dev',
          }),
          expect.objectContaining({
            id: '2',
            name: 'two.dev',
          }),
        ]),
      );

      fixtures.clerk.organization?.getDomains.mockReturnValue(
        Promise.resolve({
          data: [
            createFakeDomain({
              id: '3',
              name: 'three.dev',
              organizationId: '3',
            }),
            createFakeDomain({
              id: '4',
              name: 'four.dev',
              organizationId: '4',
            }),
          ],
          total_count: 4,
        }),
      );

      act(() => result.current.domains?.fetchNext?.());

      await waitFor(() => expect(result.current.domains?.isLoading).toBe(true));
      await waitFor(() => expect(result.current.domains?.isLoading).toBe(false));
      expect(fixtures.clerk.organization?.getDomains).toHaveBeenCalledTimes(2);
      expect(fixtures.clerk.organization?.getDomains.mock.calls[1][0]).toStrictEqual({
        initialPage: 2,
        pageSize: 2,
        enrollmentMode: undefined,
      });

      expect(result.current.domains?.page).toBe(2);
      expect(result.current.domains?.hasNextPage).toBe(false);
      expect(result.current.domains?.data).toEqual(
        expect.arrayContaining([
          expect.not.objectContaining({
            id: '1',
          }),
          expect.not.objectContaining({
            id: '2',
          }),
          expect.objectContaining({
            id: '3',
          }),
          expect.objectContaining({
            id: '4',
          }),
        ]),
      );
    });
  });

  describe('membershipRequests', () => {
    it('fetch with pages', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
        });
      });

      fixtures.clerk.organization?.getMemberships.mockRejectedValue(null);
      fixtures.clerk.organization?.getDomains.mockRejectedValue(null);
      fixtures.clerk.organization?.getInvitations.mockRejectedValue(null);

      fixtures.clerk.organization?.getMembershipRequests.mockReturnValue(
        Promise.resolve({
          data: [
            createFakeOrganizationMembershipRequest({
              id: '1',
              organizationId: '1',
              publicUserData: {
                userId: 'test_user1',
                identifier: 'test1@clerk.com',
              },
            }),
            createFakeOrganizationMembershipRequest({
              id: '2',
              organizationId: '1',
              publicUserData: {
                userId: 'test_user2',
                identifier: 'test2@clerk.com',
              },
            }),
          ],
          total_count: 4,
        }),
      );
      const { result } = renderHook(defaultRenderer, { wrapper });
      expect(result.current.membershipRequests?.isLoading).toBe(true);
      expect(result.current.membershipRequests?.isFetching).toBe(true);
      expect(result.current.membershipRequests?.count).toBe(0);

      await waitFor(() => expect(result.current.membershipRequests?.isLoading).toBe(false));
      expect(fixtures.clerk.organization?.getMembershipRequests).toHaveBeenCalledTimes(1);
      expect(fixtures.clerk.organization?.getMembershipRequests.mock.calls[0][0]).toStrictEqual({
        initialPage: 1,
        pageSize: 2,
        status: 'pending',
      });

      expect(result.current.membershipRequests?.isFetching).toBe(false);
      expect(result.current.membershipRequests?.count).toBe(4);
      expect(result.current.membershipRequests?.page).toBe(1);
      expect(result.current.membershipRequests?.pageCount).toBe(2);
      expect(result.current.membershipRequests?.hasNextPage).toBe(true);

      fixtures.clerk.organization?.getMembershipRequests.mockReturnValue(
        Promise.resolve({
          data: [
            createFakeOrganizationMembershipRequest({
              id: '3',
              organizationId: '1',
              publicUserData: {
                userId: 'test_user3',
                identifier: 'test3@clerk.com',
              },
            }),
            createFakeOrganizationMembershipRequest({
              id: '4',
              organizationId: '1',
              publicUserData: {
                userId: 'test_user4',
                identifier: 'test4@clerk.com',
              },
            }),
          ],
          total_count: 4,
        }),
      );

      act(() => result.current.membershipRequests?.fetchNext?.());

      await waitFor(() => expect(result.current.membershipRequests?.isLoading).toBe(true));
      await waitFor(() => expect(result.current.membershipRequests?.isLoading).toBe(false));
      expect(fixtures.clerk.organization?.getMembershipRequests).toHaveBeenCalledTimes(2);
      expect(fixtures.clerk.organization?.getMembershipRequests.mock.calls[1][0]).toStrictEqual({
        initialPage: 2,
        pageSize: 2,
        status: 'pending',
      });

      expect(result.current.membershipRequests?.page).toBe(2);
      expect(result.current.membershipRequests?.hasNextPage).toBe(false);
      expect(result.current.membershipRequests?.data).toEqual(
        expect.arrayContaining([
          expect.not.objectContaining({
            id: '1',
          }),
          expect.not.objectContaining({
            id: '2',
          }),
          expect.objectContaining({
            organizationId: '1',
            id: '3',
            publicUserData: expect.objectContaining({
              userId: 'test_user3',
            }),
          }),
          expect.objectContaining({
            organizationId: '1',
            id: '4',
            publicUserData: expect.objectContaining({
              userId: 'test_user4',
            }),
          }),
        ]),
      );
    });
  });

  describe('invitations', () => {
    it('fetch with pages', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
        });
      });

      fixtures.clerk.organization?.getMemberships.mockRejectedValue(null);
      fixtures.clerk.organization?.getDomains.mockRejectedValue(null);
      fixtures.clerk.organization?.getMembershipRequests.mockRejectedValue(null);

      fixtures.clerk.organization?.getInvitations.mockReturnValue(
        Promise.resolve({
          data: [
            createFakeOrganizationInvitation({
              id: '1',
              emailAddress: 'admin1@clerk.com',
              organizationId: '1',
              createdAt: new Date('2022-01-01'),
            }),
            createFakeOrganizationInvitation({
              id: '2',
              emailAddress: 'member2@clerk.com',
              organizationId: '1',
              createdAt: new Date('2022-01-01'),
            }),
          ],
          total_count: 4,
        }),
      );
      const { result } = renderHook(defaultRenderer, { wrapper });
      expect(result.current.invitations?.isLoading).toBe(true);
      expect(result.current.invitations?.isFetching).toBe(true);
      expect(result.current.invitations?.count).toBe(0);

      await waitFor(() => expect(result.current.invitations?.isLoading).toBe(false));
      expect(fixtures.clerk.organization?.getInvitations).toHaveBeenCalledTimes(1);
      expect(fixtures.clerk.organization?.getInvitations.mock.calls[0][0]).toStrictEqual({
        initialPage: 1,
        pageSize: 2,
        status: ['pending'],
      });

      expect(result.current.invitations?.isFetching).toBe(false);
      expect(result.current.invitations?.count).toBe(4);
      expect(result.current.invitations?.page).toBe(1);
      expect(result.current.invitations?.pageCount).toBe(2);
      expect(result.current.invitations?.hasNextPage).toBe(true);

      fixtures.clerk.organization?.getInvitations.mockReturnValue(
        Promise.resolve({
          data: [
            createFakeOrganizationInvitation({
              id: '3',
              emailAddress: 'admin3@clerk.com',
              organizationId: '1',
              createdAt: new Date('2022-01-01'),
            }),
            createFakeOrganizationInvitation({
              id: '4',
              emailAddress: 'member4@clerk.com',
              organizationId: '1',
              createdAt: new Date('2022-01-01'),
            }),
          ],
          total_count: 4,
        }),
      );

      act(() => result.current.invitations?.fetchNext?.());

      await waitFor(() => expect(result.current.invitations?.isLoading).toBe(true));
      await waitFor(() => expect(result.current.invitations?.isLoading).toBe(false));
      expect(fixtures.clerk.organization?.getInvitations).toHaveBeenCalledTimes(2);
      expect(fixtures.clerk.organization?.getInvitations.mock.calls[1][0]).toStrictEqual({
        initialPage: 2,
        pageSize: 2,
        status: ['pending'],
      });

      expect(result.current.invitations?.page).toBe(2);
      expect(result.current.invitations?.hasNextPage).toBe(false);
      expect(result.current.invitations?.data).toEqual(
        expect.arrayContaining([
          expect.not.objectContaining({
            id: '1',
          }),
          expect.not.objectContaining({
            id: '2',
          }),
          expect.objectContaining({
            organizationId: '1',
            id: '3',
            emailAddress: 'admin3@clerk.com',
          }),
          expect.objectContaining({
            organizationId: '1',
            id: '4',
            emailAddress: 'member4@clerk.com',
          }),
        ]),
      );
    });

    it('infinite fetch', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
        });
      });

      fixtures.clerk.organization?.getInvitations.mockReturnValueOnce(
        Promise.resolve({
          data: [
            createFakeOrganizationInvitation({
              id: '1',
              emailAddress: 'admin1@clerk.com',
              organizationId: '1',
              createdAt: new Date('2022-01-01'),
            }),
            createFakeOrganizationInvitation({
              id: '2',
              emailAddress: 'member2@clerk.com',
              organizationId: '1',
              createdAt: new Date('2022-01-01'),
            }),
          ],
          total_count: 4,
        }),
      );
      const { result } = renderHook(
        () =>
          useOrganization({
            invitations: {
              pageSize: 2,
              infinite: true,
            },
          }),
        { wrapper },
      );
      expect(result.current.invitations?.isLoading).toBe(true);
      expect(result.current.invitations?.isFetching).toBe(true);

      await waitFor(() => expect(result.current.invitations?.isLoading).toBe(false));
      expect(result.current.invitations?.isFetching).toBe(false);
      expect(fixtures.clerk.organization?.getInvitations).toHaveBeenCalledTimes(1);
      expect(fixtures.clerk.organization?.getInvitations.mock.calls[0][0]).toStrictEqual({
        initialPage: 1,
        pageSize: 2,
        status: ['pending'],
      });

      const deferred = createDeferredPromise();

      fixtures.clerk.organization?.getInvitations.mockReturnValueOnce(deferred.promise);
      act(() => result.current.invitations?.fetchNext?.());

      await waitFor(() => expect(result.current.invitations?.isFetching).toBe(true));
      expect(result.current.invitations?.isLoading).toBe(false);

      deferred.resolve({
        data: [
          createFakeOrganizationInvitation({
            id: '3',
            emailAddress: 'admin3@clerk.com',
            organizationId: '1',
            createdAt: new Date('2022-01-01'),
          }),
          createFakeOrganizationInvitation({
            id: '4',
            emailAddress: 'member4@clerk.com',
            organizationId: '1',
            createdAt: new Date('2022-01-01'),
          }),
        ],
        total_count: 4,
      });

      await waitFor(() => expect(result.current.invitations?.isFetching).toBe(false));
      const organizationInvitationParams = fixtures.clerk.organization?.getInvitations.mock.calls.map(
        ([params]) => params,
      );
      organizationInvitationParams.forEach(params => {
        expect(Object.keys(params).sort()).toEqual(['initialPage', 'pageSize', 'status']);
        expect(params.pageSize).toBe(2);
        expect(params.status).toEqual(['pending']);
      });
      expect(organizationInvitationParams.some(params => params.initialPage === 2)).toBe(true);

      expect(result.current.invitations?.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: '1',
          }),
          expect.objectContaining({
            id: '2',
          }),
          expect.objectContaining({
            id: '3',
          }),
          expect.objectContaining({
            id: '4',
          }),
        ]),
      );
    });
  });
});

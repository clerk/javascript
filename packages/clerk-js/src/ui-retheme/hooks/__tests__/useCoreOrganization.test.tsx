import { describe } from '@jest/globals';

import { act, bindCreateFixtures, renderHook, waitFor } from '../../../testUtils';
import {
  createFakeDomain,
  createFakeOrganizationMembershipRequest,
} from '../../components/OrganizationProfile/__tests__/utils';
import { createFakeUserOrganizationMembership } from '../../components/OrganizationSwitcher/__tests__/utlis';
import { useCoreOrganization } from '../../contexts';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

const defaultRenderer = () =>
  useCoreOrganization({
    domains: {
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
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
      });
    });

    const { result } = renderHook(useCoreOrganization, { wrapper });

    expect(result.current.isLoaded).toBe(true);
    expect(result.current.organization).toBeDefined();
    expect(result.current.organization).not.toBeNull();
    expect(result.current.organization).toEqual(
      expect.objectContaining({
        name: 'Org1',
        id: 'Org1',
      }),
    );

    expect(result.current.invitationList).not.toBeDefined();
    expect(result.current.membershipList).not.toBeDefined();

    expect(result.current.memberships).toEqual(expect.objectContaining(undefinedPaginatedResource));
    expect(result.current.domains).toEqual(expect.objectContaining(undefinedPaginatedResource));
    expect(result.current.membershipRequests).toEqual(expect.objectContaining(undefinedPaginatedResource));
  });

  it('returns null when a organization is not active ', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
      });
    });

    const { result } = renderHook(useCoreOrganization, { wrapper });

    expect(result.current.isLoaded).toBe(true);
    expect(result.current.organization).toBeNull();

    expect(result.current.invitationList).toBeNull();
    expect(result.current.membershipList).toBeNull();

    expect(result.current.memberships).toBeNull();
    expect(result.current.domains).toBeNull();
    expect(result.current.membershipRequests).toBeNull();
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

      await waitFor(() => {
        expect(result.current.memberships?.isLoading).toBe(false);
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
      });

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

      act(() => {
        result.current.memberships?.fetchNext?.();
      });

      await waitFor(() => {
        expect(result.current.memberships?.isLoading).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.memberships?.isLoading).toBe(false);
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

      await waitFor(() => {
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
      });

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

      act(() => {
        result.current.domains?.fetchNext?.();
      });

      await waitFor(() => {
        expect(result.current.domains?.isLoading).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.domains?.isLoading).toBe(false);
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

      await waitFor(() => {
        expect(result.current.membershipRequests?.isLoading).toBe(false);
        expect(result.current.membershipRequests?.count).toBe(4);
        expect(result.current.membershipRequests?.page).toBe(1);
        expect(result.current.membershipRequests?.pageCount).toBe(2);
        expect(result.current.membershipRequests?.hasNextPage).toBe(true);
      });

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

      act(() => {
        result.current.membershipRequests?.fetchNext?.();
      });

      await waitFor(() => {
        expect(result.current.membershipRequests?.isLoading).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.membershipRequests?.isLoading).toBe(false);
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
  });
});

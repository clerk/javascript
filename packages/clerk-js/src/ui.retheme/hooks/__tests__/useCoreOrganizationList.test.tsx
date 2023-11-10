import { describe } from '@jest/globals';

import { act, bindCreateFixtures, renderHook, waitFor } from '../../../testUtils';
import {
  createFakeUserOrganizationInvitation,
  createFakeUserOrganizationMembership,
  createFakeUserOrganizationSuggestion,
} from '../../components/OrganizationSwitcher/__tests__/utlis';
import { useCoreOrganizationList } from '../../contexts';

const { createFixtures } = bindCreateFixtures('OrganizationSwitcher');

const defaultRenderer = () =>
  useCoreOrganizationList({
    userMemberships: {
      pageSize: 2,
    },
    userInvitations: {
      pageSize: 2,
    },
    userSuggestions: {
      pageSize: 2,
    },
  });

describe('useOrganizationList', () => {
  it('opens organization profile when "Manage Organization" is clicked', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
      });
    });

    const { result } = renderHook(useCoreOrganizationList, { wrapper });

    expect(result.current.isLoaded).toBe(true);
    expect(result.current.setActive).toBeDefined();
    expect(result.current.createOrganization).toBeDefined();
    expect(result.current.organizationList).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          membership: expect.objectContaining({
            role: 'basic_member',
          }),
        }),
      ]),
    );

    expect(result.current.userInvitations).toEqual(
      expect.objectContaining({
        data: [],
        count: 0,
        isLoading: false,
        isFetching: false,
        isError: false,
        page: 1,
        pageCount: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      }),
    );
  });

  describe('userMemberships', () => {
    it('fetch with pages', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
        });
      });

      fixtures.clerk.user?.getOrganizationMemberships.mockReturnValue(
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
      expect(result.current.userMemberships.isLoading).toBe(true);
      expect(result.current.userMemberships.isFetching).toBe(true);
      expect(result.current.userMemberships.count).toBe(0);

      await waitFor(() => {
        expect(result.current.userMemberships.isLoading).toBe(false);
        expect(result.current.userMemberships.count).toBe(4);
        expect(result.current.userMemberships.page).toBe(1);
        expect(result.current.userMemberships.pageCount).toBe(2);
        expect(result.current.userMemberships.hasNextPage).toBe(true);
      });

      fixtures.clerk.user?.getOrganizationMemberships.mockReturnValue(
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
        result.current.userMemberships.fetchNext?.();
      });

      await waitFor(() => {
        expect(result.current.userMemberships.isLoading).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.userMemberships.isLoading).toBe(false);
        expect(result.current.userMemberships.page).toBe(2);
        expect(result.current.userMemberships.hasNextPage).toBe(false);
        expect(result.current.userMemberships.data).toEqual(
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

    it('infinite fetch', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
        });
      });

      fixtures.clerk.user?.getOrganizationMemberships.mockReturnValue(
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
      const { result } = renderHook(
        () =>
          useCoreOrganizationList({
            userMemberships: {
              pageSize: 2,
              infinite: true,
            },
          }),
        { wrapper },
      );
      expect(result.current.userMemberships.isLoading).toBe(true);
      expect(result.current.userMemberships.isFetching).toBe(true);

      await waitFor(() => {
        expect(result.current.userMemberships.isLoading).toBe(false);
        expect(result.current.userMemberships.isFetching).toBe(false);
      });

      fixtures.clerk.user?.getOrganizationMemberships.mockReturnValueOnce(
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

      fixtures.clerk.user?.getOrganizationMemberships.mockReturnValueOnce(
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
        result.current.userMemberships.fetchNext?.();
      });

      await waitFor(() => {
        expect(result.current.userMemberships.isLoading).toBe(false);
        expect(result.current.userMemberships.isFetching).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.userMemberships.isFetching).toBe(false);
        expect(result.current.userMemberships.data).toEqual(
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

  describe('userInvitations', () => {
    it('fetch with pages', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
        });
      });

      fixtures.clerk.user?.getOrganizationInvitations.mockReturnValue(
        Promise.resolve({
          data: [
            createFakeUserOrganizationInvitation({
              id: '1',
              emailAddress: 'one@clerk.com',
            }),
            createFakeUserOrganizationInvitation({
              id: '2',
              emailAddress: 'two@clerk.com',
            }),
          ],
          total_count: 4,
        }),
      );
      const { result } = renderHook(defaultRenderer, { wrapper });
      expect(result.current.userInvitations.isLoading).toBe(true);
      expect(result.current.userInvitations.isFetching).toBe(true);
      expect(result.current.userInvitations.count).toBe(0);

      await waitFor(() => {
        expect(result.current.userInvitations.isLoading).toBe(false);
        expect(result.current.userInvitations.count).toBe(4);
        expect(result.current.userInvitations.page).toBe(1);
        expect(result.current.userInvitations.pageCount).toBe(2);
        expect(result.current.userInvitations.hasNextPage).toBe(true);
      });

      fixtures.clerk.user?.getOrganizationInvitations.mockReturnValue(
        Promise.resolve({
          data: [
            createFakeUserOrganizationInvitation({
              id: '3',
              emailAddress: 'three@clerk.com',
            }),
            createFakeUserOrganizationInvitation({
              id: '4',
              emailAddress: 'four@clerk.com',
            }),
          ],
          total_count: 4,
        }),
      );

      act(() => {
        result.current.userInvitations.fetchNext?.();
      });

      await waitFor(() => {
        expect(result.current.userInvitations.isLoading).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.userInvitations.isLoading).toBe(false);
        expect(result.current.userInvitations.page).toBe(2);
        expect(result.current.userInvitations.hasNextPage).toBe(false);
        expect(result.current.userInvitations.data).toEqual(
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

    it('infinite fetch', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
        });
      });

      fixtures.clerk.user?.getOrganizationInvitations.mockReturnValue(
        Promise.resolve({
          data: [
            createFakeUserOrganizationInvitation({
              id: '1',
              emailAddress: 'one@clerk.com',
            }),
            createFakeUserOrganizationInvitation({
              id: '2',
              emailAddress: 'two@clerk.com',
            }),
          ],
          total_count: 4,
        }),
      );
      const { result } = renderHook(
        () =>
          useCoreOrganizationList({
            userInvitations: {
              pageSize: 2,
              infinite: true,
            },
          }),
        { wrapper },
      );
      expect(result.current.userInvitations.isLoading).toBe(true);
      expect(result.current.userInvitations.isFetching).toBe(true);

      await waitFor(() => {
        expect(result.current.userInvitations.isLoading).toBe(false);
        expect(result.current.userInvitations.isFetching).toBe(false);
      });

      fixtures.clerk.user?.getOrganizationInvitations.mockReturnValueOnce(
        Promise.resolve({
          data: [
            createFakeUserOrganizationInvitation({
              id: '1',
              emailAddress: 'one@clerk.com',
            }),
            createFakeUserOrganizationInvitation({
              id: '2',
              emailAddress: 'two@clerk.com',
            }),
          ],
          total_count: 4,
        }),
      );

      fixtures.clerk.user?.getOrganizationInvitations.mockReturnValueOnce(
        Promise.resolve({
          data: [
            createFakeUserOrganizationInvitation({
              id: '3',
              emailAddress: 'three@clerk.com',
            }),
            createFakeUserOrganizationInvitation({
              id: '4',
              emailAddress: 'four@clerk.com',
            }),
          ],
          total_count: 4,
        }),
      );

      act(() => {
        result.current.userInvitations.fetchNext?.();
      });

      await waitFor(() => {
        expect(result.current.userInvitations.isLoading).toBe(false);
        expect(result.current.userInvitations.isFetching).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.userInvitations.isFetching).toBe(false);
        expect(result.current.userInvitations.data).toEqual(
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

  describe('userSuggestions', () => {
    it('fetch with pages', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
        });
      });

      fixtures.clerk.user?.getOrganizationSuggestions.mockReturnValue(
        Promise.resolve({
          data: [
            createFakeUserOrganizationSuggestion({
              id: '1',
              emailAddress: 'one@clerk.com',
            }),
            createFakeUserOrganizationSuggestion({
              id: '2',
              emailAddress: 'two@clerk.com',
            }),
          ],
          total_count: 4,
        }),
      );
      const { result } = renderHook(defaultRenderer, { wrapper });
      expect(result.current.userSuggestions.isLoading).toBe(true);
      expect(result.current.userSuggestions.isFetching).toBe(true);
      expect(result.current.userSuggestions.count).toBe(0);

      await waitFor(() => {
        expect(result.current.userSuggestions.isLoading).toBe(false);
        expect(result.current.userSuggestions.count).toBe(4);
        expect(result.current.userSuggestions.page).toBe(1);
        expect(result.current.userSuggestions.pageCount).toBe(2);
        expect(result.current.userSuggestions.hasNextPage).toBe(true);
      });

      fixtures.clerk.user?.getOrganizationSuggestions.mockReturnValue(
        Promise.resolve({
          data: [
            createFakeUserOrganizationSuggestion({
              id: '3',
              emailAddress: 'three@clerk.com',
            }),
            createFakeUserOrganizationSuggestion({
              id: '4',
              emailAddress: 'four@clerk.com',
            }),
          ],
          total_count: 4,
        }),
      );

      act(() => {
        result.current.userSuggestions.fetchNext?.();
      });

      await waitFor(() => {
        expect(result.current.userSuggestions.isLoading).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.userSuggestions.isLoading).toBe(false);
        expect(result.current.userSuggestions.page).toBe(2);
        expect(result.current.userSuggestions.hasNextPage).toBe(false);
        expect(result.current.userSuggestions.data).toEqual(
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

    it('infinite fetch', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
        });
      });

      fixtures.clerk.user?.getOrganizationSuggestions.mockReturnValue(
        Promise.resolve({
          data: [
            createFakeUserOrganizationSuggestion({
              id: '1',
              emailAddress: 'one@clerk.com',
            }),
            createFakeUserOrganizationSuggestion({
              id: '2',
              emailAddress: 'two@clerk.com',
            }),
          ],
          total_count: 4,
        }),
      );
      const { result } = renderHook(
        () =>
          useCoreOrganizationList({
            userSuggestions: {
              pageSize: 2,
              infinite: true,
            },
          }),
        { wrapper },
      );
      expect(result.current.userSuggestions.isLoading).toBe(true);
      expect(result.current.userSuggestions.isFetching).toBe(true);

      await waitFor(() => {
        expect(result.current.userSuggestions.isLoading).toBe(false);
        expect(result.current.userSuggestions.isFetching).toBe(false);
      });

      fixtures.clerk.user?.getOrganizationSuggestions.mockReturnValueOnce(
        Promise.resolve({
          data: [
            createFakeUserOrganizationSuggestion({
              id: '1',
              emailAddress: 'one@clerk.com',
            }),
            createFakeUserOrganizationSuggestion({
              id: '2',
              emailAddress: 'two@clerk.com',
            }),
          ],
          total_count: 4,
        }),
      );

      fixtures.clerk.user?.getOrganizationSuggestions.mockReturnValueOnce(
        Promise.resolve({
          data: [
            createFakeUserOrganizationSuggestion({
              id: '3',
              emailAddress: 'three@clerk.com',
            }),
            createFakeUserOrganizationSuggestion({
              id: '4',
              emailAddress: 'four@clerk.com',
            }),
          ],
          total_count: 4,
        }),
      );

      act(() => {
        result.current.userSuggestions.fetchNext?.();
      });

      await waitFor(() => {
        expect(result.current.userSuggestions.isLoading).toBe(false);
        expect(result.current.userSuggestions.isFetching).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.userSuggestions.isFetching).toBe(false);
        expect(result.current.userSuggestions.data).toEqual(
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
});

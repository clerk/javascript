import type { MembershipRole, OrganizationInvitationStatus, UserOrganizationInvitationResource } from '@clerk/types';
import { describe, jest } from '@jest/globals';
import React from 'react';

import { act, bindCreateFixtures, renderHook, waitFor } from '../../../testUtils';
import { useCoreOrganizationList } from '../../contexts';

const { createFixtures } = bindCreateFixtures('OrganizationSwitcher');

const defaultRenderer = () =>
  useCoreOrganizationList({
    userInvitations: {
      initialPageSize: 2,
    },
  });

type FakeOrganizationParams = {
  id: string;
  createdAt?: Date;
  emailAddress: string;
  role?: MembershipRole;
  status?: OrganizationInvitationStatus;
};

const createFakeUserOrganizationInvitations = (params: FakeOrganizationParams): UserOrganizationInvitationResource => {
  return {
    pathRoot: '',
    emailAddress: params.emailAddress,
    publicOrganizationData: { hasImage: false, id: '', imageUrl: '', name: '', slug: '' },
    role: params.role || 'basic_member',
    status: params.status || 'pending',
    id: params.id,
    createdAt: params?.createdAt || new Date(),
    updatedAt: new Date(),
    publicMetadata: {},
    accept: jest.fn() as any,
    reload: jest.fn() as any,
  };
};

describe('useOrganizationList', () => {
  it('opens organization profile when "Manage Organization" is clicked', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.dev'],
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

  it.only('opens organization profile when "Manage Organization" is clicked', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.dev'],
        organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
      });
    });

    fixtures.clerk.user?.getOrganizationInvitations.mockReturnValue(
      Promise.resolve({
        data: [
          createFakeUserOrganizationInvitations({
            id: '1',
            emailAddress: 'one@clerk.com',
          }),
          createFakeUserOrganizationInvitations({
            id: '2',
            emailAddress: 'two@clerk.com',
          }),
        ],
        total_count: 4,
      }),
    );
    const { result } = renderHook(defaultRenderer, { wrapper });
    expect(result.current.userInvitations.isLoading).toBe(true);
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
          createFakeUserOrganizationInvitations({
            id: '3',
            emailAddress: 'three@clerk.com',
          }),
          createFakeUserOrganizationInvitations({
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

  it.only('infinite', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.dev'],
        organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
      });
    });

    fixtures.clerk.user?.getOrganizationInvitations.mockReturnValue(
      Promise.resolve({
        data: [
          createFakeUserOrganizationInvitations({
            id: '1',
            emailAddress: 'one@clerk.com',
          }),
          createFakeUserOrganizationInvitations({
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
            initialPageSize: 2,
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
          createFakeUserOrganizationInvitations({
            id: '1',
            emailAddress: 'one@clerk.com',
          }),
          createFakeUserOrganizationInvitations({
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
          createFakeUserOrganizationInvitations({
            id: '3',
            emailAddress: 'three@clerk.com',
          }),
          createFakeUserOrganizationInvitations({
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

import type { OrganizationResource } from '@clerk/shared/types';
import { waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';

import { CreateOrganization } from '..';

const { createFixtures } = bindCreateFixtures('CreateOrganization');

export type FakeOrganizationParams = {
  id: string;
  createdAt?: Date;
  imageUrl?: string;
  slug: string;
  name: string;
  membersCount: number;
  pendingInvitationsCount: number;
  adminDeleteEnabled: boolean;
  maxAllowedMemberships: number;
};

export const createFakeOrganization = (params: FakeOrganizationParams): OrganizationResource => {
  return {
    pathRoot: '',
    id: params.id,
    name: params.name,
    slug: params.slug,
    hasImage: !!params.imageUrl,
    imageUrl: params.imageUrl || '',
    membersCount: params.membersCount,
    pendingInvitationsCount: params.pendingInvitationsCount,
    publicMetadata: {},
    adminDeleteEnabled: params.adminDeleteEnabled,
    maxAllowedMemberships: params?.maxAllowedMemberships,
    createdAt: params?.createdAt || new Date(),
    updatedAt: new Date(),
    update: vi.fn() as any,
    getMemberships: vi.fn() as any,
    addMember: vi.fn() as any,
    inviteMember: vi.fn() as any,
    inviteMembers: vi.fn() as any,
    updateMember: vi.fn() as any,
    removeMember: vi.fn() as any,
    createDomain: vi.fn() as any,
    getDomain: vi.fn() as any,
    getDomains: vi.fn() as any,
    getMembershipRequests: vi.fn() as any,
    destroy: vi.fn() as any,
    setLogo: vi.fn() as any,
    reload: vi.fn() as any,
  };
};

const getCreatedOrg = (params: Partial<FakeOrganizationParams>) =>
  createFakeOrganization({
    id: '1',
    adminDeleteEnabled: false,
    maxAllowedMemberships: 1,
    membersCount: 1,
    name: 'new org',
    pendingInvitationsCount: 0,
    slug: 'new-org',
    ...params,
  });

describe('CreateOrganization', () => {
  it('renders component', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
      });
    });

    const { userEvent, getByLabelText, getByRole } = render(<CreateOrganization />, { wrapper });

    await userEvent.type(getByLabelText(/Name/i), 'new org');
    expect(getByRole('heading', { name: 'Create organization', level: 1 })).toBeInTheDocument();
  });

  describe('with organization slug configured on environment', () => {
    it('when disabled, renders component without slug field', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withOrganizationSlug(false);
        f.withUser({
          email_addresses: ['test@clerk.com'],
        });
      });

      fixtures.clerk.createOrganization.mockReturnValue(
        Promise.resolve(
          getCreatedOrg({
            maxAllowedMemberships: 1,
            slug: 'new-org-1722578361',
          }),
        ),
      );

      const { userEvent, getByRole, queryByText, queryByLabelText, getByLabelText } = render(<CreateOrganization />, {
        wrapper,
      });

      expect(queryByLabelText(/Slug/i)).not.toBeInTheDocument();

      await userEvent.type(getByLabelText(/Name/i), 'new org');
      await userEvent.click(getByRole('button', { name: /create organization/i }));

      await waitFor(() => {
        expect(queryByText(/Invite new members/i)).toBeInTheDocument();
      });
    });

    it('when enabled, renders component slug field', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withOrganizationSlug(true);
        f.withUser({
          email_addresses: ['test@clerk.com'],
        });
      });

      fixtures.clerk.createOrganization.mockReturnValue(
        Promise.resolve(
          getCreatedOrg({
            maxAllowedMemberships: 1,
            slug: 'new-org-1722578361',
          }),
        ),
      );

      const { userEvent, getByRole, queryByText, queryByLabelText, getByLabelText } = render(<CreateOrganization />, {
        wrapper,
      });

      expect(queryByLabelText(/Slug/i)).toBeInTheDocument();

      await userEvent.type(getByLabelText(/Name/i), 'new org');
      await userEvent.click(getByRole('button', { name: /create organization/i }));

      await waitFor(() => {
        expect(queryByText(/Invite new members/i)).toBeInTheDocument();
      });
    });
  });

  it('skips invitation screen', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
      });
    });

    fixtures.clerk.createOrganization.mockReturnValue(
      Promise.resolve(
        getCreatedOrg({
          maxAllowedMemberships: 3,
        }),
      ),
    );

    props.setProps({ skipInvitationScreen: true });
    const { getByRole, userEvent, getByLabelText, queryByText } = render(<CreateOrganization />, {
      wrapper,
    });
    await userEvent.type(getByLabelText(/Name/i), 'new org');
    await userEvent.click(getByRole('button', { name: /create organization/i }));

    await waitFor(() => {
      expect(queryByText(/Invite members/i)).not.toBeInTheDocument();
    });
  });

  it('always visit invitation screen', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
      });
    });

    fixtures.clerk.createOrganization.mockReturnValue(
      Promise.resolve(
        getCreatedOrg({
          maxAllowedMemberships: 1,
        }),
      ),
    );

    props.setProps({ skipInvitationScreen: false });
    const { getByRole, userEvent, getByLabelText, queryByText } = render(<CreateOrganization />, {
      wrapper,
    });
    await userEvent.type(getByLabelText(/Name/i), 'new org');
    await userEvent.click(getByRole('button', { name: /create organization/i }));

    await waitFor(() => {
      expect(queryByText(/Invite new members/i)).toBeInTheDocument();
    });
  });

  it('auto skip invitation screen', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
      });
    });

    fixtures.clerk.createOrganization.mockReturnValue(
      Promise.resolve(
        getCreatedOrg({
          maxAllowedMemberships: 1,
        }),
      ),
    );

    const { getByRole, userEvent, getByLabelText, queryByText } = render(<CreateOrganization />, {
      wrapper,
    });
    await userEvent.type(getByLabelText(/Name/i), 'new org');
    await userEvent.click(getByRole('button', { name: /create organization/i }));

    await waitFor(() => {
      expect(queryByText(/Invite members/i)).not.toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('constructs afterCreateOrganizationUrl from function', async () => {
      const { wrapper, fixtures, props } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
        });
      });

      const createdOrg = getCreatedOrg({
        maxAllowedMemberships: 1,
      });

      fixtures.clerk.createOrganization.mockReturnValue(Promise.resolve(createdOrg));

      props.setProps({ afterCreateOrganizationUrl: org => `/org/${org.id}`, skipInvitationScreen: true });
      const { getByRole, userEvent, getByLabelText } = render(<CreateOrganization />, {
        wrapper,
      });
      await userEvent.type(getByLabelText(/Name/i), 'new org');
      await userEvent.click(getByRole('button', { name: /create organization/i }));

      expect(fixtures.router.navigate).toHaveBeenCalledWith(`/org/${createdOrg.id}`);
    });

    it('constructs afterCreateOrganizationUrl from `:slug` ', async () => {
      const { wrapper, fixtures, props } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
        });
      });

      const createdOrg = getCreatedOrg({
        maxAllowedMemberships: 1,
      });

      fixtures.clerk.createOrganization.mockReturnValue(Promise.resolve(createdOrg));

      props.setProps({ afterCreateOrganizationUrl: '/org/:slug', skipInvitationScreen: true });
      const { getByRole, userEvent, getByLabelText } = render(<CreateOrganization />, {
        wrapper,
      });
      await userEvent.type(getByLabelText(/Name/i), 'new org');
      await userEvent.click(getByRole('button', { name: /create organization/i }));

      expect(fixtures.router.navigate).toHaveBeenCalledWith(`/org/${createdOrg.slug}`);
    });
  });
});

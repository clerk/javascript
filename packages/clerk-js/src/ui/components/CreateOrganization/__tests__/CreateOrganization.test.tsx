import type { OrganizationResource } from '@clerk/types';
import { describe, jest } from '@jest/globals';
import { waitFor } from '@testing-library/dom';
import React from 'react';

import { render } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { CreateOrganization } from '../CreateOrganization';

const { createFixtures } = bindCreateFixtures('CreateOrganization');

type FakeOrganizationParams = {
  id: string;
  createdAt?: Date;
  imageUrl?: string;
  logoUrl?: string;
  slug: string;
  name: string;
  membersCount: number;
  pendingInvitationsCount: number;
  adminDeleteEnabled: boolean;
  maxAllowedMemberships: number;
};

const createFakeOrganization = (params: FakeOrganizationParams): OrganizationResource => {
  return {
    logoUrl: null,
    pathRoot: '',
    id: params.id,
    name: params.name,
    slug: params.slug,
    imageUrl: params.imageUrl || '',
    membersCount: params.membersCount,
    pendingInvitationsCount: params.pendingInvitationsCount,
    publicMetadata: {},
    adminDeleteEnabled: params.adminDeleteEnabled,
    maxAllowedMemberships: params?.maxAllowedMemberships,
    createdAt: params?.createdAt || new Date(),
    updatedAt: new Date(),
    update: jest.fn() as any,
    getMemberships: jest.fn() as any,
    getPendingInvitations: jest.fn() as any,
    addMember: jest.fn() as any,
    inviteMember: jest.fn() as any,
    inviteMembers: jest.fn() as any,
    updateMember: jest.fn() as any,
    removeMember: jest.fn() as any,
    destroy: jest.fn() as any,
    setLogo: jest.fn() as any,
    reload: jest.fn() as any,
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
        email_addresses: ['test@clerk.dev'],
      });
    });
    const { getByText } = render(<CreateOrganization />, { wrapper });
    expect(getByText('Create Organization')).toBeInTheDocument();
  });

  it('skips invitation screen', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.dev'],
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
    await userEvent.type(getByLabelText(/Organization name/i), 'new org');
    await userEvent.click(getByRole('button', { name: /create organization/i }));

    await waitFor(() => {
      expect(queryByText(/Invite members/i)).not.toBeInTheDocument();
    });
  });

  it('always visit invitation screen', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.dev'],
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
    await userEvent.type(getByLabelText(/Organization name/i), 'new org');
    await userEvent.click(getByRole('button', { name: /create organization/i }));

    await waitFor(() => {
      expect(queryByText(/Invite members/i)).toBeInTheDocument();
    });
  });

  it('auto skip invitation screen', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.dev'],
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
    await userEvent.type(getByLabelText(/Organization name/i), 'new org');
    await userEvent.click(getByRole('button', { name: /create organization/i }));

    await waitFor(() => {
      expect(queryByText(/Invite members/i)).not.toBeInTheDocument();
    });
  });
});

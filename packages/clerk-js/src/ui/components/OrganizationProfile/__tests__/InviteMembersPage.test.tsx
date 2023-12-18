import type { MembershipRole, OrganizationInvitationResource } from '@clerk/types';
import { describe } from '@jest/globals';
import { waitFor } from '@testing-library/dom';
import React from 'react';

import { ClerkAPIResponseError } from '../../../../core/resources';
import { render } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { InviteMembersPage } from '../InviteMembersPage';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

describe('InviteMembersPage', () => {
  it('renders the component', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: [{ name: 'Org1', role: 'admin' }],
      });
    });

    fixtures.clerk.organization?.getRoles.mockRejectedValue(null);

    const { findByText } = render(<InviteMembersPage />, { wrapper });
    await waitFor(async () => expect(await findByText('Invite new members to this organization')).toBeInTheDocument());
  });

  describe('Submitting', () => {
    it('keeps the Send button disabled until a role is selected and one or more email has been entered', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'admin' }],
        });
      });

      fixtures.clerk.organization?.getRoles.mockResolvedValue({
        total_count: 1,
        data: [
          {
            pathRoot: '',
            reload: jest.fn(),
            id: 'member',
            key: 'member',
            name: 'member',
            description: '',
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });

      const { getByText, getByRole, userEvent, getByTestId } = render(<InviteMembersPage />, { wrapper });
      expect(getByRole('button', { name: 'Send invitations' })).toBeDisabled();

      await userEvent.type(getByTestId('tag-input'), 'test+1@clerk.com,');
      expect(getByRole('button', { name: 'Send invitations' })).toBeDisabled();

      await userEvent.click(getByRole('button', { name: /select an option/i }));
      await userEvent.click(getByText(/^member$/i));

      expect(getByRole('button', { name: 'Send invitations' })).not.toBeDisabled();
    });

    it('sends invite to email entered and basic member role when clicking Send', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'admin' }],
        });
      });

      fixtures.clerk.organization?.getRoles.mockResolvedValue({
        total_count: 2,
        data: [
          {
            pathRoot: '',
            reload: jest.fn(),
            id: 'member',
            key: 'member',
            name: 'member',
            description: '',
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });

      fixtures.clerk.organization?.inviteMembers.mockResolvedValueOnce([{}] as OrganizationInvitationResource[]);
      const { getByRole, userEvent, getByTestId, getByText } = render(<InviteMembersPage />, { wrapper });
      await userEvent.type(getByTestId('tag-input'), 'test+1@clerk.com,');
      await userEvent.click(getByRole('button', { name: 'Select an option' }));
      await userEvent.click(getByText(/^member$/i));
      await userEvent.click(getByRole('button', { name: 'Send invitations' }));

      await waitFor(() => {
        expect(fixtures.clerk.organization?.inviteMembers).toHaveBeenCalledWith({
          emailAddresses: ['test+1@clerk.com'],
          role: 'member' as MembershipRole,
        });
      });
    });

    it('fetches custom role and sends invite to email entered and teacher role when clicking Send', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'admin' }],
        });
      });

      fixtures.clerk.organization?.getRoles.mockResolvedValueOnce({
        data: [
          {
            pathRoot: '',
            reload: jest.fn(),
            id: '1',
            description: '',
            updatedAt: new Date(),
            createdAt: new Date(),
            permissions: [],
            name: 'Teacher',
            key: 'org:teacher',
          },
        ],
        total_count: 1,
      });
      fixtures.clerk.organization?.inviteMembers.mockResolvedValueOnce([{}] as OrganizationInvitationResource[]);
      const { getByRole, userEvent, getByTestId, getByText } = render(<InviteMembersPage />, { wrapper });
      await userEvent.type(getByTestId('tag-input'), 'test+1@clerk.com,');
      await userEvent.click(getByRole('button', { name: 'Select an option' }));
      await userEvent.click(getByText('Teacher'));
      await userEvent.click(getByRole('button', { name: 'Send invitations' }));

      await waitFor(() => {
        expect(fixtures.clerk.organization?.inviteMembers).toHaveBeenCalledWith({
          emailAddresses: ['test+1@clerk.com'],
          role: 'org:teacher' as MembershipRole,
        });
      });
    });

    it('sends invites to multiple emails', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'admin' }],
        });
      });

      fixtures.clerk.organization?.getRoles.mockResolvedValue({
        total_count: 2,
        data: [
          {
            pathRoot: '',
            reload: jest.fn(),
            id: 'member',
            key: 'member',
            name: 'member',
            description: '',
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });

      fixtures.clerk.organization?.inviteMembers.mockResolvedValueOnce([{}] as OrganizationInvitationResource[]);
      const { getByRole, userEvent, getByTestId, getByText } = render(<InviteMembersPage />, { wrapper });
      await userEvent.type(
        getByTestId('tag-input'),
        'test+1@clerk.com,test+2@clerk.com,test+3@clerk.com,test+4@clerk.com,',
      );
      await userEvent.click(getByRole('button', { name: 'Select an option' }));
      await userEvent.click(getByText(/^member$/i));
      await userEvent.click(getByRole('button', { name: 'Send invitations' }));

      await waitFor(() => {
        expect(fixtures.clerk.organization?.inviteMembers).toHaveBeenCalledWith({
          emailAddresses: ['test+1@clerk.com', 'test+2@clerk.com', 'test+3@clerk.com', 'test+4@clerk.com'],
          role: 'member' as MembershipRole,
        });
      });
    });

    it('sends invite for admin role', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'admin' }],
        });
      });

      fixtures.clerk.organization?.getRoles.mockResolvedValue({
        total_count: 2,
        data: [
          {
            pathRoot: '',
            reload: jest.fn(),
            id: 'admin',
            key: 'admin',
            name: 'Admin',
            description: '',
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });

      fixtures.clerk.organization?.inviteMembers.mockResolvedValueOnce([{}] as OrganizationInvitationResource[]);
      const { getByRole, userEvent, getByText, getByTestId } = render(<InviteMembersPage />, { wrapper });
      await userEvent.type(getByTestId('tag-input'), 'test+1@clerk.com,');
      await userEvent.click(getByRole('button', { name: 'Select an option' }));
      await userEvent.click(getByText('Admin'));
      await userEvent.click(getByRole('button', { name: 'Send invitations' }));
      await waitFor(() => {
        expect(fixtures.clerk.organization?.inviteMembers).toHaveBeenCalledWith({
          emailAddresses: ['test+1@clerk.com'],
          role: 'admin' as MembershipRole,
        });
      });
    });

    it('shows error on UI with the invalid emails', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'admin' }],
        });
      });

      fixtures.clerk.organization?.getRoles.mockResolvedValue({
        total_count: 2,
        data: [
          {
            pathRoot: '',
            reload: jest.fn(),
            id: 'member',
            key: 'member',
            name: 'member',
            description: '',
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });

      fixtures.clerk.organization?.inviteMembers.mockRejectedValueOnce(
        new ClerkAPIResponseError('Error', {
          data: [
            {
              code: 'duplicate_record',
              long_message: 'There are already pending invitations for the following email addresses: test+1@clerk.com',
              message: 'duplicate invitation',
              meta: { email_addresses: ['test+5@clerk.com', 'test+6@clerk.com', 'test+7@clerk.com'] },
            },
          ],
          status: 400,
        }),
      );
      const { getByRole, userEvent, getByText, getByTestId } = render(<InviteMembersPage />, { wrapper });
      await userEvent.type(getByTestId('tag-input'), 'test+1@clerk.com,');
      await waitFor(() => expect(getByRole('button', { name: /select an option/i })).not.toBeDisabled());
      await userEvent.click(getByRole('button', { name: /select an option/i }));
      await userEvent.click(getByText(/^member$/i));
      await userEvent.click(getByRole('button', { name: 'Send invitations' }));
      await waitFor(() =>
        expect(
          getByText(
            'The invitations could not be sent. There are already pending invitations for the following email addresses: test+5@clerk.com, test+6@clerk.com, and test+7@clerk.com.',
          ),
        ).toBeInTheDocument(),
      );
    });

    it('removes duplicate emails from input after error', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.dev'],
          organization_memberships: [{ name: 'Org1', role: 'admin' }],
        });
      });

      fixtures.clerk.organization?.getRoles.mockResolvedValue({
        total_count: 2,
        data: [
          {
            pathRoot: '',
            reload: jest.fn(),
            id: 'member',
            key: 'member',
            name: 'member',
            description: '',
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });

      fixtures.clerk.organization?.inviteMembers.mockRejectedValueOnce(
        new ClerkAPIResponseError('Error', {
          data: [
            {
              code: 'duplicate_record',
              long_message:
                'There are already pending invitations for the following email addresses: invalid@clerk.dev',
              message: 'duplicate invitation',
              meta: { email_addresses: ['invalid@clerk.dev'] },
            },
          ],
          status: 400,
        }),
      );
      const { getByRole, userEvent, getByTestId, getByText } = render(<InviteMembersPage />, { wrapper });
      await userEvent.type(getByTestId('tag-input'), 'invalid@clerk.dev');
      await waitFor(() => expect(getByRole('button', { name: /select an option/i })).not.toBeDisabled());
      await userEvent.click(getByRole('button', { name: /select an option/i }));
      await userEvent.click(getByText(/^member$/i));
      await userEvent.click(getByRole('button', { name: 'Send invitations' }));

      expect(getByTestId('tag-input')).not.toHaveValue();
    });

    it('removes blocked/not allowed emails from input after error', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.dev'],
          organization_memberships: [{ name: 'Org1', role: 'admin' }],
        });
      });

      fixtures.clerk.organization?.getRoles.mockResolvedValue({
        total_count: 2,
        data: [
          {
            pathRoot: '',
            reload: jest.fn(),
            id: 'member',
            key: 'member',
            name: 'member',
            description: '',
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });

      fixtures.clerk.organization?.inviteMembers.mockRejectedValueOnce(
        new ClerkAPIResponseError('Error', {
          data: [
            {
              code: 'not_allowed_access',
              long_message: 'blocked@clerk.dev is not allowed to access this application.',
              message: 'Access not allowed.',
              meta: { identifiers: ['blocked@clerk.dev'] },
            },
          ],
          status: 403,
        }),
      );
      const { getByRole, getByText, userEvent, getByTestId } = render(<InviteMembersPage />, { wrapper });
      await userEvent.type(getByTestId('tag-input'), 'blocked@clerk.dev');
      await waitFor(() => expect(getByRole('button', { name: /select an option/i })).not.toBeDisabled());
      await userEvent.click(getByRole('button', { name: /select an option/i }));
      await userEvent.click(getByText(/^member$/i));
      await userEvent.click(getByRole('button', { name: 'Send invitations' }));

      expect(getByTestId('tag-input')).not.toHaveValue();
    });
  });

  describe('Navigation', () => {
    it('navigates back when clicking the Cancel button', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'admin' }],
        });
      });
      fixtures.clerk.organization?.getRoles.mockRejectedValue(null);

      const { getByRole, userEvent } = render(<InviteMembersPage />, { wrapper });
      await userEvent.click(getByRole('button', { name: 'Cancel' }));
      expect(fixtures.router.navigate).toHaveBeenCalledWith('..');
    });
  });
});

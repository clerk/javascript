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
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: [{ name: 'Org1', role: 'admin' }] });
    });

    const { getByText } = render(<InviteMembersPage />, { wrapper });
    expect(getByText('Invite new members to this organization')).toBeDefined();
  });

  describe('Submitting', () => {
    it('enables the Send button when one or more email has been entered', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'admin' }],
        });
      });

      const { getByRole, userEvent, getByTestId } = render(<InviteMembersPage />, { wrapper });
      expect(getByRole('button', { name: 'Send invitations' })).toBeDisabled();

      await userEvent.type(getByTestId('tag-input'), 'test+1@clerk.com,');
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

      fixtures.clerk.organization?.inviteMembers.mockResolvedValueOnce([{}] as OrganizationInvitationResource[]);
      const { getByRole, userEvent, getByTestId } = render(<InviteMembersPage />, { wrapper });
      await userEvent.type(getByTestId('tag-input'), 'test+1@clerk.com,');
      await userEvent.click(getByRole('button', { name: 'Send invitations' }));
      expect(fixtures.clerk.organization?.inviteMembers).toHaveBeenCalledWith({
        emailAddresses: ['test+1@clerk.com'],
        role: 'basic_member' as MembershipRole,
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

      fixtures.clerk.organization?.inviteMembers.mockResolvedValueOnce([{}] as OrganizationInvitationResource[]);
      const { getByRole, userEvent, getByTestId } = render(<InviteMembersPage />, { wrapper });
      await userEvent.type(
        getByTestId('tag-input'),
        'test+1@clerk.com,test+2@clerk.com,test+3@clerk.com,test+4@clerk.com,',
      );
      await userEvent.click(getByRole('button', { name: 'Send invitations' }));
      expect(fixtures.clerk.organization?.inviteMembers).toHaveBeenCalledWith({
        emailAddresses: ['test+1@clerk.com', 'test+2@clerk.com', 'test+3@clerk.com', 'test+4@clerk.com'],
        role: 'basic_member' as MembershipRole,
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

      fixtures.clerk.organization?.inviteMembers.mockResolvedValueOnce([{}] as OrganizationInvitationResource[]);
      const { getByRole, userEvent, getByText, getByTestId } = render(<InviteMembersPage />, { wrapper });
      await userEvent.type(getByTestId('tag-input'), 'test+1@clerk.com,');
      await userEvent.click(getByRole('button', { name: 'Member' }));
      await userEvent.click(getByText('Admin'));
      await userEvent.click(getByRole('button', { name: 'Send invitations' }));
      expect(fixtures.clerk.organization?.inviteMembers).toHaveBeenCalledWith({
        emailAddresses: ['test+1@clerk.com'],
        role: 'admin' as MembershipRole,
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
      const { getByRole, userEvent, getByTestId } = render(<InviteMembersPage />, { wrapper });
      await userEvent.type(getByTestId('tag-input'), 'invalid@clerk.dev');
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
      const { getByRole, userEvent, getByTestId } = render(<InviteMembersPage />, { wrapper });
      await userEvent.type(getByTestId('tag-input'), 'blocked@clerk.dev');
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

      const { getByRole, userEvent } = render(<InviteMembersPage />, { wrapper });
      await userEvent.click(getByRole('button', { name: 'Cancel' }));
      expect(fixtures.router.navigate).toHaveBeenCalledWith('..');
    });
  });
});

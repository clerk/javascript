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
      f.withUser({ email_addresses: ['test@clerk.dev'], organization_memberships: [{ name: 'Org1', role: 'admin' }] });
    });

    const { getByText } = render(<InviteMembersPage />, { wrapper });
    expect(getByText('Invite new members to this organization')).toBeDefined();
  });

  describe('Submitting', () => {
    it('enables the Send button when one or more email has been entered', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.dev'],
          organization_memberships: [{ name: 'Org1', role: 'admin' }],
        });
      });

      const { getByRole, userEvent, getByTestId } = render(<InviteMembersPage />, { wrapper });
      expect(getByRole('button', { name: 'Send invitations' })).toBeDisabled();

      await userEvent.type(getByTestId('tag-input'), 'test+1@clerk.dev,');
      expect(getByRole('button', { name: 'Send invitations' })).not.toBeDisabled();
    });

    it('sends invite to email entered and basic member role when clicking Send', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.dev'],
          organization_memberships: [{ name: 'Org1', role: 'admin' }],
        });
      });

      fixtures.clerk.organization?.inviteMembers.mockResolvedValueOnce([{}] as OrganizationInvitationResource[]);
      const { getByRole, userEvent, getByTestId } = render(<InviteMembersPage />, { wrapper });
      await userEvent.type(getByTestId('tag-input'), 'test+1@clerk.dev,');
      await userEvent.click(getByRole('button', { name: 'Send invitations' }));
      expect(fixtures.clerk.organization?.inviteMembers).toHaveBeenCalledWith({
        emailAddresses: ['test+1@clerk.dev'],
        role: 'basic_member' as MembershipRole,
      });
    });

    it('sends invites to multiple emails', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.dev'],
          organization_memberships: [{ name: 'Org1', role: 'admin' }],
        });
      });

      fixtures.clerk.organization?.inviteMembers.mockResolvedValueOnce([{}] as OrganizationInvitationResource[]);
      const { getByRole, userEvent, getByTestId } = render(<InviteMembersPage />, { wrapper });
      await userEvent.type(
        getByTestId('tag-input'),
        'test+1@clerk.dev,test+2@clerk.dev,test+3@clerk.dev,test+4@clerk.dev,',
      );
      await userEvent.click(getByRole('button', { name: 'Send invitations' }));
      expect(fixtures.clerk.organization?.inviteMembers).toHaveBeenCalledWith({
        emailAddresses: ['test+1@clerk.dev', 'test+2@clerk.dev', 'test+3@clerk.dev', 'test+4@clerk.dev'],
        role: 'basic_member' as MembershipRole,
      });
    });

    it('sends invite for admin role', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.dev'],
          organization_memberships: [{ name: 'Org1', role: 'admin' }],
        });
      });

      fixtures.clerk.organization?.inviteMembers.mockResolvedValueOnce([{}] as OrganizationInvitationResource[]);
      const { getByRole, userEvent, getByText, getByTestId } = render(<InviteMembersPage />, { wrapper });
      await userEvent.type(getByTestId('tag-input'), 'test+1@clerk.dev,');
      await userEvent.click(getByRole('button', { name: 'Member' }));
      await userEvent.click(getByText('Admin'));
      await userEvent.click(getByRole('button', { name: 'Send invitations' }));
      expect(fixtures.clerk.organization?.inviteMembers).toHaveBeenCalledWith({
        emailAddresses: ['test+1@clerk.dev'],
        role: 'admin' as MembershipRole,
      });
    });

    it('shows error on UI with the invalid emails', async () => {
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
              long_message: 'There are already pending invitations for the following email addresses: test+1@clerk.dev',
              message: 'duplicate invitation',
              meta: { email_addresses: ['test+5@clerk.dev', 'test+6@clerk.dev', 'test+7@clerk.dev'] },
            },
          ],
          status: 400,
        }),
      );
      const { getByRole, userEvent, getByText, getByTestId } = render(<InviteMembersPage />, { wrapper });
      await userEvent.type(getByTestId('tag-input'), 'test+1@clerk.dev,');
      await userEvent.click(getByRole('button', { name: 'Send invitations' }));
      await waitFor(() =>
        expect(getByText('The invitations could not be sent. Fix the following and try again:')).toBeDefined(),
      );
      await waitFor(() => expect(getByText('test+5@clerk.dev, test+6@clerk.dev, test+7@clerk.dev')).toBeDefined());
    });
  });

  describe('Navigation', () => {
    it('navigates back when clicking the Cancel button', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.dev'],
          organization_memberships: [{ name: 'Org1', role: 'admin' }],
        });
      });

      const { getByRole, userEvent } = render(<InviteMembersPage />, { wrapper });
      await userEvent.click(getByRole('button', { name: 'Cancel' }));
      expect(fixtures.router.navigate).toHaveBeenCalledWith('..');
    });
  });
});

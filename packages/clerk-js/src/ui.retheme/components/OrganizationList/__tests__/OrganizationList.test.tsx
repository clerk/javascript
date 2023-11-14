import { describe } from '@jest/globals';

import { render, waitFor } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { createFakeOrganization } from '../../CreateOrganization/__tests__/CreateOrganization.test';
import {
  createFakeUserOrganizationInvitation,
  createFakeUserOrganizationMembership,
} from '../../OrganizationSwitcher/__tests__/utlis';
import { OrganizationList } from '../OrganizationList';

const { createFixtures } = bindCreateFixtures('OrganizationList');

describe('OrganizationList', () => {
  it('renders component with personal and no data', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
      });
    });

    const { queryByText, queryByRole } = render(<OrganizationList />, { wrapper });

    await waitFor(() => {
      // Header
      expect(queryByRole('heading', { name: /select an account/i })).toBeInTheDocument();
      // Subheader
      expect(queryByText('to continue to TestApp')).toBeInTheDocument();
      //
      expect(queryByText('Personal account')).toBeInTheDocument();
      // Divider
      expect(queryByText('or')).toBeInTheDocument();
      expect(queryByRole('button', { name: 'Create organization' })).toBeInTheDocument();
    });
  });

  describe('Personal Account', () => {
    it('hides the personal account with data to list', async () => {
      const { wrapper, props, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
        });
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
                maxAllowedMemberships: 1,
                pendingInvitationsCount: 1,
              },
            }),
          ],
          total_count: 1,
        }),
      );

      props.setProps({ hidePersonal: true });
      const { queryByText, queryByRole } = render(<OrganizationList />, { wrapper });

      await waitFor(() => {
        // Header
        expect(queryByRole('heading', { name: /select an organization/i })).toBeInTheDocument();
        // Subheader
        expect(queryByText('to continue to TestApp')).toBeInTheDocument();
        // No personal
        expect(queryByText('Personal account')).not.toBeInTheDocument();
        // Display membership
        expect(queryByText('Org1')).toBeInTheDocument();

        // No Divider
        expect(queryByText('or')).toBeInTheDocument();

        expect(queryByRole('button', { name: 'Create organization' })).toBeInTheDocument();
      });
    });

    it('hides the personal account with no data to list', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', id: '1', role: 'admin' }],
        });
      });
      props.setProps({ hidePersonal: true });
      const { queryByText, queryByRole, queryByLabelText } = render(<OrganizationList />, { wrapper });

      await waitFor(() => {
        // Header
        expect(queryByRole('heading', { name: /Create organization/i })).toBeInTheDocument();
        // Subheader
        expect(queryByText('to continue to TestApp')).toBeInTheDocument();
        //
        expect(queryByText('Personal account')).not.toBeInTheDocument();
        // No Divider
        expect(queryByText('or')).not.toBeInTheDocument();

        // Form fields of CreateOrganizationForm
        expect(queryByLabelText(/organization name/i)).toBeInTheDocument();
        expect(queryByLabelText(/slug url/i)).toBeInTheDocument();

        expect(queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
        expect(queryByRole('button', { name: 'Create organization' })).toBeInTheDocument();
      });
    });

    it('lists invitations', async () => {
      const { wrapper, props, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
        });
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
                maxAllowedMemberships: 1,
                pendingInvitationsCount: 1,
              },
            }),
          ],
          total_count: 1,
        }),
      );

      const invitation = createFakeUserOrganizationInvitation({
        id: '1',
        emailAddress: 'one@clerk.com',
        publicOrganizationData: {
          name: 'OrgOne',
        },
      });

      invitation.accept = jest.fn().mockResolvedValue(
        createFakeUserOrganizationInvitation({
          id: '1',
          emailAddress: 'one@clerk.com',
          publicOrganizationData: {
            name: 'OrgOne',
          },
          status: 'accepted',
        }),
      );

      fixtures.clerk.user?.getOrganizationInvitations.mockReturnValueOnce(
        Promise.resolve({
          data: [invitation],
          total_count: 1,
        }),
      );

      fixtures.clerk.getOrganization.mockResolvedValue(
        createFakeOrganization({
          adminDeleteEnabled: false,
          id: '2',
          maxAllowedMemberships: 0,
          membersCount: 1,
          name: 'OrgOne',
          pendingInvitationsCount: 0,
          slug: '',
        }),
      );

      props.setProps({ hidePersonal: true });
      const { queryByText, userEvent, getByRole, queryByRole } = render(<OrganizationList />, { wrapper });

      await waitFor(async () => {
        // Display membership
        expect(queryByText('Org1')).toBeInTheDocument();
        // Display invitation
        expect(queryByText('OrgOne')).toBeInTheDocument();
        await userEvent.click(getByRole('button', { name: 'Join' }));
        expect(queryByRole('button', { name: 'Join' })).not.toBeInTheDocument();
      });
    });
  });

  describe('CreateOrganization', () => {
    it('display CreateOrganization within OrganizationList', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      const { queryByLabelText, getByRole, userEvent, queryByRole } = render(<OrganizationList />, { wrapper });

      await waitFor(async () => {
        // Header
        expect(queryByRole('heading', { name: /select an account/i })).toBeInTheDocument();
        // Form fields of CreateOrganizationForm
        expect(queryByLabelText(/organization name/i)).not.toBeInTheDocument();
        expect(queryByLabelText(/slug url/i)).not.toBeInTheDocument();
        await userEvent.click(getByRole('button', { name: 'Create organization' }));
        // Header
        expect(queryByRole('heading', { name: /Create organization/i })).toBeInTheDocument();
        // Form fields of CreateOrganizationForm
        expect(queryByLabelText(/organization name/i)).toBeInTheDocument();
        expect(queryByLabelText(/slug url/i)).toBeInTheDocument();

        expect(queryByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        expect(queryByRole('button', { name: 'Create organization' })).toBeInTheDocument();
      });
    });

    it('display CreateOrganization and navigates to Invite Members', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      const { getByLabelText, getByRole, userEvent, queryByText } = render(<OrganizationList />, { wrapper });

      await waitFor(async () => {
        await userEvent.click(getByRole('button', { name: /create organization/i }));

        await userEvent.type(getByLabelText(/Organization name/i), 'new org');
        await userEvent.click(getByRole('button', { name: /create organization/i }));

        await waitFor(() => {
          expect(queryByText(/Invite members/i)).toBeInTheDocument();
        });
      });
    });

    describe('navigation', () => {
      it('constructs afterSelectPersonalUrl from `:id` ', async () => {
        const { wrapper, fixtures, props } = await createFixtures(f => {
          f.withOrganizations();
          f.withUser({
            id: 'test_user_id',
            email_addresses: ['test@clerk.com'],
          });
        });

        props.setProps({
          afterSelectPersonalUrl: '/user/:id',
        });
        const { getByText, userEvent } = render(<OrganizationList />, {
          wrapper,
        });

        await waitFor(async () => {
          fixtures.clerk.setActive.mockReturnValueOnce(Promise.resolve());
          await userEvent.click(getByText(/Personal account/i));

          expect(fixtures.router.navigate).toHaveBeenCalledWith(`/user/test_user_id`);
          expect(fixtures.clerk.setActive).toHaveBeenCalledWith(
            expect.objectContaining({
              organization: null,
            }),
          );
        });
      });

      it('constructs afterSelectOrganizationUrl from `:slug` ', async () => {
        const { wrapper, fixtures, props } = await createFixtures(f => {
          f.withOrganizations();
          f.withUser({
            id: 'test_user_id',
            email_addresses: ['test@clerk.com'],
          });
        });

        const membership = createFakeUserOrganizationMembership({
          id: '1',
          organization: {
            id: '1',
            name: 'Org1',
            slug: 'org1',
            membersCount: 1,
            adminDeleteEnabled: false,
            maxAllowedMemberships: 1,
            pendingInvitationsCount: 1,
          },
        });

        fixtures.clerk.user?.getOrganizationMemberships.mockReturnValueOnce(
          Promise.resolve({
            data: [membership],
            total_count: 1,
          }),
        );

        props.setProps({
          afterSelectOrganizationUrl: '/org/:slug',
        });

        const { userEvent, getByRole } = render(<OrganizationList />, {
          wrapper,
        });

        await waitFor(async () => {
          fixtures.clerk.setActive.mockReturnValueOnce(Promise.resolve());
          await userEvent.click(getByRole('button', { name: /Org1/i }));
          expect(fixtures.clerk.setActive).toHaveBeenCalledWith(
            expect.objectContaining({
              organization: membership.organization,
            }),
          );
          expect(fixtures.router.navigate).toHaveBeenCalledWith(`/org/org1`);
        });
      });
    });
  });
});

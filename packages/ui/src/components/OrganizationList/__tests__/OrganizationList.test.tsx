import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, waitFor } from '@/test/utils';

import { OrganizationList } from '../';
import { createFakeOrganization } from '../../CreateOrganization/__tests__/CreateOrganization.test';
import {
  createFakeUserOrganizationInvitation,
  createFakeUserOrganizationMembership,
} from '../../OrganizationSwitcher/__tests__/test-utils';

const { createFixtures } = bindCreateFixtures('OrganizationList');

describe('OrganizationList', () => {
  it('renders component with personal and no data', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        create_organization_enabled: true,
      });
    });

    const { queryByText, queryByRole } = render(<OrganizationList />, { wrapper });

    await waitFor(() => {
      // Header
      expect(queryByRole('heading', { name: /choose an account/i })).toBeInTheDocument();
      // Subheader
      expect(queryByText('to continue to TestApp')).toBeInTheDocument();
      //
      expect(queryByText('Personal account')).toBeInTheDocument();
      expect(queryByRole('menuitem', { name: 'Create organization' })).toBeInTheDocument();
    });
  });

  describe('Personal Account', () => {
    it('hides the personal account with data to list', async () => {
      const { wrapper, props, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          create_organization_enabled: true,
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
        expect(queryByRole('heading', { name: /choose an organization/i })).toBeInTheDocument();
        // Subheader
        expect(queryByText('to continue to TestApp')).toBeInTheDocument();
        // No personal
        expect(queryByText('Personal account')).not.toBeInTheDocument();
        // Display membership
        expect(queryByText('Org1')).toBeInTheDocument();

        expect(queryByRole('menuitem', { name: 'Create organization' })).toBeInTheDocument();
      });
    });

    it('hides the personal account with no data to list', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withOrganizations();
        f.withOrganizationSlug(true);
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

        expect(queryByText('Personal account')).not.toBeInTheDocument();

        // Form fields of CreateOrganizationForm
        expect(queryByLabelText(/name/i)).toBeInTheDocument();
        expect(queryByLabelText(/slug/i)).toBeInTheDocument();

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

      invitation.accept = vi.fn().mockResolvedValue(
        createFakeUserOrganizationInvitation({
          id: '1',
          emailAddress: 'one@clerk.com',
          publicOrganizationData: {
            name: 'OrgOne',
          },
          status: 'accepted',
        }),
      );

      fixtures.clerk.user?.getOrganizationInvitations.mockReturnValue(
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

    describe('with force organization selection setting on environment', () => {
      it('does not show the personal account', async () => {
        const { wrapper } = await createFixtures(f => {
          f.withOrganizations();
          f.withForceOrganizationSelection();
          f.withUser({
            email_addresses: ['test@clerk.com'],
            organization_memberships: [{ name: 'Org1', id: '1', role: 'admin' }],
          });
        });
        const { queryByText } = render(<OrganizationList />, { wrapper });

        await waitFor(() => {
          expect(queryByText('Personal account')).not.toBeInTheDocument();
        });
      });
    });
  });

  describe('CreateOrganization', () => {
    it('display CreateOrganization within OrganizationList', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withOrganizations();
        f.withOrganizationSlug(true);
        f.withUser({
          email_addresses: ['test@clerk.com'],
          create_organization_enabled: true,
        });
      });

      const { queryByLabelText, getByRole, userEvent, findByRole, queryByRole, queryByText } = render(
        <OrganizationList />,
        {
          wrapper,
        },
      );

      // Header
      await waitFor(async () => {
        expect(await findByRole('heading', { name: /choose an account/i })).toBeInTheDocument();
      });

      // Form fields of CreateOrganizationForm not to be there
      expect(queryByText(/logo/i)).not.toBeInTheDocument();
      expect(queryByText('Recommended size 1:1, up to 10MB.')).not.toBeInTheDocument();
      expect(queryByRole('button', { name: 'Upload' })).not.toBeInTheDocument();
      expect(queryByLabelText(/name/i)).not.toBeInTheDocument();
      expect(queryByLabelText(/slug/i)).not.toBeInTheDocument();
      await userEvent.click(getByRole('menuitem', { name: 'Create organization' }));
      // Header
      expect(queryByRole('heading', { name: /Create organization/i })).toBeInTheDocument();
      // Form fields of CreateOrganizationForm
      expect(queryByText(/logo/i)).toBeInTheDocument();
      expect(queryByText('Recommended size 1:1, up to 10MB.')).toBeInTheDocument();
      expect(queryByRole('button', { name: 'Upload' })).toBeInTheDocument();
      expect(queryByLabelText(/name/i)).toBeInTheDocument();
      expect(queryByLabelText(/slug/i)).toBeInTheDocument();

      expect(queryByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(queryByRole('button', { name: 'Create organization' })).toBeInTheDocument();
    });

    it('display CreateOrganization and navigates to Invite Members', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          create_organization_enabled: true,
        });
      });

      const { getByLabelText, getByRole, userEvent, findByLabelText, findByText, findByRole } = render(
        <OrganizationList />,
        {
          wrapper,
        },
      );
      await waitFor(async () =>
        expect(await findByRole('menuitem', { name: 'Create organization' })).toBeInTheDocument(),
      );
      await userEvent.click(getByRole('menuitem', { name: 'Create organization' }));
      await waitFor(async () => expect(await findByLabelText(/name/i)).toBeInTheDocument());
      await userEvent.type(getByLabelText(/name/i), 'new org');
      await userEvent.click(getByRole('button', { name: /create organization/i }));
      await waitFor(async () => {
        expect(await findByText(/Invite new members/i)).toBeInTheDocument();
      });
    });

    it("does not display slug field if it's disabled on environment", async () => {
      const { wrapper } = await createFixtures(f => {
        f.withOrganizations();
        f.withOrganizationSlug(false);
        f.withUser({
          email_addresses: ['test@clerk.com'],
          create_organization_enabled: true,
        });
      });

      const { findByRole, getByRole, userEvent, queryByLabelText } = render(<OrganizationList />, { wrapper });

      await waitFor(async () =>
        expect(await findByRole('menuitem', { name: 'Create organization' })).toBeInTheDocument(),
      );
      await userEvent.click(getByRole('menuitem', { name: 'Create organization' }));
      expect(queryByLabelText(/Name/i)).toBeInTheDocument();
      expect(queryByLabelText(/Slug/i)).not.toBeInTheDocument();
    });

    it("display slug field if it's enabled on environment", async () => {
      const { wrapper } = await createFixtures(f => {
        f.withOrganizations();
        f.withOrganizationSlug(true);
        f.withUser({
          email_addresses: ['test@clerk.com'],
          create_organization_enabled: true,
        });
      });

      const { findByRole, getByRole, userEvent, queryByLabelText } = render(<OrganizationList />, { wrapper });

      await waitFor(async () =>
        expect(await findByRole('menuitem', { name: 'Create organization' })).toBeInTheDocument(),
      );
      await userEvent.click(getByRole('menuitem', { name: 'Create organization' }));
      expect(queryByLabelText(/Name/i)).toBeInTheDocument();
      expect(queryByLabelText(/Slug/i)).toBeInTheDocument();
    });

    it('does not display CreateOrganization within OrganizationList when disabled', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          create_organization_enabled: false,
        });
      });

      const { queryByLabelText, findByRole, queryByRole, queryByText } = render(<OrganizationList />, {
        wrapper,
      });

      // Header
      await waitFor(async () => {
        expect(await findByRole('heading', { name: /choose an account/i })).toBeInTheDocument();
      });

      // Form fields of CreateOrganizationForm not to be there
      expect(queryByText(/logo/i)).not.toBeInTheDocument();
      expect(queryByText('Recommended size 1:1, up to 10MB.')).not.toBeInTheDocument();
      expect(queryByRole('button', { name: 'Upload' })).not.toBeInTheDocument();
      expect(queryByLabelText(/name/i)).not.toBeInTheDocument();
      expect(queryByLabelText(/slug/i)).not.toBeInTheDocument();
      expect(queryByRole('button', { name: 'Create organization' })).not.toBeInTheDocument();
    });

    it('does not display CreateOrganization action if not allowed to create additional membership', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withOrganizations();
        f.withMaxAllowedMemberships({ max: 1 });
        f.withUser({
          email_addresses: ['test@clerk.com'],
          create_organization_enabled: true,
          organization_memberships: [{ name: 'Org1', id: '1', role: 'admin' }],
        });
      });

      const { findByRole, queryByRole } = render(<OrganizationList />, {
        wrapper,
      });

      await waitFor(async () => {
        expect(await findByRole('heading', { name: /choose an account/i })).toBeInTheDocument();
      });
      expect(queryByRole('menuitem', { name: 'Create organization' })).not.toBeInTheDocument();
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
          fixtures.clerk.setSelected.mockReturnValue(Promise.resolve());
          await userEvent.click(getByText(/Personal account/i));

          expect(fixtures.router.navigate).toHaveBeenCalledWith(`/user/test_user_id`);
          expect(fixtures.clerk.setSelected).toHaveBeenCalledWith(
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

        fixtures.clerk.user?.getOrganizationMemberships.mockReturnValue(
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
          fixtures.clerk.setSelected.mockReturnValue(Promise.resolve());
          await userEvent.click(getByRole('button', { name: /Org1/i }));
          expect(fixtures.clerk.setSelected).toHaveBeenCalledWith(
            expect.objectContaining({
              organization: membership.organization,
            }),
          );
          expect(fixtures.router.navigate).toHaveBeenCalledWith(`/org/org1`);
        });
      });

      it('navigates to afterCreateOrganizationUrl', async () => {
        const { wrapper, fixtures, props } = await createFixtures(f => {
          f.withOrganizations();
          f.withUser({
            id: 'test_user_id',
            email_addresses: ['test@clerk.com'],
            create_organization_enabled: true,
          });
        });

        props.setProps({
          afterSelectOrganizationUrl: '/org/:slug',
          afterCreateOrganizationUrl: '/org',
          skipInvitationScreen: true,
        });

        const { userEvent, getByRole, findByLabelText, findByRole, getByLabelText } = render(<OrganizationList />, {
          wrapper,
        });

        fixtures.clerk.setSelected.mockReturnValue(Promise.resolve());
        await waitFor(async () =>
          expect(await findByRole('menuitem', { name: 'Create organization' })).toBeInTheDocument(),
        );
        await userEvent.click(getByRole('menuitem', { name: 'Create organization' }));
        await waitFor(async () => expect(await findByLabelText(/name/i)).toBeInTheDocument());
        await userEvent.type(getByLabelText(/name/i), 'new org');
        await userEvent.click(getByRole('button', { name: /create organization/i }));
        await waitFor(async () => {
          expect(fixtures.router.navigate).toHaveBeenCalledWith(`/org`);
        });
      });
    });
  });
});

import type { MembershipRole } from '@clerk/shared/types';
import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render } from '@/test/utils';

import { OrganizationSwitcher } from '../';
import {
  createFakeUserOrganizationInvitation,
  createFakeUserOrganizationMembership,
  createFakeUserOrganizationSuggestion,
} from './test-utils';

const { createFixtures } = bindCreateFixtures('OrganizationSwitcher');

describe('OrganizationSwitcher', () => {
  it('renders component', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });
    const { getByRole } = await act(() => render(<OrganizationSwitcher />, { wrapper }));
    expect(getByRole('button')).toBeInTheDocument();
  });

  describe('Personal Workspace', () => {
    it('shows the personal workspace when enabled', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });
      props.setProps({ hidePersonal: false });
      const { getByText } = await act(() => render(<OrganizationSwitcher />, { wrapper }));
      expect(getByText('Personal account')).toBeInTheDocument();
    });

    it('does not show the personal workspace when disabled', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });
      props.setProps({ hidePersonal: true });
      const { queryByText, getByRole, userEvent, getByText } = render(<OrganizationSwitcher />, { wrapper });
      await userEvent.click(getByRole('button'));
      expect(queryByText('Personal Workspace')).toBeNull();
      expect(getByText('No organization selected')).toBeInTheDocument();
    });

    describe('with force organization selection setting on environment', () => {
      it('does not show the personal workspace', async () => {
        const { wrapper } = await createFixtures(f => {
          f.withOrganizations();
          f.withForceOrganizationSelection();
          f.withUser({ email_addresses: ['test@clerk.com'] });
        });
        const { queryByText, getByRole, userEvent } = render(<OrganizationSwitcher />, { wrapper });
        await userEvent.click(getByRole('button'));
        expect(queryByText('Personal Workspace')).toBeNull();
      });
    });
  });

  describe('OrganizationSwitcherTrigger', () => {
    it('shows OrganizationPreview when user has an active organization', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Test Organization', id: '1', role: 'admin' }],
        });
      });

      // Set the active organization in the context
      fixtures.clerk.organization = {
        id: '1',
        name: 'Test Organization',
        slug: 'test-organization',
        membersCount: 1,
        pendingInvitationsCount: 0,
        adminDeleteEnabled: true,
        maxAllowedMemberships: 100,
      } as any;

      const { getByText } = render(<OrganizationSwitcher />, { wrapper });
      expect(getByText('Test Organization')).toBeInTheDocument();
    });

    it('shows PersonalWorkspacePreview when user has no active organization and hidePersonal is false', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      props.setProps({ hidePersonal: false });
      const { getByText } = render(<OrganizationSwitcher />, { wrapper });
      expect(getByText('Personal account')).toBeInTheDocument();
    });

    it('shows "No organization selected" when user has no active organization and hidePersonal is true', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

      props.setProps({ hidePersonal: true });
      const { getByText } = render(<OrganizationSwitcher />, { wrapper });
      expect(getByText('No organization selected')).toBeInTheDocument();
    });

    it('shows the counter for pending suggestions and invitations', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', id: '1', permissions: ['org:sys_memberships:manage'] }],
        });
      });

      fixtures.clerk.organization?.getRoles.mockRejectedValue(null);
      fixtures.clerk.user?.getOrganizationInvitations.mockReturnValueOnce(
        Promise.resolve({
          data: [],
          total_count: 2,
        }),
      );

      fixtures.clerk.user?.getOrganizationSuggestions.mockReturnValueOnce(
        Promise.resolve({
          data: [],
          total_count: 3,
        }),
      );

      const { findByText } = render(<OrganizationSwitcher />, { wrapper });
      expect(await findByText('5')).toBeInTheDocument();
    });

    it('shows the counter for pending suggestions and invitations and membership requests', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withOrganizationDomains();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', id: '1', role: 'admin' }],
        });
      });

      fixtures.clerk.organization?.getMembershipRequests.mockReturnValue(
        Promise.resolve({
          data: [],
          total_count: 2,
        }),
      );

      fixtures.clerk.user?.getOrganizationInvitations.mockReturnValueOnce(
        Promise.resolve({
          data: [],
          total_count: 2,
        }),
      );

      fixtures.clerk.user?.getOrganizationSuggestions.mockReturnValueOnce(
        Promise.resolve({
          data: [],
          total_count: 3,
        }),
      );
      const { findByText } = render(<OrganizationSwitcher />, { wrapper });
      expect(await findByText('7')).toBeInTheDocument();
    });
  });

  describe('OrganizationSwitcherPopover', () => {
    it('opens the organization switcher popover when clicked', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({ email_addresses: ['test@clerk.com'], create_organization_enabled: true });
      });

      props.setProps({ hidePersonal: true });
      const { getByText, getByRole, userEvent } = render(<OrganizationSwitcher />, { wrapper });
      await userEvent.click(getByRole('button', { name: 'Open organization switcher' }));
      expect(getByText('Create organization')).toBeInTheDocument();
    });

    it('renders organization switcher popover as standalone', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({ email_addresses: ['test@clerk.com'], create_organization_enabled: true });
      });
      props.setProps({
        __experimental_asStandalone: true,
      });
      const { getByText, queryByRole } = render(<OrganizationSwitcher />, { wrapper });
      await waitFor(() => {
        expect(queryByRole('button', { name: 'Open organization switcher' })).toBeNull();
        expect(getByText('Personal account')).toBeInTheDocument();
      });
    });

    it('lists all organizations the user belongs to', async () => {
      const { wrapper, props, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: ['Org1', 'Org2'] });
      });
      fixtures.clerk.organization?.getRoles.mockRejectedValue(null);

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
            createFakeUserOrganizationMembership({
              id: '2',
              organization: {
                id: '2',
                name: 'Org2',
                slug: 'org2',
                membersCount: 1,
                adminDeleteEnabled: false,
                maxAllowedMemberships: 1,
                pendingInvitationsCount: 1,
              },
            }),
          ],
          total_count: 2,
        }),
      );

      props.setProps({ hidePersonal: false });
      const { getAllByText, getByText, getByRole, userEvent } = render(<OrganizationSwitcher />, { wrapper });
      await userEvent.click(getByRole('button'));
      expect(fixtures.clerk.user?.getOrganizationMemberships).toHaveBeenCalledTimes(1);
      expect(fixtures.clerk.user?.getOrganizationMemberships.mock.calls[0][0]).toStrictEqual({
        initialPage: 1,
        pageSize: 10,
      });
      expect(getAllByText('Org1')).not.toBeNull();
      expect(getByText('Personal account')).toBeInTheDocument();
      expect(getByText('Org2')).toBeInTheDocument();
    });

    it.each([
      ['Admin', 'admin'],
      ['Member', 'basic_member'],
      ['Guest', 'guest_member'],
    ])('shows the text "%s" for the %s role in the active organization', async (text, role) => {
      const { wrapper, props } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: role as MembershipRole }],
        });
      });

      props.setProps({ hidePersonal: true });
      const { getAllByText, getByText, getByRole, userEvent } = render(<OrganizationSwitcher />, { wrapper });
      await userEvent.click(getByRole('button'));
      expect(getAllByText('Org1').length).toBeGreaterThan(0);
      expect(getByText(text)).toBeInTheDocument();
    });

    it('opens organization profile when "Manage Organization" is clicked', async () => {
      const { wrapper, fixtures, props } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
        });
      });

      props.setProps({ hidePersonal: true });
      const { getByRole, userEvent } = render(<OrganizationSwitcher />, { wrapper });
      await userEvent.click(getByRole('button'));
      await userEvent.click(getByRole('menuitem'));
      expect(fixtures.clerk.openOrganizationProfile).toHaveBeenCalled();
    });

    it('opens create organization when the respective button is clicked', async () => {
      const { wrapper, fixtures, props } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
          create_organization_enabled: true,
        });
      });

      props.setProps({ hidePersonal: true });
      const { getByRole, userEvent } = render(<OrganizationSwitcher />, { wrapper });
      await userEvent.click(getByRole('button', { name: 'Open organization switcher' }));
      await userEvent.click(getByRole('menuitem', { name: 'Create organization' }));
      expect(fixtures.clerk.openCreateOrganization).toHaveBeenCalled();
    });

    it('opens create organization without slug field', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withOrganizationSlug(false);
        f.withUser({
          email_addresses: ['test@clerk.com'],
          create_organization_enabled: true,
        });
      });

      const { getByRole, queryByLabelText, userEvent } = render(<OrganizationSwitcher />, { wrapper });
      await userEvent.click(getByRole('button', { name: 'Open organization switcher' }));
      await userEvent.click(getByRole('menuitem', { name: 'Create organization' }));
      expect(fixtures.clerk.openCreateOrganization).toHaveBeenCalled();
      expect(queryByLabelText(/Slug/i)).not.toBeInTheDocument();
    });

    it('does not display create organization button if permissions not present', async () => {
      const { wrapper, props } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
          create_organization_enabled: false,
        });
      });

      props.setProps({ hidePersonal: true });
      const { queryByRole } = await act(() => render(<OrganizationSwitcher />, { wrapper }));
      expect(queryByRole('button', { name: 'Create organization' })).not.toBeInTheDocument();
    });

    it('displays a list of user invitations', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
          create_organization_enabled: false,
        });
      });

      fixtures.clerk.user?.getOrganizationInvitations.mockReturnValueOnce(
        Promise.resolve({
          data: [
            createFakeUserOrganizationInvitation({
              id: '1',
              emailAddress: 'one@clerk.com',
              publicOrganizationData: {
                name: 'OrgOne',
              },
            }),
            createFakeUserOrganizationInvitation({
              id: '2',
              emailAddress: 'two@clerk.com',
              publicOrganizationData: { name: 'OrgTwo' },
            }),
          ],
          total_count: 11,
        }),
      );
      const { queryByText, userEvent, getByRole } = render(<OrganizationSwitcher />, {
        wrapper,
      });

      await userEvent.click(getByRole('button'));

      expect(fixtures.clerk.user?.getOrganizationInvitations).toHaveBeenCalledWith({
        initialPage: 1,
        pageSize: 10,
        status: 'pending',
      });
      expect(queryByText('OrgOne')).toBeInTheDocument();
      expect(queryByText('OrgTwo')).toBeInTheDocument();
    });

    it('displays a list of user suggestions', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
          create_organization_enabled: false,
        });
      });

      fixtures.clerk.user?.getOrganizationSuggestions.mockReturnValueOnce(
        Promise.resolve({
          data: [
            createFakeUserOrganizationSuggestion({
              id: '1',
              emailAddress: 'one@clerk.com',
              publicOrganizationData: {
                name: 'OrgOneSuggestion',
              },
            }),
            createFakeUserOrganizationSuggestion({
              id: '2',
              emailAddress: 'two@clerk.com',
              publicOrganizationData: {
                name: 'OrgTwoSuggestion',
              },
            }),
          ],
          total_count: 11,
        }),
      );
      const { queryByText, userEvent, getByRole } = render(<OrganizationSwitcher />, {
        wrapper,
      });

      await userEvent.click(getByRole('button'));

      expect(fixtures.clerk.user?.getOrganizationSuggestions).toHaveBeenCalledWith({
        initialPage: 1,
        pageSize: 10,
        status: ['pending', 'accepted'],
      });
      expect(queryByText('OrgOneSuggestion')).toBeInTheDocument();
      expect(queryByText('OrgTwoSuggestion')).toBeInTheDocument();
    });

    it("switches between active organizations when one is clicked'", async () => {
      const { wrapper, props, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [
            { name: 'Org1', role: 'basic_member' },
            { name: 'Org2', role: 'admin' },
          ],
          create_organization_enabled: false,
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
            createFakeUserOrganizationMembership({
              id: '2',
              organization: {
                id: '2',
                name: 'Org2',
                slug: 'org2',
                membersCount: 1,
                adminDeleteEnabled: false,
                maxAllowedMemberships: 1,
                pendingInvitationsCount: 1,
              },
            }),
          ],
          total_count: 2,
        }),
      );

      fixtures.clerk.setActive.mockReturnValueOnce(Promise.resolve());

      props.setProps({ hidePersonal: true });
      const { getByRole, getByText, userEvent } = render(<OrganizationSwitcher />, { wrapper });
      await userEvent.click(getByRole('button'));
      expect(fixtures.clerk.user?.getOrganizationMemberships).toHaveBeenCalledTimes(1);
      expect(fixtures.clerk.user?.getOrganizationMemberships.mock.calls[0][0]).toStrictEqual({
        initialPage: 1,
        pageSize: 10,
      });
      await userEvent.click(getByText('Org2'));

      expect(fixtures.clerk.setActive).toHaveBeenCalledWith(
        expect.objectContaining({
          organization: expect.objectContaining({
            name: 'Org2',
          }),
        }),
      );
    });

    it("switches to personal workspace when clicked'", async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [
            { name: 'Org1', role: 'basic_member' },
            { name: 'Org2', role: 'admin' },
          ],
        });
      });

      fixtures.clerk.setActive.mockReturnValueOnce(Promise.resolve());
      const { getByRole, getByText, userEvent } = render(<OrganizationSwitcher />, { wrapper });
      await userEvent.click(getByRole('button'));
      expect(fixtures.clerk.user?.getOrganizationMemberships).toHaveBeenCalledTimes(1);
      expect(fixtures.clerk.user?.getOrganizationMemberships.mock.calls[0][0]).toStrictEqual({
        initialPage: 1,
        pageSize: 10,
      });
      await userEvent.click(getByText(/Personal account/i));

      expect(fixtures.clerk.setActive).toHaveBeenCalledWith(
        expect.objectContaining({
          organization: null,
        }),
      );
    });
  });
});

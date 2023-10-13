import type { MembershipRole } from '@clerk/types';
import { describe } from '@jest/globals';

import { act, render, runFakeTimers, waitFor } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { OrganizationSwitcher } from '../OrganizationSwitcher';
import { createFakeUserOrganizationInvitation, createFakeUserOrganizationSuggestion } from './utlis';

const { createFixtures } = bindCreateFixtures('OrganizationSwitcher');

describe('OrganizationSwitcher', () => {
  it('renders component', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });
    fixtures.clerk.session?.isAuthorized.mockResolvedValue(false);
    const { queryByRole } = await act(() => render(<OrganizationSwitcher />, { wrapper }));
    expect(queryByRole('button')).toBeDefined();
  });

  describe('Personal Workspace', () => {
    it('shows the personal workspace when enabled', async () => {
      const { wrapper, props, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });
      fixtures.clerk.session?.isAuthorized.mockResolvedValue(false);
      props.setProps({ hidePersonal: false });
      const { getByText } = await act(() => render(<OrganizationSwitcher />, { wrapper }));
      expect(getByText('Personal account')).toBeDefined();
    });

    it('does not show the personal workspace when disabled', async () => {
      const { wrapper, props, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });
      fixtures.clerk.session?.isAuthorized.mockResolvedValue(false);
      props.setProps({ hidePersonal: true });
      const { queryByText, getByRole, userEvent, getByText } = render(<OrganizationSwitcher />, { wrapper });
      await userEvent.click(getByRole('button'));
      expect(queryByText('Personal Workspace')).toBeNull();
      expect(getByText('No organization selected')).toBeDefined();
    });
  });

  describe('OrganizationSwitcherTrigger', () => {
    it('shows the counter for pending suggestions and invitations', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({ email_addresses: ['test@clerk.com'] });
      });

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

      fixtures.clerk.session?.isAuthorized.mockResolvedValue(true);

      await runFakeTimers(async () => {
        const { getByText } = render(<OrganizationSwitcher />, { wrapper });

        await waitFor(() => {
          expect(getByText('5')).toBeInTheDocument();
        });
      });
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

      fixtures.clerk.session?.isAuthorized.mockResolvedValue(true);

      await runFakeTimers(async () => {
        const { getByText } = render(<OrganizationSwitcher />, { wrapper });

        await waitFor(() => {
          expect(getByText('7')).toBeInTheDocument();
        });
      });
    });
  });

  describe('OrganizationSwitcherPopover', () => {
    it('opens the organization switcher popover when clicked', async () => {
      const { wrapper, props, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({ email_addresses: ['test@clerk.com'], create_organization_enabled: true });
      });
      fixtures.clerk.session?.isAuthorized.mockResolvedValue(false);
      props.setProps({ hidePersonal: true });
      const { getByText, getByRole, userEvent } = render(<OrganizationSwitcher />, { wrapper });
      await userEvent.click(getByRole('button'));
      expect(getByText('Create Organization')).toBeDefined();
    });

    it('lists all organizations the user belongs to', async () => {
      const { wrapper, props, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: ['Org1', 'Org2'] });
      });
      fixtures.clerk.session?.isAuthorized.mockResolvedValue(false);
      props.setProps({ hidePersonal: false });
      const { getAllByText, getByText, getByRole, userEvent } = render(<OrganizationSwitcher />, { wrapper });
      await userEvent.click(getByRole('button'));
      expect(getAllByText('Org1')).not.toBeNull();
      expect(getByText('Personal account')).toBeDefined();
      expect(getByText('Org2')).toBeDefined();
    });

    it.each([
      ['Admin', 'admin'],
      ['Member', 'basic_member'],
      ['Guest', 'guest_member'],
    ])('shows the text "%s" for the %s role in the active organization', async (text, role) => {
      const { wrapper, props, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: role as MembershipRole }],
        });
      });
      fixtures.clerk.session?.isAuthorized.mockResolvedValue(false);
      props.setProps({ hidePersonal: true });
      const { getAllByText, getByText, getByRole, userEvent } = render(<OrganizationSwitcher />, { wrapper });
      await userEvent.click(getByRole('button'));
      expect(getAllByText('Org1')).not.toBeNull();
      expect(getByText(text)).toBeDefined();
    });

    it('opens organization profile when "Manage Organization" is clicked', async () => {
      const { wrapper, fixtures, props } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
        });
      });
      fixtures.clerk.session?.isAuthorized.mockResolvedValue(false);
      props.setProps({ hidePersonal: true });
      const { getByRole, userEvent } = render(<OrganizationSwitcher />, { wrapper });
      await userEvent.click(getByRole('button'));
      await userEvent.click(getByRole('menuitem', { name: 'Manage Organization' }));
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
      fixtures.clerk.session?.isAuthorized.mockResolvedValue(false);
      props.setProps({ hidePersonal: true });
      const { getByRole, userEvent } = render(<OrganizationSwitcher />, { wrapper });
      await userEvent.click(getByRole('button', { name: 'Open organization switcher' }));
      await userEvent.click(getByRole('menuitem', { name: 'Create Organization' }));
      expect(fixtures.clerk.openCreateOrganization).toHaveBeenCalled();
    });

    it('does not display create organization button if permissions not present', async () => {
      const { wrapper, props, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'basic_member' }],
          create_organization_enabled: false,
        });
      });
      fixtures.clerk.session?.isAuthorized.mockResolvedValue(false);
      props.setProps({ hidePersonal: true });
      const { queryByRole } = await act(() => render(<OrganizationSwitcher />, { wrapper }));
      expect(queryByRole('button', { name: 'Create Organization' })).not.toBeInTheDocument();
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
      fixtures.clerk.session?.isAuthorized.mockResolvedValue(false);
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
      fixtures.clerk.session?.isAuthorized.mockResolvedValue(false);
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
      fixtures.clerk.setActive.mockReturnValueOnce(Promise.resolve());
      fixtures.clerk.session?.isAuthorized.mockResolvedValue(false);

      props.setProps({ hidePersonal: true });
      const { getByRole, getByText, userEvent } = render(<OrganizationSwitcher />, { wrapper });
      await userEvent.click(getByRole('button'));
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

      fixtures.clerk.session?.isAuthorized.mockResolvedValue(false);
      fixtures.clerk.setActive.mockReturnValueOnce(Promise.resolve());
      const { getByRole, getByText, userEvent } = render(<OrganizationSwitcher />, { wrapper });
      await userEvent.click(getByRole('button'));
      await userEvent.click(getByText(/Personal account/i));

      expect(fixtures.clerk.setActive).toHaveBeenCalledWith(
        expect.objectContaining({
          organization: null,
        }),
      );
    });
  });
});

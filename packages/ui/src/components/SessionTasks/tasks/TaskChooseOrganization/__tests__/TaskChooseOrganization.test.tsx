import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';
import {
  createFakeUserOrganizationMembership,
  createFakeUserOrganizationSuggestion,
} from '@/ui/components/OrganizationSwitcher/__tests__/test-utils';

import { TaskChooseOrganization } from '..';
import { findByText } from '@testing-library/react';

const { createFixtures } = bindCreateFixtures('TaskChooseOrganization');

describe('TaskChooseOrganization', () => {
  it('does not render component without existing session task', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        create_organization_enabled: true,
      });
    });

    const { queryByText, queryByRole } = render(<TaskChooseOrganization />, { wrapper });

    expect(queryByText('Setup your organization')).not.toBeInTheDocument();
    expect(queryByText('Enter your organization details to continue')).not.toBeInTheDocument();
    expect(queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
  });

  it('renders component when session task exists', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        create_organization_enabled: true,
        tasks: [{ key: 'choose-organization' }],
      });
    });

    const { findByText, findByRole } = render(<TaskChooseOrganization />, { wrapper });

    expect(await findByText('Setup your organization')).toBeInTheDocument();
    expect(await findByText('Enter your organization details to continue')).toBeInTheDocument();
    expect(await findByRole('link', { name: /sign out/i })).toBeInTheDocument();
  });

  it('shows create organization screen when user has no existing resources', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        create_organization_enabled: true,
        tasks: [{ key: 'choose-organization' }],
      });
    });

    const { findByRole, findByText } = render(<TaskChooseOrganization />, { wrapper });

    expect(await findByRole('textbox', { name: /name/i })).toBeInTheDocument();
    expect(await findByText('Continue')).toBeInTheDocument();
  });

  it('shows choose organization screen when user has existing organizations', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        create_organization_enabled: true,
        tasks: [{ key: 'choose-organization' }],
      });
    });

    fixtures.clerk.user?.getOrganizationMemberships.mockReturnValueOnce(
      Promise.resolve({
        data: [
          createFakeUserOrganizationMembership({
            id: '1',
            organization: {
              id: '1',
              name: 'Existing Org',
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

    const { findByText, queryByRole } = render(<TaskChooseOrganization />, { wrapper });

    expect(await findByText('Existing Org')).toBeInTheDocument();
    expect(await findByText('Create new organization')).toBeInTheDocument();
    expect(queryByRole('textbox', { name: /name/i })).not.toBeInTheDocument();
  });

  it('allows switching between choose and create organization screens', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        create_organization_enabled: true,
        tasks: [{ key: 'choose-organization' }],
      });
    });

    fixtures.clerk.user?.getOrganizationMemberships.mockReturnValueOnce(
      Promise.resolve({
        data: [
          createFakeUserOrganizationMembership({
            id: '1',
            organization: {
              id: '1',
              name: 'Existing Org',
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

    const { findByText, findByRole, queryByRole, queryByText } = render(<TaskChooseOrganization />, { wrapper });

    expect(await findByText('Existing Org')).toBeInTheDocument();
    expect(await findByText('Create new organization')).toBeInTheDocument();
    expect(queryByRole('textbox', { name: /name/i })).not.toBeInTheDocument();

    const createButton = await findByText('Create new organization');
    await userEvent.click(createButton);

    expect(await findByRole('textbox', { name: /name/i })).toBeInTheDocument();
    expect(await findByRole('button', { name: /continue/i })).toBeInTheDocument();
    expect(await findByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(queryByText('Existing Org')).not.toBeInTheDocument();

    const cancelButton = await findByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    expect(await findByText('Existing Org')).toBeInTheDocument();
    expect(await findByText('Create new organization')).toBeInTheDocument();
    expect(queryByRole('textbox', { name: /name/i })).not.toBeInTheDocument();
  });

  it('displays user identifier in sign out section', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['user@test.com'],
        create_organization_enabled: true,
        tasks: [{ key: 'choose-organization' }],
      });
    });

    const { findByText } = render(<TaskChooseOrganization />, { wrapper });

    expect(await findByText(/user@test\.com/)).toBeInTheDocument();
    expect(await findByText('Sign out')).toBeInTheDocument();
  });

  it('handles sign out correctly', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        create_organization_enabled: true,
        tasks: [{ key: 'choose-organization' }],
      });
    });

    const { findByRole } = render(<TaskChooseOrganization />, { wrapper });
    const signOutButton = await findByRole('link', { name: /sign out/i });

    await userEvent.click(signOutButton);

    expect(fixtures.clerk.signOut).toHaveBeenCalled();
  });

  it('renders with username when email is not available', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        username: 'testuser',
        create_organization_enabled: true,
        tasks: [{ key: 'choose-organization' }],
      });
    });

    const { findByText } = render(<TaskChooseOrganization />, { wrapper });

    expect(await findByText(/testuser/)).toBeInTheDocument();
  });

  it('does not allow creating organization if not allowed to create additional membership', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withMaxAllowedMemberships({ max: 1 });
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        create_organization_enabled: true,
        tasks: [{ key: 'choose-organization' }],
      });
    });

    fixtures.clerk.user?.getOrganizationMemberships.mockReturnValueOnce(
      Promise.resolve({
        data: [
          createFakeUserOrganizationMembership({
            id: '1',
            organization: {
              id: '1',
              name: 'Existing Org',
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

    const { findByText, queryByText } = render(<TaskChooseOrganization />, { wrapper });

    expect(await findByText('Existing Org')).toBeInTheDocument();
    expect(queryByText('Create new organization')).not.toBeInTheDocument();
  });

  describe('on create organization form', () => {
    it("does not display slug field if it's disabled on environment", async () => {
      const { wrapper } = await createFixtures(f => {
        f.withOrganizations();
        f.withOrganizationSlug(false);
        f.withForceOrganizationSelection();
        f.withUser({
          create_organization_enabled: true,
          tasks: [{ key: 'choose-organization' }],
        });
      });

      const { findByRole, queryByLabelText } = render(<TaskChooseOrganization />, { wrapper });

      expect(await findByRole('textbox', { name: /name/i })).toBeInTheDocument();
      expect(queryByLabelText(/Slug/i)).not.toBeInTheDocument();
    });

    it("display slug field if it's enabled on environment", async () => {
      const { wrapper } = await createFixtures(f => {
        f.withOrganizations();
        f.withOrganizationSlug(true);
        f.withForceOrganizationSelection();
        f.withUser({
          create_organization_enabled: true,
          tasks: [{ key: 'choose-organization' }],
        });
      });

      const { findByRole, queryByLabelText } = render(<TaskChooseOrganization />, { wrapper });

      expect(await findByRole('textbox', { name: /name/i })).toBeInTheDocument();
      expect(queryByLabelText(/Slug/i)).toBeInTheDocument();
    });
  });

  describe('when users are not allowed to create organizations', () => {
    it('does not display create organization screen', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withOrganizations();
        f.withForceOrganizationSelection();
        f.withUser({
          create_organization_enabled: false,
          tasks: [{ key: 'choose-organization' }],
        });
      });

      const { queryByText } = render(<TaskChooseOrganization />, { wrapper });

      expect(queryByText(/create new organization/i)).not.toBeInTheDocument();
      expect(queryByText(/you must belong to an organization/i)).toBeInTheDocument();
      expect(queryByText(/contact your organization admin for an invitation/i)).toBeInTheDocument();
    });

    it('with existing memberships or suggestions, displays create organization screen', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withForceOrganizationSelection();
        f.withUser({
          create_organization_enabled: false,
          tasks: [{ key: 'choose-organization' }],
        });
      });

      fixtures.clerk.user?.getOrganizationMemberships.mockReturnValueOnce(
        Promise.resolve({
          data: [
            createFakeUserOrganizationMembership({
              id: '1',
              organization: {
                id: '1',
                name: 'Existing Org',
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

      fixtures.clerk.user?.getOrganizationSuggestions.mockReturnValueOnce(
        Promise.resolve({
          data: [
            createFakeUserOrganizationSuggestion({
              id: '2',
              emailAddress: 'two@clerk.com',
              publicOrganizationData: {
                name: 'OrgTwoSuggestion',
              },
            }),
          ],
          total_count: 1,
        }),
      );

      const { findByText, queryByText } = render(<TaskChooseOrganization />, { wrapper });

      expect(await findByText('Join an existing organization')).toBeInTheDocument();
      expect(await queryByText('Create new organization')).not.toBeInTheDocument();
      expect(await findByText('Existing Org')).toBeInTheDocument();
    });
  });

  describe('with organization creation defaults', () => {
    describe('when enabled on environment', () => {
      it.todo('displays warning when organization already exists for user email domain');

      it.todo('prefills create organization form with defaults');
    });

    describe('when disabled on environment', () => {
      it.todo('does not fetch for creation defaults');
    });
  });
});

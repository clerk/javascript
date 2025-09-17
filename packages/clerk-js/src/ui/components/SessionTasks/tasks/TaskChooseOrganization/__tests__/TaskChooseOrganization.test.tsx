import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { createFakeUserOrganizationMembership } from '@/ui/components/OrganizationSwitcher/__tests__/utlis';
import { TaskChooseOrganizationContext } from '@/ui/contexts/components/SessionTasks';
import { bindCreateFixtures, render, waitFor } from '@/vitestUtils';

import { TaskChooseOrganization } from '..';

const { createFixtures } = bindCreateFixtures('TaskChooseOrganization');

const TaskChooseOrganizationWithContext = ({
  redirectUrlComplete = '/dashboard',
}: {
  redirectUrlComplete?: string;
}) => (
  <TaskChooseOrganizationContext.Provider value={{ componentName: 'TaskChooseOrganization', redirectUrlComplete }}>
    <TaskChooseOrganization />
  </TaskChooseOrganizationContext.Provider>
);

describe('TaskChooseOrganization', () => {
  it('does not render component without existing session task', async () => {
    const { wrapper, props } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        create_organization_enabled: true,
      });
    });

    props.setProps({ redirectUrlComplete: '/dashboard' });

    const { queryByText, queryByRole } = render(<TaskChooseOrganizationWithContext />, { wrapper });

    await waitFor(() => {
      expect(queryByText('Setup your organization')).not.toBeInTheDocument();
      expect(queryByText('Enter your organization details to continue')).not.toBeInTheDocument();
      expect(queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
    });
  });

  it('renders component when session task exists', async () => {
    const { wrapper, props } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        create_organization_enabled: true,
        tasks: [{ key: 'choose-organization' }],
      });
    });

    props.setProps({ redirectUrlComplete: '/dashboard' });

    const { getByText, getByRole } = render(<TaskChooseOrganizationWithContext />, { wrapper });

    await waitFor(() => {
      expect(getByText('Setup your organization')).toBeInTheDocument();
      expect(getByText('Enter your organization details to continue')).toBeInTheDocument();
      expect(getByRole('link', { name: /sign out/i })).toBeInTheDocument();
    });
  });

  it('shows create organization screen when user has no existing resources', async () => {
    const { wrapper, props } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        create_organization_enabled: true,
        tasks: [{ key: 'choose-organization' }],
      });
    });

    props.setProps({ redirectUrlComplete: '/dashboard' });

    const { getByRole, getByText } = render(<TaskChooseOrganizationWithContext />, { wrapper });

    await waitFor(() => {
      expect(getByRole('textbox', { name: /name/i })).toBeInTheDocument();
      expect(getByText('Continue')).toBeInTheDocument();
    });
  });

  it('shows choose organization screen when user has existing organizations', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        create_organization_enabled: true,
        tasks: [{ key: 'choose-organization' }],
      });
    });

    props.setProps({ redirectUrlComplete: '/dashboard' });

    (fixtures.clerk.user?.getOrganizationMemberships as any).mockReturnValue(
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

    const { getByText, queryByRole } = render(<TaskChooseOrganizationWithContext />, { wrapper });

    await waitFor(() => {
      expect(getByText('Existing Org')).toBeInTheDocument();
      expect(getByText('Create new organization')).toBeInTheDocument();
      expect(queryByRole('textbox', { name: /name/i })).not.toBeInTheDocument();
    });
  });

  it('allows switching between choose and create organization screens', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        create_organization_enabled: true,
        tasks: [{ key: 'choose-organization' }],
      });
    });

    props.setProps({ redirectUrlComplete: '/dashboard' });

    (fixtures.clerk.user?.getOrganizationMemberships as any).mockReturnValue(
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

    const { getByText, getByRole, queryByRole, queryByText } = render(<TaskChooseOrganizationWithContext />, {
      wrapper,
    });

    await waitFor(() => {
      expect(getByText('Existing Org')).toBeInTheDocument();
      expect(getByText('Create new organization')).toBeInTheDocument();
      expect(queryByRole('textbox', { name: /name/i })).not.toBeInTheDocument();
    });

    const createButton = getByText('Create new organization');
    await userEvent.click(createButton);

    await waitFor(() => {
      expect(getByRole('textbox', { name: /name/i })).toBeInTheDocument();
      expect(getByRole('button', { name: /continue/i })).toBeInTheDocument();
      expect(getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(queryByText('Existing Org')).not.toBeInTheDocument();
    });

    const cancelButton = getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    await waitFor(() => {
      expect(getByText('Existing Org')).toBeInTheDocument();
      expect(getByText('Create new organization')).toBeInTheDocument();
      expect(queryByRole('textbox', { name: /name/i })).not.toBeInTheDocument();
    });
  });

  it('displays user identifier in sign out section', async () => {
    const { wrapper, props } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['user@test.com'],
        create_organization_enabled: true,
        tasks: [{ key: 'choose-organization' }],
      });
    });

    props.setProps({ redirectUrlComplete: '/dashboard' });

    const { getByText } = render(<TaskChooseOrganizationWithContext />, { wrapper });

    await waitFor(() => {
      expect(getByText(/user@test\.com/)).toBeInTheDocument();
      expect(getByText('Sign out')).toBeInTheDocument();
    });
  });

  it('handles sign out correctly', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        create_organization_enabled: true,
        tasks: [{ key: 'choose-organization' }],
      });
    });

    props.setProps({ redirectUrlComplete: '/dashboard' });

    const { getByRole } = render(<TaskChooseOrganizationWithContext />, { wrapper });
    const signOutButton = getByRole('link', { name: /sign out/i });

    await userEvent.click(signOutButton);

    expect(fixtures.clerk.signOut).toHaveBeenCalled();
  });

  it('renders with username when email is not available', async () => {
    const { wrapper, props } = await createFixtures(f => {
      f.withOrganizations();
      f.withForceOrganizationSelection();
      f.withUser({
        username: 'testuser',
        create_organization_enabled: true,
        tasks: [{ key: 'choose-organization' }],
      });
    });

    props.setProps({ redirectUrlComplete: '/dashboard' });

    const { getByText } = render(<TaskChooseOrganizationWithContext />, { wrapper });

    expect(getByText(/testuser/)).toBeInTheDocument();
  });
});

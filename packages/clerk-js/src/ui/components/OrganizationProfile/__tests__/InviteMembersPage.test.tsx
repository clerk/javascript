import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { OrganizationInvitationResource } from '@clerk/shared/types';
import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';

import { Action } from '../../../elements/Action';
import { clearFetchCache } from '../../../hooks';
import { InviteMembersScreen } from '../InviteMembersScreen';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

describe('InviteMembersPage', () => {
  /**
   * `<InviteMembersPage/>` internally uses useFetch which caches the results, be sure to clear the cache before each test
   */
  beforeEach(() => {
    clearFetchCache();
  });

  it('disables the role select when role set migration is in progress', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: [{ name: 'Org1', role: 'admin' }],
      });
    });

    fixtures.clerk.organization?.getInvitations.mockRejectedValue(null);
    fixtures.clerk.organization?.getRoles.mockResolvedValue({
      total_count: 2,
      has_role_set_migration: true,
      data: [
        {
          pathRoot: '',
          reload: vi.fn(),
          id: 'member',
          key: 'member',
          name: 'member',
          description: '',
          permissions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          pathRoot: '',
          reload: vi.fn(),
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

    const { getByRole } = render(
      <Action.Root>
        <InviteMembersScreen />
      </Action.Root>,
      { wrapper },
    );

    await waitFor(() => {
      expect(getByRole('button', { name: /select role/i })).toBeDisabled();
    });
  });

  it('renders the component', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withOrganizations();
      f.withUser({
        email_addresses: ['test@clerk.com'],
        organization_memberships: [{ name: 'Org1', role: 'admin' }],
      });
    });

    fixtures.clerk.organization?.getInvitations.mockRejectedValue(null);
    fixtures.clerk.organization?.getRoles.mockRejectedValue(null);

    const { findByText, getByText } = render(
      <Action.Root>
        <InviteMembersScreen />
      </Action.Root>,
      { wrapper },
    );

    await waitFor(async () => expect(await findByText('Invite new members')).toBeInTheDocument());
    getByText('Enter or paste one or more email addresses, separated by spaces or commas.');
  });

  describe('with default role', () => {
    it("initializes with the organization's default role", async () => {
      const defaultRole = 'mydefaultrole';

      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withOrganizationDomains(undefined, defaultRole);
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'admin' }],
        });
      });

      fixtures.clerk.organization?.getInvitations.mockRejectedValue(null);
      fixtures.clerk.organization?.getRoles.mockResolvedValue({
        total_count: 2,
        data: [
          {
            pathRoot: '',
            reload: vi.fn(),
            id: 'member',
            key: 'member',
            name: 'member',
            description: '',
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            pathRoot: '',
            reload: vi.fn(),
            id: 'admin',
            key: 'admin',
            name: 'Admin',
            description: '',
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            pathRoot: '',
            reload: vi.fn(),
            id: defaultRole,
            key: defaultRole,
            name: defaultRole,
            description: '',
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });

      fixtures.clerk.organization?.inviteMembers.mockResolvedValueOnce([{}] as OrganizationInvitationResource[]);
      const { getByRole, userEvent, getByTestId } = render(
        <Action.Root>
          <InviteMembersScreen />
        </Action.Root>,
        { wrapper },
      );
      await userEvent.type(getByTestId('tag-input'), 'test+1@clerk.com,');
      await userEvent.click(getByRole('button', { name: /mydefaultrole/i }));
    });

    it("initializes if there's only one role available", async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'admin' }],
        });
      });

      fixtures.clerk.organization?.getInvitations.mockRejectedValue(null);
      fixtures.clerk.organization?.getRoles.mockResolvedValue({
        total_count: 1,
        data: [
          {
            pathRoot: '',
            reload: vi.fn(),
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
      const { getByRole, userEvent, getByTestId } = render(
        <Action.Root>
          <InviteMembersScreen />
        </Action.Root>,
        { wrapper },
      );
      await userEvent.type(getByTestId('tag-input'), 'test+1@clerk.com,');
      await waitFor(() => expect(getByRole('button', { name: /member/i })).toBeInTheDocument());
    });

    it("does not initialize if there's neither a default role nor a unique role", async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'admin' }],
        });
      });

      fixtures.clerk.organization?.getInvitations.mockRejectedValue(null);
      fixtures.clerk.organization?.getRoles.mockResolvedValue({
        total_count: 1,
        data: [
          {
            pathRoot: '',
            reload: vi.fn(),
            id: 'member',
            key: 'member',
            name: 'member',
            description: '',
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            pathRoot: '',
            reload: vi.fn(),
            id: 'admin',
            key: 'admin',
            name: 'admin',
            description: '',
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });

      fixtures.clerk.organization?.inviteMembers.mockResolvedValueOnce([{}] as OrganizationInvitationResource[]);
      const { getByRole, userEvent, getByTestId } = render(
        <Action.Root>
          <InviteMembersScreen />
        </Action.Root>,
        { wrapper },
      );
      await userEvent.type(getByTestId('tag-input'), 'test+1@clerk.com,');
      await waitFor(() => expect(getByRole('button', { name: /select role/i })).toBeInTheDocument());
    });

    it('enables send button with default role once email address has been entered', async () => {
      const defaultRole = 'mydefaultrole';

      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withOrganizationDomains(undefined, defaultRole);
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'admin' }],
        });
      });

      fixtures.clerk.organization?.getInvitations.mockRejectedValue(null);
      fixtures.clerk.organization?.getRoles.mockResolvedValue({
        total_count: 3,
        data: [
          {
            pathRoot: '',
            reload: vi.fn(),
            id: 'member',
            key: 'member',
            name: 'member',
            description: '',
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            pathRoot: '',
            reload: vi.fn(),
            id: 'admin',
            key: 'admin',
            name: 'Admin',
            description: '',
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            pathRoot: '',
            reload: vi.fn(),
            id: defaultRole,
            key: defaultRole,
            name: defaultRole,
            description: '',
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });

      const { getByRole, userEvent, getByTestId } = render(
        <Action.Root>
          <InviteMembersScreen />
        </Action.Root>,
        { wrapper },
      );

      expect(getByRole('button', { name: 'Send invitations' })).toBeDisabled();
      await userEvent.type(getByTestId('tag-input'), 'test+1@clerk.com,');
      expect(getByRole('button', { name: 'Send invitations' })).not.toBeDisabled();
      await userEvent.click(getByRole('button', { name: /mydefaultrole/i }));
    });
  });

  describe('when submitting', () => {
    it('keeps the Send button disabled until a role is selected and one or more email has been entered', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', role: 'admin' }],
        });
      });

      fixtures.clerk.organization?.getInvitations.mockRejectedValue(null);
      fixtures.clerk.organization?.getRoles.mockResolvedValue({
        total_count: 2,
        data: [
          {
            pathRoot: '',
            reload: vi.fn(),
            id: 'member',
            key: 'member',
            name: 'member',
            description: '',
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            pathRoot: '',
            reload: vi.fn(),
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

      const { getByText, getByRole, userEvent, getByTestId } = render(
        <Action.Root>
          <InviteMembersScreen />
        </Action.Root>,
        { wrapper },
      );
      expect(getByRole('button', { name: 'Send invitations' })).toBeDisabled();

      await userEvent.type(getByTestId('tag-input'), 'test+1@clerk.com,');
      expect(getByRole('button', { name: 'Send invitations' })).toBeDisabled();

      await userEvent.click(getByRole('button', { name: /select role/i }));
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

      fixtures.clerk.organization?.getInvitations.mockRejectedValue(null);
      fixtures.clerk.organization?.getRoles.mockResolvedValue({
        total_count: 2,
        data: [
          {
            pathRoot: '',
            reload: vi.fn(),
            id: 'member',
            key: 'member',
            name: 'member',
            description: '',
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            pathRoot: '',
            reload: vi.fn(),
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
      const { getByRole, userEvent, getByTestId, getByText } = render(
        <Action.Root>
          <InviteMembersScreen />
        </Action.Root>,
        { wrapper },
      );
      await userEvent.type(getByTestId('tag-input'), 'test+1@clerk.com,');
      await userEvent.click(getByRole('button', { name: 'Select role' }));
      await userEvent.click(getByText(/^member$/i));
      await userEvent.click(getByRole('button', { name: 'Send invitations' }));

      await waitFor(() => {
        expect(fixtures.clerk.organization?.inviteMembers).toHaveBeenCalledWith({
          emailAddresses: ['test+1@clerk.com'],
          role: 'member',
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

      fixtures.clerk.organization?.getInvitations.mockRejectedValue(null);
      fixtures.clerk.organization?.getRoles.mockResolvedValue({
        total_count: 2,
        data: [
          {
            pathRoot: '',
            reload: vi.fn(),
            id: 'member',
            key: 'member',
            name: 'member',
            description: '',
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            pathRoot: '',
            reload: vi.fn(),
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
      const { getByRole, userEvent, getByTestId, getByText } = render(
        <Action.Root>
          <InviteMembersScreen />
        </Action.Root>,
        { wrapper },
      );
      await userEvent.type(
        getByTestId('tag-input'),
        'test+1@clerk.com,test+2@clerk.com,test+3@clerk.com,test+4@clerk.com,',
      );
      await userEvent.click(getByRole('button', { name: 'Select role' }));
      await userEvent.click(getByText(/^member$/i));
      await userEvent.click(getByRole('button', { name: 'Send invitations' }));

      await waitFor(() => {
        expect(fixtures.clerk.organization?.inviteMembers).toHaveBeenCalledWith({
          emailAddresses: ['test+1@clerk.com', 'test+2@clerk.com', 'test+3@clerk.com', 'test+4@clerk.com'],
          role: 'member',
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

      fixtures.clerk.organization?.getInvitations.mockRejectedValue(null);
      fixtures.clerk.organization?.getRoles.mockResolvedValue({
        total_count: 2,
        data: [
          {
            pathRoot: '',
            reload: vi.fn(),
            id: 'member',
            key: 'member',
            name: 'member',
            description: '',
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            pathRoot: '',
            reload: vi.fn(),
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
      const { getByRole, userEvent, getByText, getByTestId } = render(
        <Action.Root>
          <InviteMembersScreen />
        </Action.Root>,
        { wrapper },
      );
      await userEvent.type(getByTestId('tag-input'), 'test+1@clerk.com,');
      await userEvent.click(getByRole('button', { name: 'Select role' }));
      await userEvent.click(getByText('Admin'));
      await userEvent.click(getByRole('button', { name: 'Send invitations' }));
      await waitFor(() => {
        expect(fixtures.clerk.organization?.inviteMembers).toHaveBeenCalledWith({
          emailAddresses: ['test+1@clerk.com'],
          role: 'admin',
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

      fixtures.clerk.organization?.getInvitations.mockRejectedValue(null);
      fixtures.clerk.organization?.getRoles.mockResolvedValue({
        total_count: 2,
        data: [
          {
            pathRoot: '',
            reload: vi.fn(),
            id: 'member',
            key: 'member',
            name: 'member',
            description: '',
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            pathRoot: '',
            reload: vi.fn(),
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
      const { getByRole, userEvent, getByText, getByTestId } = render(
        <Action.Root>
          <InviteMembersScreen />
        </Action.Root>,
        { wrapper },
      );
      await userEvent.type(getByTestId('tag-input'), 'test+1@clerk.com,');
      await waitFor(() => expect(getByRole('button', { name: /select role/i })).not.toBeDisabled());
      await userEvent.click(getByRole('button', { name: /select role/i }));
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

      fixtures.clerk.organization?.getInvitations.mockRejectedValue(null);
      fixtures.clerk.organization?.getRoles.mockResolvedValue({
        total_count: 2,
        data: [
          {
            pathRoot: '',
            reload: vi.fn(),
            id: 'member',
            key: 'member',
            name: 'member',
            description: '',
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            pathRoot: '',
            reload: vi.fn(),
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
      const { getByRole, userEvent, getByTestId, getByText } = render(
        <Action.Root>
          <InviteMembersScreen />
        </Action.Root>,
        { wrapper },
      );
      await userEvent.type(getByTestId('tag-input'), 'invalid@clerk.dev');
      await waitFor(() => expect(getByRole('button', { name: /select role/i })).not.toBeDisabled());
      await userEvent.click(getByRole('button', { name: /select role/i }));
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

      fixtures.clerk.organization?.getInvitations.mockRejectedValue(null);
      fixtures.clerk.organization?.getRoles.mockResolvedValue({
        total_count: 2,
        data: [
          {
            pathRoot: '',
            reload: vi.fn(),
            id: 'member',
            key: 'member',
            name: 'member',
            description: '',
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            pathRoot: '',
            reload: vi.fn(),
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
      const { getByRole, getByText, userEvent, getByTestId } = render(
        <Action.Root>
          <InviteMembersScreen />
        </Action.Root>,
        { wrapper },
      );
      await userEvent.type(getByTestId('tag-input'), 'blocked@clerk.dev');
      await waitFor(() => expect(getByRole('button', { name: /select role/i })).not.toBeDisabled());
      await userEvent.click(getByRole('button', { name: /select role/i }));
      await userEvent.click(getByText(/^member$/i));
      await userEvent.click(getByRole('button', { name: 'Send invitations' }));

      expect(getByTestId('tag-input')).not.toHaveValue();
    });
  });
});

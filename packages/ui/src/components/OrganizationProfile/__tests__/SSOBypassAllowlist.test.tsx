import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, screen, waitFor } from '@/test/utils';
import { VirtualRouter } from '@/ui/router';

import { OrganizationProfile } from '..';
import { OrganizationProfileRoutes } from '../OrganizationProfileRoutes';
import { OrganizationSecurityPage } from '../OrganizationSecurityPage';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

type Fixture = Parameters<Parameters<typeof createFixtures>[0]>[0];

const SSO_DESCRIPTION = 'Require members with a matching email domain to sign in through your identity provider.';
const BYPASS_DESCRIPTION = 'Members on this list can sign in with an email code when SSO is unavailable.';

const withSecurityPage =
  ({ selfServeSSO = true, permissions }: { selfServeSSO?: boolean; permissions: string[] }) =>
  (f: Fixture) => {
    f.withEnterpriseSso({ selfServeSSO });
    f.withEmailAddress();
    f.withOrganizations();
    f.withOrganizationDomains(undefined, 'org:member');
    f.withUser({
      email_addresses: ['test@clerk.com'],
      organization_memberships: [{ name: 'Org1', self_serve_sso_enabled: selfServeSSO, permissions }],
    });
  };

const activeConnection = {
  id: 'ent_1',
  name: 'clerk.com',
  provider: 'saml_okta',
  active: true,
  organizationId: 'Org1',
  domains: ['clerk.com'],
  samlConnection: {
    idpSsoUrl: 'https://idp.example.com/sso',
    idpEntityId: 'https://idp.example.com/entity',
    idpCertificate: 'CERT',
  },
} as any;

const allowlistEntry = (userId: string, firstName: string, identifier: string) =>
  ({
    id: userId,
    userId,
    publicUserData: {
      userId,
      firstName,
      lastName: 'Walker',
      identifier,
      imageUrl: '',
      hasImage: false,
    },
    createdAt: new Date(1700000000000),
    updatedAt: new Date(1700000000000),
  }) as any;

const membership = (userId: string, firstName: string, identifier: string) =>
  ({
    id: `mem_${userId}`,
    role: 'org:member',
    publicUserData: {
      userId,
      firstName,
      lastName: 'Yamamoto',
      identifier,
      imageUrl: '',
      hasImage: false,
    },
  }) as any;

const settleRoutes = () => act(() => new Promise<void>(resolve => setTimeout(resolve, 50)));

const renderPage = (wrapper: React.ComponentType<{ children?: React.ReactNode }>) =>
  render(<OrganizationSecurityPage contentRef={{ current: null }} />, { wrapper });

describe('SSO bypass allowlist', () => {
  describe('security overview section', () => {
    it('is hidden when the member lacks the SSO bypass permission', async () => {
      const { wrapper, fixtures } = await createFixtures(
        withSecurityPage({ permissions: ['org:sys_entconns:manage'] }),
      );
      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([activeConnection]);
      fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
        data: [],
        total_count: 0,
      } as any);

      renderPage(wrapper);

      expect(await screen.findByText(SSO_DESCRIPTION)).toBeInTheDocument();
      expect(screen.queryByText('SSO bypass')).not.toBeInTheDocument();
      expect(fixtures.clerk.organization?.ssoBypassAllowlist.getUsers).not.toHaveBeenCalled();
    });

    it('is hidden while the organization has no enterprise connection', async () => {
      const { wrapper, fixtures } = await createFixtures(
        withSecurityPage({ permissions: ['org:sys_entconns:manage', 'org:sys_entconns_sso_bypass:manage'] }),
      );
      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([]);

      renderPage(wrapper);

      expect(await screen.findByRole('button', { name: 'Start configuration' })).toBeInTheDocument();
      expect(screen.queryByText('SSO bypass')).not.toBeInTheDocument();
    });

    it('shows the allowlist size and hides itself when the feature is off on the instance', async () => {
      const { wrapper, fixtures } = await createFixtures(
        withSecurityPage({ permissions: ['org:sys_entconns:manage', 'org:sys_entconns_sso_bypass:manage'] }),
      );
      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([activeConnection]);
      fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
        data: [],
        total_count: 0,
      } as any);
      fixtures.clerk.organization?.ssoBypassAllowlist.getUsers.mockResolvedValue([
        allowlistEntry('user_1', 'Cameron', 'cameron@clerk.com'),
        allowlistEntry('user_2', 'Dana', 'dana@clerk.com'),
      ]);

      renderPage(wrapper);

      expect(await screen.findByText('SSO bypass')).toBeInTheDocument();
      expect(screen.getByText(BYPASS_DESCRIPTION)).toBeInTheDocument();
      expect(await screen.findByText('2 users')).toBeInTheDocument();
      expect(screen.getByText('Allow list:')).toBeInTheDocument();
    });

    it('opens the allow list page from the Manage action and lists the members', async () => {
      const { wrapper, fixtures } = await createFixtures(
        withSecurityPage({ permissions: ['org:sys_entconns:manage', 'org:sys_entconns_sso_bypass:manage'] }),
      );
      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([activeConnection]);
      fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
        data: [],
        total_count: 0,
      } as any);
      fixtures.clerk.organization?.ssoBypassAllowlist.getUsers.mockResolvedValue([
        allowlistEntry('user_123', 'Cameron', 'cameron@clerk.com'),
      ]);

      const { userEvent } = renderPage(wrapper);

      expect(await screen.findByText('1 user')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: /open menu/i }));
      await userEvent.click(await screen.findByRole('menuitem', { name: 'Manage' }));

      expect(await screen.findByRole('heading', { name: 'SSO allow list' })).toBeInTheDocument();
      expect(screen.getByText('Cameron Walker')).toBeInTheDocument();
      expect(screen.getByText('cameron@clerk.com')).toBeInTheDocument();
      expect(screen.getByText('You')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'Security' }));
      expect(await screen.findByText(SSO_DESCRIPTION)).toBeInTheDocument();
    });
  });

  describe('allow list page', () => {
    const openAllowlistPage = async (
      wrapper: React.ComponentType<{ children?: React.ReactNode }>,
      fixtures: Awaited<ReturnType<typeof createFixtures>>['fixtures'],
      entries: unknown[],
    ) => {
      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([activeConnection]);
      fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
        data: [],
        total_count: 0,
      } as any);
      fixtures.clerk.organization?.ssoBypassAllowlist.getUsers.mockResolvedValue(entries as any);

      const utils = renderPage(wrapper);

      await userEventOpen(utils.userEvent);
      return utils;
    };

    const userEventOpen = async (userEvent: ReturnType<typeof render>['userEvent']) => {
      await screen.findByText('SSO bypass');
      await userEvent.click(screen.getByRole('button', { name: /open menu/i }));
      await userEvent.click(await screen.findByRole('menuitem', { name: 'Manage' }));
      await screen.findByRole('heading', { name: 'SSO allow list' });
    };

    it('filters the list by name or email', async () => {
      const { wrapper, fixtures } = await createFixtures(
        withSecurityPage({ permissions: ['org:sys_entconns:manage', 'org:sys_entconns_sso_bypass:manage'] }),
      );

      const { userEvent } = await openAllowlistPage(wrapper, fixtures, [
        allowlistEntry('user_1', 'Cameron', 'cameron@clerk.com'),
        allowlistEntry('user_2', 'Dana', 'dana@clerk.com'),
      ]);

      expect(screen.getByText('Cameron Walker')).toBeInTheDocument();
      expect(screen.getByText('Dana Walker')).toBeInTheDocument();

      await userEvent.type(screen.getByRole('searchbox', { name: 'Search users' }), 'dana@');

      await waitFor(() => expect(screen.queryByText('Cameron Walker')).not.toBeInTheDocument());
      expect(screen.getByText('Dana Walker')).toBeInTheDocument();

      await userEvent.clear(screen.getByRole('searchbox', { name: 'Search users' }));
      await userEvent.type(screen.getByRole('searchbox', { name: 'Search users' }), 'nobody');
      expect(await screen.findByText('No members match your search')).toBeInTheDocument();
    });

    it('adds a member picked from the organization members', async () => {
      const { wrapper, fixtures } = await createFixtures(
        withSecurityPage({ permissions: ['org:sys_entconns:manage', 'org:sys_entconns_sso_bypass:manage'] }),
      );
      fixtures.clerk.organization?.getMemberships.mockResolvedValue({
        data: [membership('user_1', 'Cameron', 'cameron@clerk.com'), membership('user_9', 'Yukio', 'yukio@clerk.com')],
        total_count: 2,
      } as any);
      fixtures.clerk.organization?.ssoBypassAllowlist.addUser.mockResolvedValue(
        allowlistEntry('user_9', 'Yukio', 'yukio@clerk.com'),
      );

      const { userEvent } = await openAllowlistPage(wrapper, fixtures, [
        allowlistEntry('user_1', 'Cameron', 'cameron@clerk.com'),
      ]);

      await userEvent.click(screen.getByRole('button', { name: 'Add' }));

      expect(await screen.findByRole('heading', { name: 'Add member' })).toBeInTheDocument();
      const submitButton = () => screen.getAllByRole('button', { name: 'Add' })[1];
      expect(submitButton()).toBeDisabled();

      const options = await screen.findAllByRole('option');
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent('Yukio Yamamoto');

      await userEvent.click(options[0]);
      expect(screen.queryByRole('option')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument();

      await userEvent.click(submitButton());

      await waitFor(() =>
        expect(fixtures.clerk.organization?.ssoBypassAllowlist.addUser).toHaveBeenCalledWith({ userId: 'user_9' }),
      );
      await waitFor(() => expect(screen.queryByRole('heading', { name: 'Add member' })).not.toBeInTheDocument());
    });

    it('adds every member with the selected role and reports the skipped ones', async () => {
      const { wrapper, fixtures } = await createFixtures(
        withSecurityPage({
          permissions: ['org:sys_entconns:manage', 'org:sys_entconns_sso_bypass:manage', 'org:sys_memberships:read'],
        }),
      );
      fixtures.clerk.organization?.getRoles.mockResolvedValue({
        data: [
          { id: 'role_admin', key: 'org:admin', name: 'Admin' },
          { id: 'role_member', key: 'org:member', name: 'Member' },
        ],
        total_count: 2,
      } as any);
      fixtures.clerk.organization?.getMemberships.mockResolvedValue({
        data: [
          membership('user_1', 'Cameron', 'cameron@clerk.com'),
          membership('user_9', 'Yukio', 'yukio@clerk.com'),
          membership('user_10', 'Dana', 'dana@personal.com'),
        ],
        total_count: 3,
      } as any);
      fixtures.clerk.organization?.ssoBypassAllowlist.addUsers.mockResolvedValue({
        data: [allowlistEntry('user_9', 'Yukio', 'yukio@clerk.com')],
        errors: [{ userId: 'user_10', code: 'sso_bypass_domain_not_served' }],
      });

      const { userEvent } = await openAllowlistPage(wrapper, fixtures, [
        allowlistEntry('user_1', 'Cameron', 'cameron@clerk.com'),
      ]);

      await userEvent.click(screen.getByRole('button', { name: 'Add' }));
      expect(await screen.findByRole('heading', { name: 'Add member' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add all' })).toBeDisabled();

      await userEvent.click(screen.getByRole('button', { name: /select role/i }));
      await userEvent.click(await screen.findByText(/^Admin$/));
      await userEvent.click(screen.getByRole('button', { name: 'Add all' }));

      await waitFor(() =>
        expect(fixtures.clerk.organization?.getMemberships).toHaveBeenCalledWith(
          expect.objectContaining({ role: ['org:admin'], initialPage: 1 }),
        ),
      );
      await waitFor(() =>
        expect(fixtures.clerk.organization?.ssoBypassAllowlist.addUsers).toHaveBeenCalledWith({
          userIds: ['user_9', 'user_10'],
        }),
      );

      expect(await screen.findByText('Added 1 member to the allow list.')).toBeInTheDocument();
      expect(
        screen.getByText('1 member could not be added because their email address is not served by a connection.'),
      ).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Add member' })).not.toBeInTheDocument();
    });

    it('searches members through the organization membership query', async () => {
      const { wrapper, fixtures } = await createFixtures(
        withSecurityPage({ permissions: ['org:sys_entconns:manage', 'org:sys_entconns_sso_bypass:manage'] }),
      );
      fixtures.clerk.organization?.getMemberships.mockResolvedValue({
        data: [membership('user_9', 'Yukio', 'yukio@clerk.com')],
        total_count: 1,
      } as any);

      vi.useFakeTimers({ shouldAdvanceTime: true });
      try {
        const { userEvent } = await openAllowlistPage(wrapper, fixtures, []);

        await userEvent.click(screen.getByRole('button', { name: 'Add' }));
        await userEvent.type(await screen.findByRole('searchbox', { name: 'Search members' }), 'yukio');

        await vi.advanceTimersByTimeAsync(600);

        await waitFor(() =>
          expect(fixtures.clerk.organization?.getMemberships).toHaveBeenCalledWith(
            expect.objectContaining({ query: 'yukio' }),
          ),
        );
      } finally {
        vi.useRealTimers();
      }
    });

    it('removes a member from the row menu', async () => {
      const { wrapper, fixtures } = await createFixtures(
        withSecurityPage({ permissions: ['org:sys_entconns:manage', 'org:sys_entconns_sso_bypass:manage'] }),
      );
      fixtures.clerk.organization?.ssoBypassAllowlist.removeUser.mockResolvedValue({
        id: 'user_1',
        deleted: true,
      } as any);

      const { userEvent } = await openAllowlistPage(wrapper, fixtures, [
        allowlistEntry('user_1', 'Cameron', 'cameron@clerk.com'),
      ]);

      await userEvent.click(screen.getByRole('button', { name: /open menu/i }));
      await userEvent.click(await screen.findByRole('menuitem', { name: 'Remove' }));

      await waitFor(() =>
        expect(fixtures.clerk.organization?.ssoBypassAllowlist.removeUser).toHaveBeenCalledWith('user_1'),
      );
    });
  });

  describe('with the SSO bypass permission alone', () => {
    it('renders the connections read-only next to the SSO bypass section', async () => {
      const { wrapper, fixtures } = await createFixtures(
        withSecurityPage({ selfServeSSO: false, permissions: ['org:sys_entconns_sso_bypass:manage'] }),
      );
      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([activeConnection]);
      fixtures.clerk.organization?.ssoBypassAllowlist.getUsers.mockResolvedValue([]);

      renderPage(wrapper);

      expect(await screen.findByText('SSO bypass')).toBeInTheDocument();
      expect(await screen.findByText('0 users')).toBeInTheDocument();
      expect(screen.getByText(SSO_DESCRIPTION)).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();

      expect(screen.queryByRole('button', { name: /clerk\.com/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Add connection' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Start configuration' })).not.toBeInTheDocument();
      expect(fixtures.clerk.organization?.getEnterpriseConnectionTestRuns).not.toHaveBeenCalled();
    });

    it('shows the Security tab once the organization has an enterprise connection', async () => {
      const { wrapper, fixtures } = await createFixtures(
        withSecurityPage({ selfServeSSO: false, permissions: ['org:sys_entconns_sso_bypass:manage'] }),
      );
      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([activeConnection]);
      fixtures.clerk.organization?.ssoBypassAllowlist.getUsers.mockResolvedValue([]);

      render(<OrganizationProfile />, { wrapper });

      expect(await screen.findByText('Security')).toBeInTheDocument();
    });

    it('hides the Security tab while the organization has no enterprise connection', async () => {
      const { wrapper, fixtures } = await createFixtures(
        withSecurityPage({ selfServeSSO: false, permissions: ['org:sys_entconns_sso_bypass:manage'] }),
      );
      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([]);

      render(<OrganizationProfile />, { wrapper });

      await waitFor(() => expect(fixtures.clerk.organization?.getEnterpriseConnections).toHaveBeenCalled());
      expect(screen.queryByText('Security')).not.toBeInTheDocument();
    });

    it('lets the guarded route through on the SSO bypass permission alone', async () => {
      const { wrapper, fixtures } = await createFixtures(
        withSecurityPage({ selfServeSSO: false, permissions: ['org:sys_entconns_sso_bypass:manage'] }),
      );
      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([activeConnection]);
      fixtures.clerk.organization?.ssoBypassAllowlist.getUsers.mockResolvedValue([]);

      render(
        <VirtualRouter startPath='/organization-security'>
          <OrganizationProfileRoutes contentRef={{ current: null }} />
        </VirtualRouter>,
        { wrapper },
      );

      expect(await screen.findByText('SSO bypass')).toBeInTheDocument();
    });

    it('keeps the route closed to a member with the permission while the organization has no connection', async () => {
      const { wrapper, fixtures } = await createFixtures(
        withSecurityPage({ selfServeSSO: false, permissions: ['org:sys_entconns_sso_bypass:manage'] }),
      );
      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([]);

      render(
        <VirtualRouter startPath='/organization-security'>
          <OrganizationProfileRoutes contentRef={{ current: null }} />
        </VirtualRouter>,
        { wrapper },
      );

      await waitFor(() => expect(fixtures.clerk.organization?.getEnterpriseConnections).toHaveBeenCalled());
      await settleRoutes();

      expect(screen.queryByRole('heading', { name: 'Security' })).not.toBeInTheDocument();
      expect(screen.queryByText(SSO_DESCRIPTION)).not.toBeInTheDocument();
      expect(screen.queryByText('SSO bypass')).not.toBeInTheDocument();
    });

    it('keeps the route closed to members with neither permission', async () => {
      const { wrapper, fixtures } = await createFixtures(withSecurityPage({ selfServeSSO: false, permissions: [] }));
      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([activeConnection]);

      render(
        <VirtualRouter startPath='/organization-security'>
          <OrganizationProfileRoutes contentRef={{ current: null }} />
        </VirtualRouter>,
        { wrapper },
      );

      await settleRoutes();

      expect(fixtures.clerk.organization?.getEnterpriseConnections).not.toHaveBeenCalled();
      expect(screen.queryByRole('heading', { name: 'Security' })).not.toBeInTheDocument();
      expect(screen.queryByText(SSO_DESCRIPTION)).not.toBeInTheDocument();
      expect(screen.queryByText('SSO bypass')).not.toBeInTheDocument();
    });
  });
});

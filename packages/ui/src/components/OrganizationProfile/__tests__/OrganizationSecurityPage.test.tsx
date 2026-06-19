import { ClerkAPIResponseError } from '@clerk/shared/error';
import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';

import { OrganizationSecurityPage } from '../OrganizationSecurityPage';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

const withSecurityPageFixtures = (f: Parameters<Parameters<typeof createFixtures>[0]>[0]) => {
  f.withEnterpriseSso({ selfServeSSO: true });
  f.withEmailAddress();
  f.withOrganizations();
  f.withOrganizationDomains(undefined, 'org:member');
  f.withUser({
    email_addresses: ['test@clerk.com'],
    organization_memberships: [{ name: 'Org1', permissions: ['org:sys_entconns:manage'] }],
  });
};

const DESCRIPTION_LINE_1 = 'Require members with a matching email domain to sign in through your identity provider.';

const verifiedDomain = {
  id: 'dmn_verified',
  name: 'clerk.com',
  organizationId: 'Org1',
  enrollmentMode: 'enterprise_sso',
  ownershipVerification: { status: 'verified', strategy: 'txt' },
} as any;

const configuredConnection = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'ent_1',
    name: 'clerk.com',
    provider: 'saml_okta',
    active: false,
    organizationId: 'Org1',
    domains: ['clerk.com'],
    samlConnection: {
      idpSsoUrl: 'https://idp.example.com/sso',
      idpEntityId: 'https://idp.example.com/entity',
      idpCertificate: 'CERT',
    },
    ...overrides,
  }) as any;

const renderPage = (wrapper: React.ComponentType<{ children?: React.ReactNode }>) =>
  render(<OrganizationSecurityPage contentRef={{ current: null }} />, { wrapper });

describe('OrganizationSecurityPage', () => {
  describe('overview states', () => {
    it('renders the unconfigured state with a Start configuration action', async () => {
      const { wrapper, fixtures } = await createFixtures(withSecurityPageFixtures);

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([]);

      renderPage(wrapper);

      expect(await screen.findByRole('heading', { name: 'Security' })).toBeInTheDocument();
      expect(screen.getByText('SSO')).toBeInTheDocument();
      expect(screen.getByText('Unconfigured')).toBeInTheDocument();
      expect(screen.getByText(DESCRIPTION_LINE_1)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Start configuration' })).toBeInTheDocument();

      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /open menu/i })).not.toBeInTheDocument();
      expect(screen.queryByText(/select your identity provider/i)).not.toBeInTheDocument();
    });

    it('renders the in-progress state with a Continue configuration action', async () => {
      const { wrapper, fixtures } = await createFixtures(withSecurityPageFixtures);

      // A connection without SAML configuration is mid-setup.
      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([
        configuredConnection({ samlConnection: null }),
      ]);
      fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
        data: [],
        total_count: 0,
      } as any);

      renderPage(wrapper);

      expect(await screen.findByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText(DESCRIPTION_LINE_1)).toBeInTheDocument();
      expect(screen.queryByText(/you have started a configuration/i)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Continue configuration' })).toBeInTheDocument();

      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /open menu/i })).not.toBeInTheDocument();
    });

    it('renders the active state as a condensed overview with the domains and actions menu', async () => {
      const { wrapper, fixtures } = await createFixtures(withSecurityPageFixtures);

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([configuredConnection({ active: true })]);
      fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
        data: [{ id: 'run_1', status: 'success' }],
        total_count: 1,
      } as any);

      renderPage(wrapper);

      expect(await screen.findByText('Active')).toBeInTheDocument();
      expect(screen.getByText(DESCRIPTION_LINE_1)).toBeInTheDocument();

      expect(screen.queryByRole('switch')).not.toBeInTheDocument();

      // The condensed overview keeps the domains, dropping the bordered detail card.
      expect(screen.getByText(/^Domains:?$/)).toBeInTheDocument();
      expect(screen.getByText('clerk.com')).toBeInTheDocument();

      expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Start configuration' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Continue configuration' })).not.toBeInTheDocument();
    });

    it('renders the inactive state with a chip per domain', async () => {
      const { wrapper, fixtures } = await createFixtures(withSecurityPageFixtures);

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([
        configuredConnection({ domains: ['github.com', 'gmail.com', 'maps.com', 'another.com'] }),
      ]);
      fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
        data: [{ id: 'run_1', status: 'success' }],
        total_count: 1,
      } as any);

      renderPage(wrapper);

      expect(await screen.findByText('Inactive')).toBeInTheDocument();

      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();

      expect(screen.getByText(/^Domains:?$/)).toBeInTheDocument();
      for (const domain of ['github.com', 'gmail.com', 'maps.com', 'another.com']) {
        expect(screen.getByText(domain)).toBeInTheDocument();
      }
    });

    it('renders the full value for long domains', async () => {
      const longDomain = `${'a'.repeat(280)}.com`;
      const { wrapper, fixtures } = await createFixtures(withSecurityPageFixtures);

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([
        configuredConnection({ active: true, domains: [longDomain] }),
      ]);
      fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
        data: [{ id: 'run_1', status: 'success' }],
        total_count: 1,
      } as any);

      renderPage(wrapper);

      const domainChip = await screen.findByText(longDomain);
      expect(domainChip).toBeInTheDocument();
    });

    it('exposes the SSO description info tooltip trigger', async () => {
      const { wrapper, fixtures } = await createFixtures(withSecurityPageFixtures);

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([]);

      renderPage(wrapper);

      expect(await screen.findByText(DESCRIPTION_LINE_1)).toBeInTheDocument();

      // Assert the focusable trigger + accessible name only; the floating tooltip content is
      // portaled and its open transition does not settle reliably in jsdom.
      expect(screen.getByRole('button', { name: /more information/i })).toBeInTheDocument();
    });
  });

  describe('view switching', () => {
    it('opens the wizard at the first step when Start configuration is clicked', async () => {
      const { wrapper, fixtures } = await createFixtures(withSecurityPageFixtures);

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([]);
      fixtures.clerk.organization?.getDomains.mockResolvedValue({ data: [verifiedDomain], total_count: 1 } as any);

      const { userEvent } = renderPage(wrapper);

      await userEvent.click(await screen.findByRole('button', { name: 'Start configuration' }));

      // Start forces the first step. The fixture domain is already verified, so
      // without the forced entry the wizard would skip to select-provider —
      // proving Start threads `forceInitialStep`.
      expect(await screen.findByRole('heading', { name: /add SSO domains/i })).toBeInTheDocument();
      expect(screen.queryByText(/select your identity provider/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Start configuration' })).not.toBeInTheDocument();
    });

    it('resumes the wizard at the reachable step when Continue configuration is clicked', async () => {
      const { wrapper, fixtures } = await createFixtures(withSecurityPageFixtures);

      // A connection without SAML configuration is mid-setup (in_progress).
      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([
        configuredConnection({ samlConnection: null }),
      ]);
      fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
        data: [],
        total_count: 0,
      } as any);
      fixtures.clerk.organization?.getDomains.mockResolvedValue({ data: [verifiedDomain], total_count: 1 } as any);

      const { userEvent } = renderPage(wrapper);

      await userEvent.click(await screen.findByRole('button', { name: 'Continue configuration' }));

      // Continue passes no forced step, so the wizard resumes at the furthest-
      // reachable step for this connection (configure, since a provider connection
      // exists and the domain is verified) rather than the forced first step.
      expect(await screen.findByRole('heading', { name: /configure okta workforce/i })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: /add SSO domains/i })).not.toBeInTheDocument();
    });

    it('opens the wizard at the first step when Edit is selected from the actions menu', async () => {
      const { wrapper, fixtures } = await createFixtures(withSecurityPageFixtures);

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([configuredConnection({ active: true })]);
      fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
        data: [{ id: 'run_1', status: 'success' }],
        total_count: 1,
      } as any);
      fixtures.clerk.organization?.getDomains.mockResolvedValue({ data: [verifiedDomain], total_count: 1 } as any);

      const { userEvent } = renderPage(wrapper);

      await userEvent.click(await screen.findByRole('button', { name: /open menu/i }));
      await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));

      // Edit forces the first step rather than the connection's furthest-reachable
      // step (confirmation, for an active connection).
      expect(await screen.findByRole('heading', { name: /add SSO domains/i })).toBeInTheDocument();
      expect(screen.queryByText(/configuration details/i)).not.toBeInTheDocument();
      expect(screen.queryByText(DESCRIPTION_LINE_1)).not.toBeInTheDocument();
    });
  });

  describe('wizard back control', () => {
    it('renders a Security back control in the wizard that returns to the overview', async () => {
      const { wrapper, fixtures } = await createFixtures(withSecurityPageFixtures);

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([]);
      fixtures.clerk.organization?.getDomains.mockResolvedValue({ data: [verifiedDomain], total_count: 1 } as any);

      const { userEvent } = renderPage(wrapper);

      // Enter the wizard from the overview.
      await userEvent.click(await screen.findByRole('button', { name: 'Start configuration' }));
      const backControl = await screen.findByRole('button', { name: 'Security' });
      expect(backControl).toBeInTheDocument();

      // The back control exits to the overview (the Start action returns).
      await userEvent.click(backControl);

      expect(await screen.findByRole('button', { name: 'Start configuration' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: /add SSO domains/i })).not.toBeInTheDocument();
    });
  });

  describe('actions menu', () => {
    it('lists Edit, Deactivate, and Remove for an active connection', async () => {
      const { wrapper, fixtures } = await createFixtures(withSecurityPageFixtures);

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([configuredConnection({ active: true })]);
      fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
        data: [],
        total_count: 0,
      } as any);

      const { userEvent } = renderPage(wrapper);

      await userEvent.click(await screen.findByRole('button', { name: /open menu/i }));

      expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Deactivate' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Remove' })).toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: 'Activate' })).not.toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: 'Delete' })).not.toBeInTheDocument();
    });

    it('lists Edit, Activate, and Remove for an inactive connection', async () => {
      const { wrapper, fixtures } = await createFixtures(withSecurityPageFixtures);

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([configuredConnection()]);
      fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
        data: [{ id: 'run_1', status: 'success' }],
        total_count: 1,
      } as any);

      const { userEvent } = renderPage(wrapper);

      await userEvent.click(await screen.findByRole('button', { name: /open menu/i }));

      expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Activate' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Remove' })).toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: 'Deactivate' })).not.toBeInTheDocument();
    });

    it('opens the type-to-confirm removal dialog with Remove-oriented copy from Remove', async () => {
      const { wrapper, fixtures } = await createFixtures(withSecurityPageFixtures);

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([configuredConnection({ active: true })]);
      fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
        data: [],
        total_count: 0,
      } as any);
      fixtures.clerk.organization?.deleteEnterpriseConnection.mockResolvedValue({} as any);

      const { userEvent } = renderPage(wrapper);

      await userEvent.click(await screen.findByRole('button', { name: /open menu/i }));
      await userEvent.click(screen.getByRole('menuitem', { name: 'Remove' }));

      // The shared dialog renders the Remove copy here, not the wizard's Reset copy.
      expect(await screen.findByRole('heading', { name: 'Remove SSO connection' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Reset connection' })).not.toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to remove the connection\?/i)).toBeInTheDocument();

      // Type-to-confirm uses the organization name.
      await userEvent.type(screen.getByLabelText(/below to continue/i), 'Org1');
      await waitFor(() => expect(screen.getByRole('button', { name: 'Remove connection' })).toBeEnabled());
      await userEvent.click(screen.getByRole('button', { name: 'Remove connection' }));

      await waitFor(() => {
        expect(fixtures.clerk.organization?.deleteEnterpriseConnection).toHaveBeenCalledWith('ent_1');
      });
    });

    it('deactivates directly from the menu, settling on the revalidated connection', async () => {
      const { wrapper, fixtures } = await createFixtures(withSecurityPageFixtures);

      // The revalidation that follows the update returns the deactivated connection.
      fixtures.clerk.organization?.getEnterpriseConnections
        .mockResolvedValueOnce([configuredConnection({ active: true })])
        .mockResolvedValue([configuredConnection()]);
      fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
        data: [{ id: 'run_1', status: 'success' }],
        total_count: 1,
      } as any);
      fixtures.clerk.organization?.updateEnterpriseConnection.mockResolvedValue({ active: false } as any);

      const { userEvent } = renderPage(wrapper);

      expect(await screen.findByText('Active')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: /open menu/i }));
      await userEvent.click(screen.getByRole('menuitem', { name: 'Deactivate' }));

      expect(fixtures.clerk.organization?.updateEnterpriseConnection).toHaveBeenCalledWith('ent_1', {
        active: false,
      });

      // The badge follows the revalidated entity, not an optimistic flip.
      await waitFor(() => expect(screen.getByText('Inactive')).toBeInTheDocument());
      expect(screen.queryByText('Active')).not.toBeInTheDocument();
    });

    it('activates directly from the menu, settling on the revalidated connection', async () => {
      const { wrapper, fixtures } = await createFixtures(withSecurityPageFixtures);

      fixtures.clerk.organization?.getEnterpriseConnections
        .mockResolvedValueOnce([configuredConnection()])
        .mockResolvedValue([configuredConnection({ active: true })]);
      fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
        data: [{ id: 'run_1', status: 'success' }],
        total_count: 1,
      } as any);
      fixtures.clerk.organization?.updateEnterpriseConnection.mockResolvedValue({ active: true } as any);

      const { userEvent } = renderPage(wrapper);

      expect(await screen.findByText('Inactive')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: /open menu/i }));
      await userEvent.click(screen.getByRole('menuitem', { name: 'Activate' }));

      expect(fixtures.clerk.organization?.updateEnterpriseConnection).toHaveBeenCalledWith('ent_1', {
        active: true,
      });

      await waitFor(() => expect(screen.getByText('Active')).toBeInTheDocument());
      expect(screen.queryByText('Inactive')).not.toBeInTheDocument();
    });

    it('disables the activation action while the update is in flight', async () => {
      const { wrapper, fixtures } = await createFixtures(withSecurityPageFixtures);

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([configuredConnection({ active: true })]);
      fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
        data: [{ id: 'run_1', status: 'success' }],
        total_count: 1,
      } as any);

      let resolveUpdate!: (value: unknown) => void;
      fixtures.clerk.organization?.updateEnterpriseConnection.mockImplementation(
        () => new Promise(resolve => (resolveUpdate = resolve)) as any,
      );

      const { userEvent } = renderPage(wrapper);

      expect(await screen.findByText('Active')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: /open menu/i }));
      await userEvent.click(screen.getByRole('menuitem', { name: 'Deactivate' }));

      // The update is still pending; the acting item is disabled when the menu is reopened.
      await userEvent.click(screen.getByRole('button', { name: /open menu/i }));
      await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Deactivate' })).toBeDisabled());

      resolveUpdate({ active: true });
    });

    it('surfaces the error and keeps the entity state when the update fails', async () => {
      const { wrapper, fixtures } = await createFixtures(withSecurityPageFixtures);

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([configuredConnection({ active: true })]);
      fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
        data: [],
        total_count: 0,
      } as any);
      fixtures.clerk.organization?.updateEnterpriseConnection.mockRejectedValue(
        new ClerkAPIResponseError('Error', {
          data: [
            {
              code: 'connection_update_failed',
              long_message: 'The connection could not be updated',
              message: 'update failed',
            },
          ],
          status: 400,
        }),
      );

      const { userEvent } = renderPage(wrapper);

      expect(await screen.findByText('Active')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: /open menu/i }));
      await userEvent.click(screen.getByRole('menuitem', { name: 'Deactivate' }));

      expect(await screen.findByText('The connection could not be updated')).toBeInTheDocument();
      // The badge reads from the (unchanged) entity — no optimistic flip to roll back.
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.queryByText('Inactive')).not.toBeInTheDocument();
    });
  });
});

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
  f.withUser({
    email_addresses: ['test@clerk.com'],
    organization_memberships: [{ name: 'Org1', permissions: ['org:sys_entconns:manage'] }],
  });
};

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
      expect(
        screen.getByText('Configure to require organization members to sign in through your identity provider'),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Start configuration' })).toBeInTheDocument();

      // No configured-state affordances.
      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /open menu/i })).not.toBeInTheDocument();
      // The wizard is not mounted.
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
      expect(
        screen.getByText('Configure to require organization members to sign in through your identity provider'),
      ).toBeInTheDocument();
      expect(screen.getByText(/you have started a configuration but haven.t finished/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Continue configuration' })).toBeInTheDocument();

      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /open menu/i })).not.toBeInTheDocument();
    });

    it('renders the active state with the toggle on and the connection details', async () => {
      const { wrapper, fixtures } = await createFixtures(withSecurityPageFixtures);

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([configuredConnection({ active: true })]);
      fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
        data: [{ id: 'run_1', status: 'success' }],
        total_count: 1,
      } as any);

      renderPage(wrapper);

      expect(await screen.findByText('Active')).toBeInTheDocument();
      expect(
        screen.getByText('Configure SSO to require organization members to sign in through your identity provider'),
      ).toBeInTheDocument();

      const ssoSwitch = screen.getByRole('switch', { name: 'Enable SSO' });
      expect(ssoSwitch).toBeChecked();
      expect(ssoSwitch).toBeEnabled();

      // Detail rows: gray label + right-aligned value per row.
      expect(screen.getByText('Provider')).toBeInTheDocument();
      expect(screen.getByText('Okta Workforce')).toBeInTheDocument();
      expect(screen.getByText('Domain')).toBeInTheDocument();
      expect(screen.getByText('clerk.com')).toBeInTheDocument();
      expect(screen.getByText('Sign on URL')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'https://idp.example.com/sso' })).toHaveAttribute(
        'href',
        'https://idp.example.com/sso',
      );
      expect(screen.getByText('Issuer')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'https://idp.example.com/entity' })).toHaveAttribute(
        'href',
        'https://idp.example.com/entity',
      );
      expect(screen.getByText('Certificate')).toBeInTheDocument();
      expect(screen.getByText('CERT')).toBeInTheDocument();

      // The actions menu is available; the start/continue actions are not.
      expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Start configuration' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Continue configuration' })).not.toBeInTheDocument();
      // The page lands on the overview, never directly on the wizard.
      expect(screen.queryByText(/configuration details/i)).not.toBeInTheDocument();
    });

    it('renders the inactive state with the toggle off and a chip per domain', async () => {
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

      const ssoSwitch = screen.getByRole('switch', { name: 'Enable SSO' });
      expect(ssoSwitch).not.toBeChecked();
      // A successful test run satisfies the enable gate.
      expect(ssoSwitch).toBeEnabled();

      for (const domain of ['github.com', 'gmail.com', 'maps.com', 'another.com']) {
        expect(screen.getByText(domain)).toBeInTheDocument();
      }
    });
  });

  describe('view switching', () => {
    it('switches to the wizard when Start configuration is clicked', async () => {
      const { wrapper, fixtures } = await createFixtures(withSecurityPageFixtures);

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([]);

      const { userEvent } = renderPage(wrapper);

      await userEvent.click(await screen.findByRole('button', { name: 'Start configuration' }));

      // A fresh start lands on the select-provider step.
      expect(await screen.findByText(/select your identity provider/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Start configuration' })).not.toBeInTheDocument();
    });

    it('switches to the wizard when Edit is selected from the actions menu', async () => {
      const { wrapper, fixtures } = await createFixtures(withSecurityPageFixtures);

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([configuredConnection({ active: true })]);
      fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
        data: [{ id: 'run_1', status: 'success' }],
        total_count: 1,
      } as any);

      const { userEvent } = renderPage(wrapper);

      await userEvent.click(await screen.findByRole('button', { name: /open menu/i }));
      await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));

      // An active connection short-circuits the wizard to the confirmation step.
      expect(await screen.findByText(/configuration details/i)).toBeInTheDocument();
      // The overview unmounted.
      expect(
        screen.queryByText('Configure SSO to require organization members to sign in through your identity provider'),
      ).not.toBeInTheDocument();
    });
  });

  describe('actions menu', () => {
    it('lists Edit and Delete, and Delete opens the type-to-confirm reset dialog', async () => {
      const { wrapper, fixtures } = await createFixtures(withSecurityPageFixtures);

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([configuredConnection({ active: true })]);
      fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
        data: [],
        total_count: 0,
      } as any);
      fixtures.clerk.organization?.deleteEnterpriseConnection.mockResolvedValue({} as any);

      const { userEvent } = renderPage(wrapper);

      await userEvent.click(await screen.findByRole('button', { name: /open menu/i }));
      expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
      const deleteItem = screen.getByRole('menuitem', { name: 'Delete' });

      await userEvent.click(deleteItem);
      expect(await screen.findByRole('heading', { name: 'Reset connection' })).toBeInTheDocument();

      // Type-to-confirm uses the organization name.
      await userEvent.type(screen.getByLabelText(/below to continue/i), 'Org1');
      await waitFor(() => expect(screen.getByRole('button', { name: 'Reset connection' })).toBeEnabled());
      await userEvent.click(screen.getByRole('button', { name: 'Reset connection' }));

      await waitFor(() => {
        expect(fixtures.clerk.organization?.deleteEnterpriseConnection).toHaveBeenCalledWith('ent_1');
      });
    });
  });

  describe('Enable SSO toggle', () => {
    it('flips optimistically, disables while saving, and settles on the server value', async () => {
      const { wrapper, fixtures } = await createFixtures(withSecurityPageFixtures);

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([configuredConnection({ active: true })]);
      fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
        data: [],
        total_count: 0,
      } as any);

      let resolveUpdate!: (value: unknown) => void;
      fixtures.clerk.organization?.updateEnterpriseConnection.mockImplementation(
        () => new Promise(resolve => (resolveUpdate = resolve)) as any,
      );

      const { userEvent } = renderPage(wrapper);

      const ssoSwitch = await screen.findByRole('switch', { name: 'Enable SSO' });
      expect(ssoSwitch).toBeChecked();

      await userEvent.click(ssoSwitch);

      // Optimistic flip + disabled while the mutation is in flight.
      expect(ssoSwitch).not.toBeChecked();
      expect(ssoSwitch).toBeDisabled();
      expect(fixtures.clerk.organization?.updateEnterpriseConnection).toHaveBeenCalledWith('ent_1', {
        active: false,
      });

      resolveUpdate({ active: false });

      await waitFor(() => expect(ssoSwitch).toBeEnabled());
      expect(ssoSwitch).not.toBeChecked();
    });

    it('rolls back the toggle and surfaces the error when the update fails', async () => {
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

      const ssoSwitch = await screen.findByRole('switch', { name: 'Enable SSO' });
      expect(ssoSwitch).toBeChecked();

      await userEvent.click(ssoSwitch);

      // Rolled back to the server state, re-enabled, and the error surfaced.
      await waitFor(() => expect(ssoSwitch).toBeEnabled());
      expect(ssoSwitch).toBeChecked();
      expect(await screen.findByText('The connection could not be updated')).toBeInTheDocument();
    });
  });
});

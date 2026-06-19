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

const DESCRIPTION_LINE_1 =
  'Require members to sign in through your identity provider using their domain email. Members without a matching domain are unaffected.';
// `org:member` renders through the humanized fallback — the fixture user cannot read the roles list.
const DESCRIPTION_LINE_2 =
  'Anyone who signs in will be automatically added to this organization. New members will be assigned to member.';

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

      // The "Security" header now also renders during the loading placeholder, so
      // wait on the settled badge before asserting the page chrome and content.
      expect(await screen.findByText('Unconfigured')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Security' })).toBeInTheDocument();
      expect(screen.getByText('SSO')).toBeInTheDocument();
      expect(screen.getByText(DESCRIPTION_LINE_1)).toBeInTheDocument();
      expect(screen.getByText(DESCRIPTION_LINE_2)).toBeInTheDocument();
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
      expect(screen.getByText(DESCRIPTION_LINE_2)).toBeInTheDocument();
      expect(screen.queryByText(/you have started a configuration/i)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Continue configuration' })).toBeInTheDocument();

      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /open menu/i })).not.toBeInTheDocument();
    });

    it('renders the active state with the connection details', async () => {
      const { wrapper, fixtures } = await createFixtures(withSecurityPageFixtures);

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([configuredConnection({ active: true })]);
      fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
        data: [{ id: 'run_1', status: 'success' }],
        total_count: 1,
      } as any);

      renderPage(wrapper);

      expect(await screen.findByText('Active')).toBeInTheDocument();
      expect(screen.getByText(DESCRIPTION_LINE_1)).toBeInTheDocument();
      expect(screen.getByText(DESCRIPTION_LINE_2)).toBeInTheDocument();

      expect(screen.queryByRole('switch')).not.toBeInTheDocument();

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

      expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Start configuration' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Continue configuration' })).not.toBeInTheDocument();
      expect(screen.queryByText(/configuration details/i)).not.toBeInTheDocument();
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

      for (const domain of ['github.com', 'gmail.com', 'maps.com', 'another.com']) {
        expect(screen.getByText(domain)).toBeInTheDocument();
      }
    });

    it('renders long SAML values as truncating chips with full-value tooltips', async () => {
      const longSsoUrl = `https://idp.example.com/sso/${'a'.repeat(280)}`;
      const { wrapper, fixtures } = await createFixtures(withSecurityPageFixtures);

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([
        configuredConnection({
          active: true,
          samlConnection: {
            idpSsoUrl: longSsoUrl,
            idpEntityId: 'https://idp.example.com/entity',
          },
        }),
      ]);
      fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
        data: [{ id: 'run_1', status: 'success' }],
        total_count: 1,
      } as any);

      renderPage(wrapper);

      const ssoLink = await screen.findByRole('link', { name: longSsoUrl });
      expect(ssoLink).toHaveAttribute('href', longSsoUrl);
      // The full value stays reachable via the tooltip once the chip truncates visually.
      expect(ssoLink).toHaveAttribute('title', longSsoUrl);
      expect(ssoLink).toHaveStyle({ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' });
    });
  });

  describe('loading state', () => {
    it('renders the Security header and a centered spinner (no section frame, no wizard stepper) while loading', async () => {
      const { wrapper, fixtures } = await createFixtures(withSecurityPageFixtures);

      // Hold the source query pending so the page stays in its on-mount loading
      // state (view is still 'overview').
      fixtures.clerk.organization?.getEnterpriseConnections.mockReturnValue(new Promise(() => {}) as any);
      fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
        data: [],
        total_count: 0,
      } as any);

      const { container } = renderPage(wrapper);

      // The page header stays mounted during load — no pop-in when data settles.
      expect(await screen.findByRole('heading', { name: 'Security' })).toBeInTheDocument();

      // The loading body is a bare spinner centered in the remaining content area.
      const spinner = container.querySelector('.cl-spinner');
      expect(spinner).toBeInTheDocument();
      expect(spinner?.parentElement).toHaveStyle({ alignItems: 'center', justifyContent: 'center' });

      // No overview section frame and no wizard-shaped skeleton during load.
      expect(container.querySelector('.cl-profileSection__sso')).not.toBeInTheDocument();
      expect(container.querySelector('.cl-configureSSOStepper')).not.toBeInTheDocument();
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
      // Resuming into `configure` (direction 0) falls through to its furthest-
      // reachable sub-step: a provider already exists, so it lands on
      // `configure-provider` rather than re-showing `select-provider`.
      expect(await screen.findByRole('heading', { name: /configure okta workforce/i })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: /select your identity provider/i })).not.toBeInTheDocument();
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

  describe('enrollment role', () => {
    it("renders the default role's display name when the roles list is readable", async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEnterpriseSso({ selfServeSSO: true });
        f.withEmailAddress();
        f.withOrganizations();
        f.withOrganizationDomains(undefined, 'org:member');
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [
            { name: 'Org1', permissions: ['org:sys_entconns:manage', 'org:sys_memberships:read'] },
          ],
        });
      });

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([]);
      fixtures.clerk.organization?.getRoles.mockResolvedValue({
        total_count: 2,
        data: [
          { id: 'org:admin', key: 'org:admin', name: 'Admin' },
          { id: 'org:member', key: 'org:member', name: 'Member' },
        ],
      } as any);

      renderPage(wrapper);

      expect(
        await screen.findByText(
          'Anyone who signs in will be automatically added to this organization. New members will be assigned to Member.',
        ),
      ).toBeInTheDocument();
    });

    it('falls back to a humanized role key when the roles list is not readable', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEnterpriseSso({ selfServeSSO: true });
        f.withEmailAddress();
        f.withOrganizations();
        f.withOrganizationDomains(undefined, 'org:billing_admin');
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', permissions: ['org:sys_entconns:manage'] }],
        });
      });

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([]);

      renderPage(wrapper);

      expect(
        await screen.findByText(
          'Anyone who signs in will be automatically added to this organization. New members will be assigned to billing admin.',
        ),
      ).toBeInTheDocument();
    });

    it('omits the role sentence when no default role is configured', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withEnterpriseSso({ selfServeSSO: true });
        f.withEmailAddress();
        f.withOrganizations();
        f.withUser({
          email_addresses: ['test@clerk.com'],
          organization_memberships: [{ name: 'Org1', permissions: ['org:sys_entconns:manage'] }],
        });
      });

      fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([]);

      renderPage(wrapper);

      expect(
        await screen.findByText('Anyone who signs in will be automatically added to this organization.'),
      ).toBeInTheDocument();
      expect(screen.queryByText(/new members will be assigned to/i)).not.toBeInTheDocument();
    });
  });
});

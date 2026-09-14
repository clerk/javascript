import { within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';

import type { EnterpriseConnectionMutations } from '../../ConfigureSSO/hooks/useOrganizationEnterpriseConnection';
import { EnterpriseConnectionPage } from '../EnterpriseConnectionPage';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

const withPageFixtures = (f: Parameters<Parameters<typeof createFixtures>[0]>[0]) => {
  f.withEnterpriseSso({ selfServeSSO: true });
  f.withEmailAddress();
  f.withOrganizations();
  f.withUser({
    email_addresses: ['test@clerk.com'],
    organization_memberships: [{ name: 'Org1', permissions: ['org:sys_entconns:manage'] }],
  });
};

const samlConnection = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'ent_1',
    name: 'clerk.com',
    provider: 'saml_okta',
    active: false,
    organizationId: 'Org1',
    domains: ['clerk.com'],
    logoPublicUrl: null,
    syncUserAttributes: false,
    disableAdditionalIdentifications: false,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    samlConnection: {
      idpSsoUrl: 'https://idp.example.com/sso',
      idpEntityId: 'https://idp.example.com/entity',
      idpCertificate: 'CERT',
      idpCertificateExpiresAt: 0,
      idpMetadataUrl: '',
      acsUrl: 'https://accounts.clerk.com/v1/acs',
      spEntityId: 'https://accounts.clerk.com/saml/ent_1',
      spMetadataUrl: 'https://accounts.clerk.com/saml/ent_1/metadata',
      allowSubdomains: false,
      allowIdpInitiated: false,
      forceAuthn: false,
    },
    ...overrides,
  }) as any;

const oidcConnection = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'ent_2',
    name: 'oidc.com',
    provider: 'oidc_custom',
    active: false,
    organizationId: 'Org1',
    domains: ['oidc.com'],
    logoPublicUrl: null,
    syncUserAttributes: false,
    disableAdditionalIdentifications: false,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    samlConnection: null,
    oauthConfig: {
      clientId: 'client-abc',
      redirectUri: 'https://accounts.clerk.com/v1/oauth_callback',
      discoveryUrl: 'https://idp.example.com/.well-known/openid-configuration',
    },
    ...overrides,
  }) as any;

/** Mirrors how the umbrella hook maps the mutation surface onto the organization resource. */
const mutationsFor = (fixtures: any): EnterpriseConnectionMutations => ({
  createConnection: vi.fn(),
  changeProvider: vi.fn(),
  updateConnection: (id, params) => fixtures.clerk.organization.updateEnterpriseConnection(id, params),
  setConnectionActive: (id, active) => fixtures.clerk.organization.updateEnterpriseConnection(id, { active }),
  deleteConnection: id => fixtures.clerk.organization.deleteEnterpriseConnection(id),
  createTestRun: vi.fn(),
});

const renderPage = (
  wrapper: React.ComponentType<{ children?: React.ReactNode }>,
  fixtures: any,
  connection: any,
  onBack = vi.fn(),
  onOpenWizard = vi.fn(),
) => ({
  onBack,
  onOpenWizard,
  ...render(
    <EnterpriseConnectionPage
      connection={connection}
      enterpriseConnectionMutations={mutationsFor(fixtures)}
      organizationName='Org1'
      contentRef={{ current: null }}
      onBack={onBack}
      onOpenWizard={onOpenWizard}
    />,
    { wrapper },
  ),
});

const withNoTestRuns = (fixtures: any) => {
  fixtures.clerk.organization?.getEnterpriseConnectionTestRuns.mockResolvedValue({
    data: [],
    total_count: 0,
  } as any);
};

describe('EnterpriseConnectionPage', () => {
  describe('sections', () => {
    it('renders every section for a SAML connection', async () => {
      const { wrapper, fixtures } = await createFixtures(withPageFixtures);
      withNoTestRuns(fixtures);

      renderPage(wrapper, fixtures, samlConnection());

      expect(await screen.findByRole('heading', { name: 'clerk.com' })).toBeInTheDocument();
      // Once beside the title, once as the General section's Provider row.
      expect(screen.getAllByText('Okta Workforce')).toHaveLength(2);

      expect(screen.getByText('General')).toBeInTheDocument();
      expect(screen.getByText('Service provider')).toBeInTheDocument();
      expect(screen.getByText('Identity provider')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();

      expect(screen.getByDisplayValue('https://accounts.clerk.com/v1/acs')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://accounts.clerk.com/saml/ent_1')).toBeInTheDocument();

      expect(screen.getByDisplayValue('https://idp.example.com/sso')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://idp.example.com/entity')).toBeInTheDocument();

      expect(screen.getAllByRole('switch')).toHaveLength(5);
    });

    it('renders the OIDC variant of the service provider section and only the shared switches', async () => {
      const { wrapper, fixtures } = await createFixtures(withPageFixtures);
      withNoTestRuns(fixtures);

      renderPage(wrapper, fixtures, oidcConnection());

      expect(await screen.findByRole('heading', { name: 'oidc.com' })).toBeInTheDocument();

      expect(screen.getByText('General')).toBeInTheDocument();
      expect(screen.getByText('Service provider')).toBeInTheDocument();
      expect(screen.getByText('Identity provider')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();

      expect(screen.getByDisplayValue('https://accounts.clerk.com/v1/oauth_callback')).toBeInTheDocument();
      expect(screen.getByDisplayValue('client-abc')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('https://accounts.clerk.com/v1/acs')).not.toBeInTheDocument();

      expect(screen.getAllByRole('switch')).toHaveLength(2);
    });
  });

  describe('header actions', () => {
    it('deactivates an active connection', async () => {
      const { wrapper, fixtures } = await createFixtures(withPageFixtures);
      withNoTestRuns(fixtures);
      fixtures.clerk.organization?.updateEnterpriseConnection.mockResolvedValue({ active: false } as any);

      const { userEvent } = renderPage(wrapper, fixtures, samlConnection({ active: true }));

      await userEvent.click(await screen.findByRole('button', { name: 'Deactivate' }));

      expect(fixtures.clerk.organization?.updateEnterpriseConnection).toHaveBeenCalledWith('ent_1', { active: false });
      expect(screen.queryByRole('button', { name: 'Activate' })).not.toBeInTheDocument();
    });

    it('offers the wizard for a connection that is still mid-setup', async () => {
      const { wrapper, fixtures } = await createFixtures(withPageFixtures);
      withNoTestRuns(fixtures);

      const { userEvent, onOpenWizard } = renderPage(
        wrapper,
        fixtures,
        samlConnection({ samlConnection: null, oauthConfig: null }),
      );

      await userEvent.click(await screen.findByRole('button', { name: 'Open setup wizard' }));

      expect(onOpenWizard).toHaveBeenCalled();
    });

    it('removes the connection through the type-to-confirm dialog and returns to the overview', async () => {
      const { wrapper, fixtures } = await createFixtures(withPageFixtures);
      withNoTestRuns(fixtures);
      fixtures.clerk.organization?.deleteEnterpriseConnection.mockResolvedValue({} as any);

      const { userEvent, onBack } = renderPage(wrapper, fixtures, samlConnection({ active: true }));

      await userEvent.click(await screen.findByRole('button', { name: 'Remove' }));

      expect(await screen.findByRole('heading', { name: 'Remove SSO connection' })).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to remove the connection "clerk.com"\?/i)).toBeInTheDocument();

      await userEvent.type(screen.getByLabelText(/below to continue/i), 'Org1');
      await waitFor(() => expect(screen.getByRole('button', { name: 'Remove connection' })).toBeEnabled());
      await userEvent.click(screen.getByRole('button', { name: 'Remove connection' }));

      await waitFor(() => {
        expect(fixtures.clerk.organization?.deleteEnterpriseConnection).toHaveBeenCalledWith('ent_1');
      });
      expect(onBack).toHaveBeenCalled();
    });
  });

  describe('editing', () => {
    it('renames the connection from the General section', async () => {
      const { wrapper, fixtures } = await createFixtures(withPageFixtures);
      withNoTestRuns(fixtures);
      fixtures.clerk.organization?.updateEnterpriseConnection.mockResolvedValue(samlConnection({ name: 'Renamed' }));

      const { userEvent, container } = renderPage(wrapper, fixtures, samlConnection());

      await userEvent.click(await screen.findByRole('button', { name: 'Edit' }));

      const form = container.querySelector('.cl-actionCard') as HTMLElement;
      expect(within(form).getByRole('heading', { name: 'Rename connection' })).toBeInTheDocument();

      const nameInput = within(form).getByLabelText('Name');
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Renamed');
      await userEvent.click(within(form).getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(fixtures.clerk.organization?.updateEnterpriseConnection).toHaveBeenCalledWith('ent_1', {
          name: 'Renamed',
        });
      });
    });

    it('saves the manual SAML identity-provider configuration', async () => {
      const { wrapper, fixtures } = await createFixtures(withPageFixtures);
      withNoTestRuns(fixtures);
      fixtures.clerk.organization?.updateEnterpriseConnection.mockResolvedValue(samlConnection());

      const { userEvent } = renderPage(wrapper, fixtures, samlConnection());

      await userEvent.click(await screen.findByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(fixtures.clerk.organization?.updateEnterpriseConnection).toHaveBeenCalledWith('ent_1', {
          saml: {
            idpSsoUrl: 'https://idp.example.com/sso',
            idpEntityId: 'https://idp.example.com/entity',
          },
        });
      });
    });

    it('toggles a setting through the connection update', async () => {
      const { wrapper, fixtures } = await createFixtures(withPageFixtures);
      withNoTestRuns(fixtures);
      fixtures.clerk.organization?.updateEnterpriseConnection.mockResolvedValue(
        samlConnection({ syncUserAttributes: true }),
      );

      const { userEvent } = renderPage(wrapper, fixtures, samlConnection());

      await userEvent.click(await screen.findByRole('switch', { name: 'Sync user attributes' }));

      await waitFor(() => {
        expect(fixtures.clerk.organization?.updateEnterpriseConnection).toHaveBeenCalledWith('ent_1', {
          syncUserAttributes: true,
        });
      });
    });
  });
});

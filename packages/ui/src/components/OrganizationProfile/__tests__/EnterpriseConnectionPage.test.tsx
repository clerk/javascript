import { ClerkAPIResponseError } from '@clerk/shared/error';
import { fireEvent, within } from '@testing-library/react';
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

const samlConnectionWith = (samlOverrides: Record<string, unknown>) =>
  samlConnection({ samlConnection: { ...samlConnection().samlConnection, ...samlOverrides } });

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
) => {
  const page = (next: any) => (
    <EnterpriseConnectionPage
      connection={next}
      enterpriseConnectionMutations={mutationsFor(fixtures)}
      onBack={onBack}
    />
  );

  const result = render(page(connection), { wrapper });

  return {
    onBack,
    ...result,
    rerenderWith: (next: any) => result.rerender(page(next)),
  };
};

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

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Domains')).toBeInTheDocument();
      expect(screen.getByText('Service provider')).toBeInTheDocument();
      expect(screen.getByText('Identity provider')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.queryByText('Danger zone')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Remove connection' })).not.toBeInTheDocument();

      expect(screen.getByDisplayValue('https://accounts.clerk.com/v1/acs')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://accounts.clerk.com/saml/ent_1')).toBeInTheDocument();

      expect(screen.getAllByRole('checkbox')).toHaveLength(5);
    });

    it('labels the name and the domains with the section titles alone', async () => {
      const { wrapper, fixtures } = await createFixtures(withPageFixtures);
      withNoTestRuns(fixtures);

      renderPage(wrapper, fixtures, samlConnection());

      expect(await screen.findByText('Name')).toBeInTheDocument();
      expect(screen.getAllByText('Name')).toHaveLength(1);
      expect(screen.getAllByText('Domains')).toHaveLength(1);
      expect(screen.queryByText('General')).not.toBeInTheDocument();
      expect(screen.queryByText('Provider')).not.toBeInTheDocument();
      expect(screen.queryByText('Created')).not.toBeInTheDocument();

      expect(screen.getAllByText('Okta Workforce')).toHaveLength(1);
    });

    it('omits the Domains section when the connection has no domains', async () => {
      const { wrapper, fixtures } = await createFixtures(withPageFixtures);
      withNoTestRuns(fixtures);

      renderPage(wrapper, fixtures, samlConnection({ domains: [] }));

      expect(await screen.findByText('Name')).toBeInTheDocument();
      expect(screen.queryByText('Domains')).not.toBeInTheDocument();
    });

    it('renders the manual SAML endpoints as read-only captioned values', async () => {
      const { wrapper, fixtures } = await createFixtures(withPageFixtures);
      withNoTestRuns(fixtures);

      renderPage(wrapper, fixtures, samlConnection());

      const signOnUrl = await screen.findByText('Sign on URL');
      expect(signOnUrl.parentElement).toHaveTextContent('https://idp.example.com/sso');

      const issuer = screen.getByText('Issuer');
      expect(issuer.parentElement).toHaveTextContent('https://idp.example.com/entity');

      expect(screen.queryByDisplayValue('https://idp.example.com/sso')).not.toBeInTheDocument();
      expect(screen.queryByText('Certificate expires')).not.toBeInTheDocument();
    });

    it('renders a single metadata URL row when the connection was configured from metadata', async () => {
      const { wrapper, fixtures } = await createFixtures(withPageFixtures);
      withNoTestRuns(fixtures);

      renderPage(
        wrapper,
        fixtures,
        samlConnectionWith({ idpMetadataUrl: 'https://idp.example.com/metadata', idpSsoUrl: '', idpEntityId: '' }),
      );

      expect(await screen.findByText('https://idp.example.com/metadata')).toBeInTheDocument();
      expect(screen.queryByText('Sign on URL')).not.toBeInTheDocument();
      expect(screen.queryByText('Issuer')).not.toBeInTheDocument();
    });

    it('renders the certificate expiry as a plain row when the certificate has one', async () => {
      const { wrapper, fixtures } = await createFixtures(withPageFixtures);
      withNoTestRuns(fixtures);

      renderPage(
        wrapper,
        fixtures,
        samlConnectionWith({ idpCertificateExpiresAt: Date.parse('2030-05-01T00:00:00Z') }),
      );

      expect(await screen.findByText('Certificate expires')).toBeInTheDocument();
    });

    it('renders the OIDC variant of the service provider section and only the shared settings', async () => {
      const { wrapper, fixtures } = await createFixtures(withPageFixtures);
      withNoTestRuns(fixtures);

      renderPage(wrapper, fixtures, oidcConnection());

      expect(await screen.findByRole('heading', { name: 'oidc.com' })).toBeInTheDocument();

      expect(screen.getByDisplayValue('https://accounts.clerk.com/v1/oauth_callback')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('https://accounts.clerk.com/v1/acs')).not.toBeInTheDocument();

      expect(screen.getByText('Client ID')).toBeInTheDocument();
      expect(screen.getByText('client-abc')).toBeInTheDocument();
      expect(screen.getByText('Discovery endpoint')).toBeInTheDocument();
      expect(screen.queryByText('Authorization URL')).not.toBeInTheDocument();

      expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    });
  });

  describe('header', () => {
    it.each([
      ['active', { active: true }],
      ['inactive', { active: false }],
      ['mid-setup', { samlConnection: null, oauthConfig: null }],
    ])('offers no lifecycle actions for a %s connection', async (_, overrides) => {
      const { wrapper, fixtures } = await createFixtures(withPageFixtures);
      withNoTestRuns(fixtures);

      renderPage(wrapper, fixtures, samlConnection(overrides));

      expect(await screen.findByRole('heading', { name: 'clerk.com' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Activate' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Continue setup' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Deactivate connection' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Remove connection' })).not.toBeInTheDocument();
    });
  });

  describe('editing', () => {
    it('renames the connection from the Name section', async () => {
      const { wrapper, fixtures } = await createFixtures(withPageFixtures);
      withNoTestRuns(fixtures);
      fixtures.clerk.organization?.updateEnterpriseConnection.mockResolvedValue(samlConnection({ name: 'Renamed' }));

      const { userEvent, container } = renderPage(wrapper, fixtures, samlConnection());

      await waitFor(() => expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(2));
      await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);

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

    it('saves the SAML identity provider configuration from the Edit form', async () => {
      const { wrapper, fixtures } = await createFixtures(withPageFixtures);
      withNoTestRuns(fixtures);
      fixtures.clerk.organization?.updateEnterpriseConnection.mockResolvedValue(samlConnection());

      const { userEvent, container } = renderPage(wrapper, fixtures, samlConnection());

      await waitFor(() => expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(2));
      await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[1]);

      const form = container.querySelector('.cl-actionCard') as HTMLElement;
      expect(within(form).getByRole('heading', { name: 'Edit identity provider' })).toBeInTheDocument();

      await userEvent.click(within(form).getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(fixtures.clerk.organization?.updateEnterpriseConnection).toHaveBeenCalledWith('ent_1', {
          saml: {
            idpSsoUrl: 'https://idp.example.com/sso',
            idpEntityId: 'https://idp.example.com/entity',
          },
        });
      });

      await waitFor(() => expect(container.querySelector('.cl-actionCard')).not.toBeInTheDocument());
      expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(2);
    });

    it('opens the SAML Edit form on the metadata URL mode for a metadata-configured connection', async () => {
      const { wrapper, fixtures } = await createFixtures(withPageFixtures);
      withNoTestRuns(fixtures);

      const { userEvent, container } = renderPage(
        wrapper,
        fixtures,
        samlConnectionWith({ idpMetadataUrl: 'https://idp.example.com/metadata', idpSsoUrl: '', idpEntityId: '' }),
      );

      await waitFor(() => expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(2));
      await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[1]);

      const form = container.querySelector('.cl-actionCard') as HTMLElement;
      expect(within(form).getByDisplayValue('https://idp.example.com/metadata')).toBeInTheDocument();
      expect(within(form).queryByLabelText('Sign on URL')).not.toBeInTheDocument();
    });

    it('opens the OIDC Edit form on the discovery mode for a discovery-configured connection', async () => {
      const { wrapper, fixtures } = await createFixtures(withPageFixtures);
      withNoTestRuns(fixtures);

      const { userEvent, container } = renderPage(
        wrapper,
        fixtures,
        oidcConnection({
          oauthConfig: {
            ...oidcConnection().oauthConfig,
            authUrl: 'https://idp.example.com/authorize',
            tokenUrl: 'https://idp.example.com/token',
          },
        }),
      );

      await waitFor(() => expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(2));
      await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[1]);

      const form = container.querySelector('.cl-actionCard') as HTMLElement;
      expect(
        within(form).getByDisplayValue('https://idp.example.com/.well-known/openid-configuration'),
      ).toBeInTheDocument();
      expect(within(form).queryByLabelText('Authorization URL')).not.toBeInTheDocument();
    });
  });

  describe('settings', () => {
    it('reports a failed save inside the Settings section', async () => {
      const { wrapper, fixtures } = await createFixtures(withPageFixtures);
      withNoTestRuns(fixtures);
      fixtures.clerk.organization?.updateEnterpriseConnection.mockRejectedValue(
        new ClerkAPIResponseError('Error', {
          data: [
            { code: 'form_param_format_invalid', message: 'Settings rejected', long_message: 'Settings rejected' },
          ],
          status: 422,
        }),
      );

      const { userEvent, container } = renderPage(wrapper, fixtures, samlConnection());

      await userEvent.click(await screen.findByRole('checkbox', { name: /Sync user attributes/ }));
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));

      const alert = await screen.findByText('Settings rejected');
      expect(container.querySelector('.cl-profileSection__ssoConnectionSettings')).toContainElement(alert);
    });

    it('submits once when Save is clicked twice in a row', async () => {
      const { wrapper, fixtures } = await createFixtures(withPageFixtures);
      withNoTestRuns(fixtures);

      let resolveUpdate: (value: unknown) => void = () => {};
      fixtures.clerk.organization?.updateEnterpriseConnection.mockReturnValue(
        new Promise(resolve => {
          resolveUpdate = resolve;
        }) as any,
      );

      const { userEvent } = renderPage(wrapper, fixtures, samlConnection());

      await userEvent.click(await screen.findByRole('checkbox', { name: /Sync user attributes/ }));

      const save = screen.getByRole('button', { name: 'Save' });
      await userEvent.click(save);
      // The in-flight Save is disabled, so the second click has to bypass the pointer-events guard
      // to reach the submit handler at all.
      fireEvent.click(save);

      expect(fixtures.clerk.organization?.updateEnterpriseConnection).toHaveBeenCalledTimes(1);

      resolveUpdate(samlConnection({ syncUserAttributes: true }));
    });

    it('reseats the checkboxes when the connection comes back changed', async () => {
      const { wrapper, fixtures } = await createFixtures(withPageFixtures);
      withNoTestRuns(fixtures);

      const { rerenderWith } = renderPage(wrapper, fixtures, samlConnection());

      expect(await screen.findByRole('checkbox', { name: /Sync user attributes/ })).not.toBeChecked();

      rerenderWith(samlConnection({ syncUserAttributes: true }));

      await waitFor(() => expect(screen.getByRole('checkbox', { name: /Sync user attributes/ })).toBeChecked());
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });

    it('keeps Save disabled until a setting differs from the connection', async () => {
      const { wrapper, fixtures } = await createFixtures(withPageFixtures);
      withNoTestRuns(fixtures);

      const { userEvent } = renderPage(wrapper, fixtures, samlConnection());

      expect(await screen.findByRole('button', { name: 'Save' })).toBeDisabled();

      await userEvent.click(screen.getByRole('checkbox', { name: /Sync user attributes/ }));
      expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();

      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(screen.getByRole('checkbox', { name: /Sync user attributes/ })).not.toBeChecked();
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });

    it('saves only the changed settings in one call', async () => {
      const { wrapper, fixtures } = await createFixtures(withPageFixtures);
      withNoTestRuns(fixtures);
      fixtures.clerk.organization?.updateEnterpriseConnection.mockResolvedValue(
        samlConnection({ syncUserAttributes: true }),
      );

      const { userEvent } = renderPage(wrapper, fixtures, samlConnection());

      await userEvent.click(await screen.findByRole('checkbox', { name: /Sync user attributes/ }));
      await userEvent.click(screen.getByRole('checkbox', { name: /Allow subdomains/ }));
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(fixtures.clerk.organization?.updateEnterpriseConnection).toHaveBeenCalledTimes(1);
      });
      expect(fixtures.clerk.organization?.updateEnterpriseConnection).toHaveBeenCalledWith('ent_1', {
        syncUserAttributes: true,
        saml: { allowSubdomains: true },
      });
    });
  });
});

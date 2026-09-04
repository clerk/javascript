import { ClerkAPIResponseError } from '@clerk/shared/error';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';

import { ConfigureDirectorySyncWizard } from '../ConfigureDirectorySyncWizard';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

const withDirectorySyncFixtures = (f: Parameters<Parameters<typeof createFixtures>[0]>[0]) => {
  f.withEnterpriseSso({ selfServeSSO: true, selfServeDirectorySync: true });
  f.withEmailAddress();
  f.withOrganizations();
  f.withUser({
    email_addresses: ['test@clerk.com'],
    organization_memberships: [{ name: 'Org1', permissions: ['org:sys_entconns:manage'] }],
  });
};

const oktaConnection = {
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

const directory = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'scimdir_1',
    enterpriseConnectionId: 'ent_1',
    endpointUrl: 'https://api.example.com/scim/v2',
    provider: 'okta',
    enabled: false,
    attributeMapping: {},
    apiKey: null,
    update: vi.fn(),
    delete: vi.fn(),
    rotateToken: vi.fn(),
    getUsers: vi.fn().mockResolvedValue({ data: [], total_count: 0 }),
    ...overrides,
  }) as any;

const notFound = () =>
  new ClerkAPIResponseError('Not found', { status: 404, data: [{ code: 'resource_not_found', message: '' }] });

describe('ConfigureDirectorySyncWizard configure step', () => {
  it('creates the directory on entry and reveals the credentials', async () => {
    const { wrapper, fixtures } = await createFixtures(withDirectorySyncFixtures);
    fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([oktaConnection]);
    const created = directory({ apiKey: 'tok_secret' });
    fixtures.clerk.organization?.getDirectorySync.mockRejectedValueOnce(notFound()).mockResolvedValue(created);
    fixtures.clerk.organization?.createDirectorySync.mockResolvedValue(created);

    const { userEvent } = render(<ConfigureDirectorySyncWizard />, { wrapper });

    expect(await screen.findByDisplayValue('https://api.example.com/scim/v2')).toBeInTheDocument();
    expect(fixtures.clerk.organization?.createDirectorySync).toHaveBeenCalledTimes(1);
    expect(fixtures.clerk.organization?.createDirectorySync).toHaveBeenCalledWith('ent_1', undefined);
    expect(screen.getByDisplayValue('tok_secret')).toBeInTheDocument();
    expect(screen.getByText('Okta Workforce')).toBeInTheDocument();
    expect(screen.getByText('clerk.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();

    const toggle = screen.getByRole('button', { name: 'View instructions' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(/Open the Provisioning tab/)).not.toBeInTheDocument();

    await userEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByText(/Open the Provisioning tab/)).toBeInTheDocument();
  });

  it('hides the token for an existing directory until a new one is generated', async () => {
    const { wrapper, fixtures } = await createFixtures(withDirectorySyncFixtures);
    fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([oktaConnection]);
    const existing = directory();
    existing.rotateToken.mockResolvedValue(directory({ apiKey: 'tok_rotated' }));
    fixtures.clerk.organization?.getDirectorySync.mockResolvedValue(existing);

    const { userEvent } = render(<ConfigureDirectorySyncWizard />, { wrapper });

    expect(await screen.findByDisplayValue('https://api.example.com/scim/v2')).toBeInTheDocument();
    expect(fixtures.clerk.organization?.createDirectorySync).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText('Generate a new token to reveal it')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Generate new token' }));

    expect(existing.rotateToken).toHaveBeenCalledTimes(1);
    expect(await screen.findByDisplayValue('tok_rotated')).toBeInTheDocument();
  });

  it('blocks the step without an SSO connection', async () => {
    const { wrapper, fixtures } = await createFixtures(withDirectorySyncFixtures);
    fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([]);

    render(<ConfigureDirectorySyncWizard />, { wrapper });

    expect(await screen.findByText('Single Sign-On is not configured yet')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled());
    expect(fixtures.clerk.organization?.createDirectorySync).not.toHaveBeenCalled();
    expect(fixtures.clerk.organization?.getDirectorySync).not.toHaveBeenCalled();
  });
});

import type { EnterpriseConnectionJSON, EnterpriseSamlConnectionNestedJSON } from '@clerk/shared/types';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { holdRequests, serveFapi } from '../../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEnterpriseConnection,
  fapiEnvironment,
  fapiMembership,
  fapiOrganization,
  fapiSession,
  fapiUser,
} from '../../../../__tests__/feature/fapi';
import { openMenu } from '../../../../__tests__/feature/menu';
import { renderWithClerk } from '../../../../__tests__/feature/render';
import { OrganizationProfileSecurityPanel } from '../organization-profile-security-panel';

const CONNECTIONS = 'org:sys_entconns:manage';
const CONNECTION_PATH = '/v1/organizations/org_1/enterprise_connections/ent_okta';

const acme = fapiOrganization({ id: 'org_1', name: 'Acme' });

function samlConnection(
  overrides: Partial<EnterpriseSamlConnectionNestedJSON> = {},
): EnterpriseSamlConnectionNestedJSON {
  return {
    id: 'samlc_1',
    name: 'Okta',
    active: true,
    idp_entity_id: 'http://www.okta.com/exk1',
    idp_sso_url: 'https://acme.okta.com/app/sso/saml',
    idp_certificate: 'MIIC',
    idp_certificate_issued_at: 0,
    idp_certificate_expires_at: 0,
    idp_certificates: [{ certificate: 'MIIC', issued_at: null, expires_at: null }],
    idp_metadata_url: '',
    idp_metadata: '',
    acs_url: 'https://clerk.acme.com/v1/saml/acs/ent_okta',
    sp_entity_id: 'https://clerk.acme.com/saml/ent_okta',
    sp_metadata_url: 'https://clerk.acme.com/v1/saml/metadata/ent_okta',
    allow_subdomains: false,
    allow_idp_initiated: false,
    force_authn: false,
    ...overrides,
  };
}

const okta = fapiEnterpriseConnection({
  id: 'ent_okta',
  name: 'Acme Okta',
  provider: 'saml_okta',
  active: true,
  domains: ['acme.com'],
  organization_id: acme.id,
  saml_connection: samlConnection(),
});

const draft = fapiEnterpriseConnection({
  id: 'ent_draft',
  name: 'Draft OIDC',
  provider: 'oidc_custom',
  active: false,
  organization_id: acme.id,
  created_at: okta.created_at + 1,
});

function serve({
  permissions = [CONNECTIONS],
  connections = [okta],
}: {
  permissions?: string[];
  connections?: EnterpriseConnectionJSON[];
} = {}) {
  const own = fapiMembership(
    { ...acme, self_serve_sso_enabled: true },
    {
      permissions,
      role: 'org:admin',
      role_name: 'Admin',
      public_user_data: {
        user_id: 'user_1',
        first_name: 'Alice',
        last_name: null,
        identifier: 'alice@acme.com',
        image_url: '',
        has_image: false,
      },
    },
  );
  const alice = fapiUser({ id: 'user_1', first_name: 'Alice', organization_memberships: [own] });
  const environment = fapiEnvironment();
  environment.user_settings.enterprise_sso = { enabled: true, self_serve_sso: true, self_serve_directory_sync: false };
  return serveFapi({
    environment,
    client: fapiClient([fapiSession({ id: 'sess_1', user: alice, last_active_organization_id: acme.id })]),
    memberships: [own],
    enterpriseConnections: connections,
  });
}

async function findRow(name: string) {
  const label = await screen.findByText(name);
  const row = label.closest('.cl-section-row');
  if (!(row instanceof HTMLElement)) {
    throw new Error(`No row for ${name}`);
  }
  return row;
}

async function openManage(user: ReturnType<typeof userEvent.setup>, name: string) {
  await openMenu(user, await screen.findByRole('button', { name: `Manage ${name}` }));
  await user.click(screen.getByRole('menuitem', { name: 'Manage' }));
  return screen.findByRole('dialog', { name: new RegExp(name) });
}

describe('Seeing the organization’s SSO connections', () => {
  it('lists each connection with its domains and status', async () => {
    serve({ connections: [okta, draft] });
    await renderWithClerk(<OrganizationProfileSecurityPanel />);

    const oktaRow = await findRow('Acme Okta');
    expect(within(oktaRow).getByText('acme.com')).toBeVisible();
    expect(within(oktaRow).getByText('Active')).toBeVisible();

    const draftRow = await findRow('Draft OIDC');
    expect(within(draftRow).getByText('OIDC provider')).toBeVisible();
    expect(within(draftRow).getByText('In progress')).toBeVisible();
  });

  it('says so when the organization has no connection', async () => {
    serve({ connections: [] });
    await renderWithClerk(<OrganizationProfileSecurityPanel />);

    expect(await screen.findByText('No SSO connections')).toBeVisible();
  });

  it('hides the SSO section from a member who cannot manage connections', async () => {
    serve({ permissions: ['org:sys_entconns_sso_bypass:manage'] });
    await renderWithClerk(<OrganizationProfileSecurityPanel />);

    expect(await screen.findByText('SSO bypass')).toBeVisible();
    expect(screen.queryByText('Single Sign-On (SSO)')).toBeNull();
  });
});

describe('Activating and deactivating a connection', () => {
  it('deactivates an active connection', async () => {
    const fapi = serve();
    const user = userEvent.setup();
    await renderWithClerk(<OrganizationProfileSecurityPanel />);

    await openMenu(user, await screen.findByRole('button', { name: 'Manage Acme Okta' }));
    await user.click(screen.getByRole('menuitem', { name: 'Deactivate' }));

    await waitFor(async () => expect(within(await findRow('Acme Okta')).getByText('Inactive')).toBeVisible());
    expect(fapi.enterpriseConnections[0]?.active).toBe(false);
  });

  it('shows why a deactivation failed on the row', async () => {
    serve();
    const user = userEvent.setup();
    await renderWithClerk(<OrganizationProfileSecurityPanel />);
    const hold = holdRequests('post', CONNECTION_PATH);

    await openMenu(user, await screen.findByRole('button', { name: 'Manage Acme Okta' }));
    await user.click(screen.getByRole('menuitem', { name: 'Deactivate' }));
    await hold.fail('form_param_invalid', 'The connection could not be updated.');

    const row = await findRow('Acme Okta');
    await waitFor(() =>
      expect(within(row).getByRole('alert')).toHaveTextContent('The connection could not be updated.'),
    );
    expect(within(row).getByText('Active')).toBeVisible();
  });
});

describe('Removing a connection', () => {
  it('removes the connection once the organization name is typed', async () => {
    const fapi = serve({ connections: [okta, draft] });
    const user = userEvent.setup();
    await renderWithClerk(<OrganizationProfileSecurityPanel />);

    await openMenu(user, await screen.findByRole('button', { name: 'Manage Acme Okta' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove' }));
    const dialog = await screen.findByRole('alertdialog', { name: 'Remove SSO connection' });
    const confirm = within(dialog).getByRole('button', { name: 'Remove connection' });
    expect(confirm).toHaveAttribute('aria-disabled', 'true');

    await user.type(within(dialog).getByLabelText('Type "Acme" below to continue'), 'Acme');
    await user.click(confirm);

    await waitFor(() => expect(screen.queryByText('Acme Okta')).toBeNull());
    expect(fapi.enterpriseConnections.map(connection => connection.id)).toEqual(['ent_draft']);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Manage Draft OIDC' })).toHaveFocus());
  });
});

describe('Managing a connection', () => {
  it('shows the service provider details and the identity provider settings', async () => {
    serve();
    const user = userEvent.setup();
    await renderWithClerk(<OrganizationProfileSecurityPanel />);

    const dialog = await openManage(user, 'Acme Okta');

    expect(within(dialog).getByText('https://clerk.acme.com/v1/saml/acs/ent_okta')).toBeVisible();
    expect(within(dialog).getByText('https://acme.okta.com/app/sso/saml')).toBeVisible();
    expect(within(dialog).getByText('Okta Workforce')).toBeVisible();
  });

  it('returns focus to the row menu when the dialog closes', async () => {
    serve();
    const user = userEvent.setup();
    await renderWithClerk(<OrganizationProfileSecurityPanel />);
    await openManage(user, 'Acme Okta');

    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('button', { name: 'Manage Acme Okta' })).toHaveFocus();
  });

  it('renames the connection', async () => {
    const fapi = serve();
    const user = userEvent.setup();
    await renderWithClerk(<OrganizationProfileSecurityPanel />);
    const dialog = await openManage(user, 'Acme Okta');

    await user.click(within(dialog).getByRole('button', { name: 'Edit name' }));
    const rename = await screen.findByRole('dialog', { name: 'Rename connection' });
    const field = within(rename).getByLabelText('Name');
    await user.clear(field);
    await user.type(field, 'Acme Workforce');
    await user.click(within(rename).getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Rename connection' })).toBeNull());
    expect(fapi.enterpriseConnections[0]?.name).toBe('Acme Workforce');
    expect(await screen.findByRole('dialog', { name: /Acme Workforce/ })).toBeVisible();
  });

  it('turns a setting on', async () => {
    const fapi = serve();
    const user = userEvent.setup();
    await renderWithClerk(<OrganizationProfileSecurityPanel />);
    const dialog = await openManage(user, 'Acme Okta');

    await user.click(within(dialog).getByRole('switch', { name: 'Allow subdomains' }));

    await waitFor(() => expect(fapi.enterpriseConnections[0]?.saml_connection?.allow_subdomains).toBe(true));
    expect(within(dialog).getByRole('switch', { name: 'Allow subdomains' })).toBeChecked();
  });

  it('edits the identity provider’s sign on URL', async () => {
    const fapi = serve();
    const user = userEvent.setup();
    await renderWithClerk(<OrganizationProfileSecurityPanel />);
    const dialog = await openManage(user, 'Acme Okta');

    await user.click(within(dialog).getByRole('button', { name: 'Edit identity provider' }));
    const edit = await screen.findByRole('dialog', { name: 'Edit identity provider' });
    const field = within(edit).getByLabelText('Sign on URL');
    await user.clear(field);
    await user.type(field, 'https://acme.okta.com/app/sso/saml2');
    await user.click(within(edit).getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Edit identity provider' })).toBeNull());
    expect(fapi.enterpriseConnections[0]?.saml_connection?.idp_sso_url).toBe('https://acme.okta.com/app/sso/saml2');
  });

  it('keeps the edit open and explains a rejected identity provider', async () => {
    serve();
    const user = userEvent.setup();
    await renderWithClerk(<OrganizationProfileSecurityPanel />);
    const dialog = await openManage(user, 'Acme Okta');

    await user.click(within(dialog).getByRole('button', { name: 'Edit identity provider' }));
    const edit = await screen.findByRole('dialog', { name: 'Edit identity provider' });
    const hold = holdRequests('post', CONNECTION_PATH);
    await user.click(within(edit).getByRole('radio', { name: 'Add via metadata' }));
    await user.type(within(edit).getByLabelText('Metadata URL'), 'https://acme.okta.com/metadata');
    await user.click(within(edit).getByRole('button', { name: 'Save' }));
    await hold.fail('saml_metadata_invalid', 'The metadata could not be read.');

    await waitFor(() => expect(within(edit).getByRole('alert')).toHaveTextContent('The metadata could not be read.'));
    expect(screen.getByRole('dialog', { name: 'Edit identity provider' })).toBeVisible();
  });
});

import type { OrganizationMembershipJSON, RoleJSON } from '@clerk/shared/types';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fapiUrl, holdRequests, serveFapi, worker } from '../../../../__tests__/feature/fake-fapi';
import { fapiSSOBypassUser } from '../../../../__tests__/feature/fake-fapi/organization-security';
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

const BYPASS = 'org:sys_entconns_sso_bypass:manage';
const CONNECTIONS = 'org:sys_entconns:manage';

const acme = fapiOrganization({ id: 'org_1', name: 'Acme' });
const connection = fapiEnterpriseConnection({ id: 'ent_1', name: 'Okta', organization_id: acme.id });

function member(id: string, firstName: string, email: string, role = 'org:member'): OrganizationMembershipJSON {
  return fapiMembership(acme, {
    id: `orgmem_${id}`,
    role,
    role_name: role === 'org:admin' ? 'Admin' : 'Member',
    public_user_data: {
      user_id: id,
      first_name: firstName,
      last_name: null,
      identifier: email,
      image_url: '',
      has_image: false,
    },
  });
}

const adminRole: RoleJSON = {
  object: 'role',
  id: 'role_admin',
  key: 'org:admin',
  name: 'Admin',
  description: '',
  permissions: [],
  created_at: 0,
  updated_at: 0,
};
const memberRole: RoleJSON = { ...adminRole, id: 'role_member', key: 'org:member', name: 'Member' };

const bob = member('user_2', 'Bob', 'bob@acme.com');
const carol = member('user_3', 'Carol', 'carol@acme.com');
const dave = member('user_4', 'Dave', 'dave@acme.com');

function serve({
  permissions = [BYPASS],
  connections = [connection],
  allowlisted = [bob],
  selfServeSso = false,
  selfServeDirectorySync = false,
  ssoBypass = {},
}: {
  permissions?: string[];
  connections?: ReturnType<typeof fapiEnterpriseConnection>[];
  allowlisted?: OrganizationMembershipJSON[];
  selfServeSso?: boolean;
  selfServeDirectorySync?: boolean;
  ssoBypass?: Parameters<typeof serveFapi>[0]['ssoBypass'];
} = {}) {
  const own = fapiMembership(
    {
      ...acme,
      self_serve_sso_enabled: selfServeSso,
      self_serve_directory_sync_enabled: selfServeDirectorySync,
    },
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
  environment.user_settings.enterprise_sso = {
    enabled: true,
    self_serve_sso: selfServeSso || selfServeDirectorySync,
    self_serve_directory_sync: selfServeDirectorySync,
  };
  return serveFapi({
    environment,
    client: fapiClient([fapiSession({ id: 'sess_1', user: alice, last_active_organization_id: acme.id })]),
    memberships: [own, bob, carol, dave],
    roles: [adminRole, memberRole],
    enterpriseConnections: connections,
    ssoBypass: { users: allowlisted.map(fapiSSOBypassUser), ...ssoBypass },
  });
}

async function openAllowlist() {
  const user = userEvent.setup();
  await renderWithClerk(<OrganizationProfileSecurityPanel />);
  await screen.findByRole('list', { name: 'SSO bypass allow list' });
  return user;
}

async function removeMember(user: ReturnType<typeof userEvent.setup>, name: string) {
  await openMenu(user, screen.getByRole('button', { name: `Manage ${name}` }));
  await user.click(screen.getByRole('menuitem', { name: 'Remove' }));
  const dialog = await screen.findByRole('alertdialog', { name: 'Remove from allow list' });
  await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
  return dialog;
}

function addButton() {
  return screen.getByRole('button', { name: 'Add members to the allow list' });
}

function findAddDialog() {
  return screen.findByRole('dialog', { name: 'Add members' });
}

describe('Who sees the Security page', () => {
  it('shows the SSO bypass allow list to a bypass manager when the organization has a connection', async () => {
    serve({ allowlisted: [bob, carol] });
    await renderWithClerk(<OrganizationProfileSecurityPanel />);

    const list = await screen.findByRole('list', { name: 'SSO bypass allow list' });
    expect(within(list).getByText('Bob')).toBeVisible();
    expect(within(list).getByText('Carol')).toBeVisible();
    expect(screen.getByText('Security')).toBeVisible();
  });

  it('hides the page from a bypass manager when the organization has no connection', async () => {
    serve({ connections: [] });
    await renderWithClerk(
      <>
        <OrganizationProfileSecurityPanel />
        <p>Rendered</p>
      </>,
    );

    expect(await screen.findByText('Rendered')).toBeVisible();
    await waitFor(() => expect(screen.queryByText('Security')).toBeNull());
  });

  it('hides the page from a member without security permissions', async () => {
    serve({ permissions: [], selfServeSso: true });
    await renderWithClerk(
      <>
        <OrganizationProfileSecurityPanel />
        <p>Rendered</p>
      </>,
    );

    expect(await screen.findByText('Rendered')).toBeVisible();
    expect(screen.queryByText('Security')).toBeNull();
  });

  it('shows the page to a connection manager when self-serve SSO is on', async () => {
    serve({ permissions: [CONNECTIONS], selfServeSso: true, connections: [] });
    await renderWithClerk(<OrganizationProfileSecurityPanel />);

    expect(await screen.findByText('Security')).toBeVisible();
    expect(screen.queryByText('SSO bypass')).toBeNull();
  });

  it('shows the page to a connection manager when only Directory Sync is self-serve for the organization', async () => {
    serve({ permissions: [CONNECTIONS], selfServeDirectorySync: true, connections: [] });
    await renderWithClerk(<OrganizationProfileSecurityPanel />);

    expect(await screen.findByText('Security')).toBeVisible();
  });

  it('hides the SSO bypass section when the instance does not offer it', async () => {
    serve({ permissions: [BYPASS, CONNECTIONS], selfServeSso: true, ssoBypass: { enabled: false } });
    const settle = () => new Promise(resolve => setTimeout(resolve, 50));
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      await renderWithClerk(<OrganizationProfileSecurityPanel />);
      expect(await screen.findByText('Security')).toBeVisible();

      for (let step = 0; step < 20 && screen.queryByText('SSO bypass'); step++) {
        await act(async () => vi.advanceTimersByTimeAsync(1_000));
        await settle();
      }

      expect(screen.queryByText('SSO bypass')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('When the connections request fails', () => {
  const ERROR_TEXT = 'Could not check this organization’s SSO connections';
  const settle = () => new Promise(resolve => setTimeout(resolve, 50));

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function renderWithFailedConnections() {
    serve({ allowlisted: [bob] });
    const outage = { active: true, requests: 0 };
    worker.use(
      http.get(fapiUrl('/v1/organizations/:organizationId/enterprise_connections'), () => {
        if (!outage.active) {
          return undefined;
        }
        outage.requests++;
        return HttpResponse.json(
          {
            errors: [
              { code: 'internal_clerk_error', message: 'Something went wrong', long_message: 'Something went wrong' },
            ],
          },
          { status: 500 },
        );
      }),
    );
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await renderWithClerk(<OrganizationProfileSecurityPanel />);
    for (let step = 0; step < 20 && !screen.queryByText(ERROR_TEXT); step++) {
      await act(async () => vi.advanceTimersByTimeAsync(1_000));
      await settle();
    }
    return { user, outage };
  }

  it('keeps the Security page and says the check failed', async () => {
    const { outage } = await renderWithFailedConnections();

    expect(outage.requests).toBeGreaterThan(0);
    expect(screen.getByText('Security')).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent(ERROR_TEXT);
    expect(screen.queryByRole('list', { name: 'SSO bypass allow list' })).toBeNull();
  });

  it('shows the allow list after Try again succeeds', async () => {
    const { user, outage } = await renderWithFailedConnections();
    expect(screen.getByRole('alert')).toHaveTextContent(ERROR_TEXT);

    outage.active = false;
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    const list = await screen.findByRole('list', { name: 'SSO bypass allow list' });
    expect(within(list).getByText('Bob')).toBeVisible();
    expect(screen.queryByText(ERROR_TEXT)).toBeNull();
  });
});

describe('The Security page with no sections to show', () => {
  const EMPTY = 'No security settings yet';

  it.each([
    {
      name: 'a connection manager with self-serve SSO and no connection',
      permissions: [CONNECTIONS],
      selfServeSso: true,
      connections: [],
    },
    {
      name: 'a connection manager with self-serve SSO and a connection',
      permissions: [CONNECTIONS],
      selfServeSso: true,
    },
    {
      name: 'a connection manager with self-serve Directory Sync',
      permissions: [CONNECTIONS],
      selfServeDirectorySync: true,
      connections: [],
    },
    {
      name: 'a member with both permissions, self-serve SSO and no connection',
      permissions: [BYPASS, CONNECTIONS],
      selfServeSso: true,
      connections: [],
    },
  ])('shows an empty state to $name', async ({ name: _name, ...options }) => {
    serve(options);
    await renderWithClerk(<OrganizationProfileSecurityPanel />);

    expect(await screen.findByText(EMPTY)).toBeVisible();
    expect(
      screen.getByText('Single sign-on and directory sync settings for this organization will appear here.'),
    ).toBeVisible();
    expect(screen.queryByText('SSO bypass')).toBeNull();
  });

  it('does not show the empty state with the SSO bypass allow list', async () => {
    serve({ permissions: [BYPASS, CONNECTIONS], selfServeSso: true });
    await renderWithClerk(<OrganizationProfileSecurityPanel />);

    await screen.findByRole('list', { name: 'SSO bypass allow list' });
    expect(screen.queryByText(EMPTY)).toBeNull();
  });
});

describe('Managing the SSO bypass allow list', () => {
  it('lists members and marks the current user', async () => {
    serve({ allowlisted: [bob, carol, member('user_1', 'Alice', 'alice@acme.com', 'org:admin')] });
    await openAllowlist();
    const list = screen.getByRole('list', { name: 'SSO bypass allow list' });

    expect(within(list).getByText('Bob')).toBeVisible();
    expect(within(list).getByText('carol@acme.com')).toBeVisible();
    expect(within(list).getByText('You')).toBeVisible();
  });

  it('pages the allow list five members at a time', async () => {
    const extra = ['Erin', 'Frank', 'Grace', 'Heidi'].map((name, index) =>
      member(`user_${index + 5}`, name, `${name.toLowerCase()}@acme.com`),
    );
    serve({ allowlisted: [bob, carol, dave, ...extra] });
    const user = await openAllowlist();
    const list = screen.getByRole('list', { name: 'SSO bypass allow list' });

    expect(within(list).getAllByRole('listitem')).toHaveLength(5);
    expect(within(list).queryByText('Grace')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Next allow list page' }));

    await waitFor(() => expect(within(list).getAllByRole('listitem')).toHaveLength(2));
    expect(within(list).getByText('Grace')).toBeVisible();
    expect(within(list).getByText('Heidi')).toBeVisible();
  });

  it('moves back a page when the last member on a page is removed', async () => {
    const extra = ['Erin', 'Frank', 'Grace'].map((name, index) =>
      member(`user_${index + 5}`, name, `${name.toLowerCase()}@acme.com`),
    );
    serve({ allowlisted: [bob, carol, dave, ...extra] });
    const user = await openAllowlist();

    await user.click(screen.getByRole('button', { name: 'Next allow list page' }));
    await screen.findByText('Grace');
    await removeMember(user, 'Grace');

    await waitFor(() => expect(screen.queryByText('Grace')).toBeNull());
    const list = screen.getByRole('list', { name: 'SSO bypass allow list' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(5);
    expect(screen.queryByRole('navigation', { name: 'Allow list pagination' })).toBeNull();
  });

  it('shows the empty state when nobody is on the list', async () => {
    serve({ allowlisted: [] });
    await openAllowlist();

    expect(await screen.findByText('There are no members on the allow list yet')).toBeVisible();
  });

  it('removes a member', async () => {
    const fapi = serve({ allowlisted: [bob, carol] });
    const user = await openAllowlist();

    await removeMember(user, 'Bob');

    await waitFor(() => expect(screen.queryByText('Bob')).toBeNull());
    expect(fapi.ssoBypass.users.map(entry => entry.user_id)).toEqual(['user_3']);
  });

  it('moves focus to the next row after a removal', async () => {
    serve({ allowlisted: [bob, carol] });
    const user = await openAllowlist();

    await removeMember(user, 'Bob');

    await waitFor(() => expect(screen.queryByText('Bob')).toBeNull());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Manage Carol' })).toHaveFocus());
  });

  it('names the member in the removal confirmation and keeps them when it is cancelled', async () => {
    const fapi = serve({ allowlisted: [bob] });
    const user = await openAllowlist();

    await openMenu(user, screen.getByRole('button', { name: 'Manage Bob' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove' }));
    const dialog = await screen.findByRole('alertdialog', { name: 'Remove from allow list' });
    expect(dialog).toHaveTextContent('Bob (bob@acme.com) will no longer be able to sign in');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(screen.getByText('Bob')).toBeVisible();
    expect(fapi.ssoBypass.users.map(entry => entry.user_id)).toEqual(['user_2']);
  });

  it('shows why a removal failed and keeps the row', async () => {
    serve({ allowlisted: [bob] });
    const user = await openAllowlist();
    const remove = holdRequests('post', '/v1/organizations/:organizationId/sso_bypass_allowlist_users/:userId');

    const dialog = await removeMember(user, 'Bob');
    remove.fail('resource_not_found', 'That member is not on the allow list.');

    await waitFor(() =>
      expect(within(dialog).getByRole('alert')).toHaveTextContent('That member is not on the allow list.'),
    );
    expect(screen.getByText('Bob')).toBeVisible();
  });

  it('returns focus to Add when the add dialog closes on Escape', async () => {
    serve();
    const user = await openAllowlist();

    await user.click(addButton());
    await findAddDialog();
    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Add members' })).toBeNull());
    expect(addButton()).toHaveFocus();
  });
});

describe('Adding members to the SSO bypass allow list', () => {
  it('adds a member by email', async () => {
    const fapi = serve({ allowlisted: [] });
    const user = await openAllowlist();

    await user.click(addButton());
    const dialog = await findAddDialog();
    await user.type(within(dialog).getByRole('textbox', { name: 'Email address' }), 'Carol@acme.com');
    await user.click(within(dialog).getByRole('button', { name: 'Add members' }));

    expect(await within(dialog).findByText('Added member successfully')).toBeVisible();
    expect(fapi.ssoBypass.users.map(entry => entry.user_id)).toEqual(['user_3']);
    await user.click(within(dialog).getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Add members' })).toBeNull());
    expect(await screen.findByText('Carol')).toBeVisible();
  });

  it('says when no member has that email address', async () => {
    serve({ allowlisted: [] });
    const user = await openAllowlist();

    await user.click(addButton());
    const dialog = await findAddDialog();
    await user.type(within(dialog).getByRole('textbox', { name: 'Email address' }), 'zed@acme.com');
    await user.click(within(dialog).getByRole('button', { name: 'Add members' }));

    await waitFor(() =>
      expect(within(dialog).getByRole('alert')).toHaveTextContent(
        'No member of this organization has that email address.',
      ),
    );
  });

  it('says when the member is already on the list', async () => {
    serve({ allowlisted: [bob] });
    const user = await openAllowlist();

    await user.click(addButton());
    const dialog = await findAddDialog();
    await user.type(within(dialog).getByRole('textbox', { name: 'Email address' }), 'bob@acme.com');
    await user.click(within(dialog).getByRole('button', { name: 'Add members' }));

    await waitFor(() =>
      expect(within(dialog).getByRole('alert')).toHaveTextContent('This member is already on the allow list.'),
    );
  });

  it('adds everyone with a role and reports who was skipped', async () => {
    const fapi = serve({
      allowlisted: [bob],
      ssoBypass: { rejections: { user_4: 'sso_bypass_domain_not_served' } },
    });
    const user = await openAllowlist();

    await user.click(addButton());
    const dialog = await findAddDialog();
    await user.click(within(dialog).getByRole('radio', { name: 'Role' }));
    await user.click(await within(dialog).findByRole('combobox', { name: /^Role/ }));
    await user.click(await screen.findByRole('option', { name: 'Member (3)' }));
    await user.click(within(dialog).getByRole('button', { name: 'Add members' }));

    expect(await within(dialog).findByText('Added 1 member')).toBeVisible();
    expect(
      within(dialog).getByText(
        '1 member could not be added because their email address is not served by a connection.',
      ),
    ).toBeVisible();
    expect(fapi.ssoBypass.users.map(entry => entry.user_id).sort()).toEqual(['user_2', 'user_3']);
  });

  it('says when the server skips everyone with the role', async () => {
    serve({
      allowlisted: [],
      ssoBypass: {
        rejections: {
          user_2: 'sso_bypass_domain_not_served',
          user_3: 'sso_bypass_domain_not_served',
          user_4: 'sso_bypass_domain_not_served',
        },
      },
    });
    const user = await openAllowlist();

    await user.click(addButton());
    const dialog = await findAddDialog();
    await user.click(within(dialog).getByRole('radio', { name: 'Role' }));
    await user.click(await within(dialog).findByRole('combobox', { name: /^Role/ }));
    await user.click(await screen.findByRole('option', { name: 'Member (3)' }));
    await user.click(within(dialog).getByRole('button', { name: 'Add members' }));

    await waitFor(() =>
      expect(within(dialog).getByRole('alert')).toHaveTextContent(
        'No members could be added because their email addresses are not served by a connection.',
      ),
    );
  });

  it('clears a failed attempt when the dialog is reopened', async () => {
    serve({ allowlisted: [] });
    const user = await openAllowlist();

    await user.click(addButton());
    let dialog = await findAddDialog();
    await user.type(within(dialog).getByRole('textbox', { name: 'Email address' }), 'zed@acme.com');
    await user.click(within(dialog).getByRole('button', { name: 'Add members' }));
    await waitFor(() => expect(within(dialog).getByRole('alert')).toHaveTextContent('No member'));
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Add members' })).toBeNull());

    await user.click(addButton());
    dialog = await findAddDialog();
    expect(within(dialog).getByRole('textbox', { name: 'Email address' })).toHaveValue('');
    expect(within(dialog).getByRole('textbox', { name: 'Email address' })).toHaveFocus();
    expect(within(dialog).queryByText(/No member/)).toBeNull();
  });

  it('says when everyone with the role is already on the list', async () => {
    serve({ allowlisted: [bob, carol, dave] });
    const user = await openAllowlist();

    await user.click(addButton());
    const dialog = await findAddDialog();
    await user.click(within(dialog).getByRole('radio', { name: 'Role' }));
    await user.click(await within(dialog).findByRole('combobox', { name: /^Role/ }));
    await user.click(await screen.findByRole('option', { name: 'Member (3)' }));
    await user.click(within(dialog).getByRole('button', { name: 'Add members' }));

    await waitFor(() =>
      expect(within(dialog).getByRole('alert')).toHaveTextContent(
        'Everyone with that role is already on the allow list.',
      ),
    );
  });
});

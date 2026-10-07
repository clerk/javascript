import { ClerkAPIResponseError } from '@clerk/shared/error';
import { within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen, waitFor } from '@/test/utils';

import { clearFetchCache } from '../../../hooks/useFetch';
import { ConfigureDirectorySyncWizard } from '../ConfigureDirectorySyncWizard';

const { createFixtures } = bindCreateFixtures('OrganizationProfile');

const FULL_PERMISSIONS = ['org:sys_entconns:manage', 'org:sys_memberships:manage'];

const withDirectorySyncFixtures =
  (permissions: string[]) => (f: Parameters<Parameters<typeof createFixtures>[0]>[0]) => {
    f.withEnterpriseSso({ selfServeSSO: true, selfServeDirectorySync: true });
    f.withEmailAddress();
    f.withOrganizations();
    f.withUser({
      email_addresses: ['test@clerk.com'],
      organization_memberships: [{ name: 'Org1', permissions: permissions as any }],
    });
  };

const oktaConnection = {
  id: 'ent_1',
  name: 'clerk.com',
  provider: 'saml_okta',
  active: true,
  organizationId: 'Org1',
  domains: ['clerk.com'],
  samlConnection: { idpSsoUrl: 'https://idp.example.com/sso', idpEntityId: 'x', idpCertificate: 'CERT' },
} as any;

const role = (key: string, name: string) => ({
  pathRoot: '',
  reload: vi.fn(),
  id: `role_${key}`,
  key,
  name,
  description: '',
  permissions: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

const ROLES = [
  role('org:admin', 'Admin'),
  role('org:member', 'Member'),
  role('org:billing_manager', 'Billing Manager'),
];

const GROUPS = [
  { id: 'dirgrp_leads', displayName: 'Engineering Leads', updatedAt: null },
  { id: 'dirgrp_eng', displayName: 'Engineering', updatedAt: null },
  { id: 'dirgrp_finance', displayName: 'Finance', updatedAt: null },
  { id: 'dirgrp_contractors', displayName: 'Contractors', updatedAt: null },
];

const mapping = (groupId: string, name: string, roleKey: string, precedence: number) => ({
  id: `dgrm_${groupId}`,
  directoryGroupId: groupId,
  directoryGroupDisplayName: name,
  role: ROLES.find(r => r.key === roleKey)!,
  precedence,
});

const SAVED_MAPPINGS = [
  mapping('dirgrp_leads', 'Engineering Leads', 'org:admin', 1),
  mapping('dirgrp_eng', 'Engineering', 'org:member', 2),
  mapping('dirgrp_finance', 'Finance', 'org:billing_manager', 3),
];

const directory = ({ groups = GROUPS, mappings = SAVED_MAPPINGS, groupRoleMappingEnabled = true } = {}) =>
  ({
    id: 'scimdir_1',
    organizationId: 'Org1',
    enterpriseConnectionId: 'ent_1',
    endpointUrl: 'https://api.example.com/scim/v2',
    provider: 'okta',
    enabled: true,
    groupRoleMappingEnabled,
    attributeMapping: {},
    apiKey: null,
    update: vi.fn(),
    delete: vi.fn(),
    rotateToken: vi.fn(),
    getUsers: vi.fn().mockResolvedValue({ data: [], total_count: 0 }),
    getGroups: vi.fn().mockResolvedValue({ data: groups, startingAfter: null, hasNextPage: false }),
    getGroupRoleMappings: vi.fn().mockResolvedValue({ data: mappings, defaultRole: ROLES[1] }),
    replaceGroupRoleMappings: vi.fn().mockResolvedValue({ data: [], defaultRole: ROLES[1] }),
  }) as any;

const renderRolesStep = async (
  dir = directory(),
  { permissions = FULL_PERMISSIONS, hasRoleSetMigration = false } = {},
) => {
  const { wrapper, fixtures } = await createFixtures(withDirectorySyncFixtures(permissions));
  fixtures.clerk.organization?.getEnterpriseConnections.mockResolvedValue([oktaConnection]);
  fixtures.clerk.organization?.getDirectorySync.mockResolvedValue(dir);
  fixtures.clerk.organization?.getRoles.mockResolvedValue({
    total_count: ROLES.length,
    data: ROLES,
    has_role_set_migration: hasRoleSetMigration,
  } as any);

  const result = render(<ConfigureDirectorySyncWizard />, { wrapper });
  await screen.findByDisplayValue('https://api.example.com/scim/v2');
  await result.userEvent.click(screen.getByRole('button', { name: 'Continue' }));
  await result.userEvent.click(screen.getByRole('button', { name: 'Continue' }));
  await screen.findByRole('heading', { name: 'Test provisioning' });
  await result.userEvent.click(screen.getByRole('button', { name: 'Continue' }));
  await screen.findByRole('heading', { name: 'Role mapping' });
  return { ...result, directory: dir };
};

const priorityOrder = () =>
  screen
    .getAllByRole('button', { name: /^Reorder .* mapping$/ })
    .map(b => b.getAttribute('aria-label')!.replace(/^Reorder (.*) mapping$/, '$1'));

const ROLE_TRIGGER = /Admin|Member|Billing Manager|Unassigned/;

const roleIn = (rowTestId: string) =>
  within(screen.getByTestId(`role-mapping-row-${rowTestId}`)).getByRole('button', { name: ROLE_TRIGGER });

const selectRole = async (
  userEvent: Awaited<ReturnType<typeof renderRolesStep>>['userEvent'],
  rowTestId: string,
  roleName: string,
) => {
  await userEvent.click(roleIn(rowTestId));
  await userEvent.click(await screen.findByRole('option', { name: roleName }));
};

describe('RoleMappingStep', () => {
  beforeEach(() => {
    clearFetchCache();
  });

  it('shows saved mappings by priority, unmapped groups after them, and the default role last', async () => {
    await renderRolesStep();

    expect(await screen.findByTestId('role-mapping-row-dirgrp_leads')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Sync roles' })).toBeChecked();
    expect(priorityOrder()).toEqual(['Engineering Leads', 'Engineering', 'Finance']);
    expect(roleIn('dirgrp_leads')).toHaveTextContent('Admin');
    expect(roleIn('dirgrp_contractors')).toHaveTextContent('Unassigned');

    const everyone = screen.getByTestId('role-mapping-row-everyone');
    expect(within(everyone).getByText('Everyone else')).toBeInTheDocument();
    expect(within(everyone).getByRole('button', { name: 'Member' })).toBeDisabled();
    expect(everyone.parentElement?.lastElementChild).toBe(everyone);
  });

  it('saves nothing when Complete is pressed without changes', async () => {
    const { userEvent, directory: dir } = await renderRolesStep();
    await screen.findByTestId('role-mapping-row-dirgrp_leads');

    await userEvent.click(screen.getByRole('button', { name: 'Complete' }));

    await waitFor(() => expect(dir.getGroupRoleMappings).toHaveBeenCalled());
    expect(dir.replaceGroupRoleMappings).not.toHaveBeenCalled();
    expect(dir.update).not.toHaveBeenCalled();
  });

  it('replaces the mappings in priority order on Complete, dropping groups set to Unassigned', async () => {
    const { userEvent, directory: dir } = await renderRolesStep();
    await screen.findByTestId('role-mapping-row-dirgrp_leads');

    await selectRole(userEvent, 'dirgrp_contractors', 'Member');
    expect(priorityOrder()).toEqual(['Engineering Leads', 'Engineering', 'Finance', 'Contractors']);

    await selectRole(userEvent, 'dirgrp_eng', 'Unassigned');
    expect(priorityOrder()).toEqual(['Engineering Leads', 'Finance', 'Contractors']);

    screen.getByRole('button', { name: 'Reorder Finance mapping' }).focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(priorityOrder()).toEqual(['Finance', 'Engineering Leads', 'Contractors']);

    await userEvent.click(screen.getByRole('button', { name: 'Complete' }));

    await waitFor(() =>
      expect(dir.replaceGroupRoleMappings).toHaveBeenCalledWith({
        mappings: [
          { directoryGroupId: 'dirgrp_finance', role: 'org:billing_manager' },
          { directoryGroupId: 'dirgrp_leads', role: 'org:admin' },
          { directoryGroupId: 'dirgrp_contractors', role: 'org:member' },
        ],
      }),
    );
    expect(dir.update).not.toHaveBeenCalled();
  });

  it('turns role sync on through the directory on Complete', async () => {
    const { userEvent, directory: dir } = await renderRolesStep(directory({ groupRoleMappingEnabled: false }));
    await screen.findByTestId('role-mapping-row-dirgrp_leads');

    const toggle = screen.getByRole('switch', { name: 'Sync roles' });
    expect(toggle).not.toBeChecked();
    await userEvent.click(toggle);
    expect(await screen.findByRole('heading', { name: 'Enabling role sync' })).toBeInTheDocument();
    expect(toggle).not.toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: 'Enable role sync' }));
    expect(toggle).toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: 'Complete' }));

    await waitFor(() => expect(dir.update).toHaveBeenCalledWith({ groupRoleMappingEnabled: true }));
    expect(dir.replaceGroupRoleMappings).not.toHaveBeenCalled();
  });

  it('leaves role sync off when enabling is cancelled', async () => {
    const { userEvent } = await renderRolesStep(directory({ groupRoleMappingEnabled: false }));
    await screen.findByTestId('role-mapping-row-dirgrp_leads');

    const toggle = screen.getByRole('switch', { name: 'Sync roles' });
    await userEvent.click(toggle);
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('heading', { name: 'Enabling role sync' })).not.toBeInTheDocument();
    expect(toggle).not.toBeChecked();
  });

  it('turns role sync off through the directory on Complete', async () => {
    const { userEvent, directory: dir } = await renderRolesStep(directory({ groupRoleMappingEnabled: true }));
    await screen.findByTestId('role-mapping-row-dirgrp_leads');

    const toggle = screen.getByRole('switch', { name: 'Sync roles' });
    expect(toggle).toBeChecked();
    await userEvent.click(toggle);
    expect(await screen.findByRole('heading', { name: 'Disabling role sync' })).toBeInTheDocument();
    expect(toggle).toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: 'Disable role sync' }));
    expect(toggle).not.toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: 'Complete' }));

    await waitFor(() => expect(dir.update).toHaveBeenCalledWith({ groupRoleMappingEnabled: false }));
  });

  it('leaves role sync on when disabling is cancelled', async () => {
    const { userEvent } = await renderRolesStep(directory({ groupRoleMappingEnabled: true }));
    await screen.findByTestId('role-mapping-row-dirgrp_leads');

    const toggle = screen.getByRole('switch', { name: 'Sync roles' });
    await userEvent.click(toggle);
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('heading', { name: 'Disabling role sync' })).not.toBeInTheDocument();
    expect(toggle).toBeChecked();
  });

  it('sorts unmapped groups by name and lists Unassigned first, then roles by name', async () => {
    const { userEvent } = await renderRolesStep(directory({ mappings: [] }));
    await screen.findByTestId('role-mapping-row-dirgrp_leads');

    const rows = screen.getAllByTestId(/^role-mapping-row-dirgrp_/).map(r => r.getAttribute('data-testid'));
    expect(rows).toEqual([
      'role-mapping-row-dirgrp_contractors',
      'role-mapping-row-dirgrp_eng',
      'role-mapping-row-dirgrp_leads',
      'role-mapping-row-dirgrp_finance',
    ]);

    await userEvent.click(roleIn('dirgrp_eng'));
    const options = (await screen.findAllByRole('option')).map(o => o.textContent);
    expect(options).toEqual(['Unassigned', 'Admin', 'Billing Manager', 'Member']);
  });

  it('shows the save error and keeps the edits when the replace is refused', async () => {
    const dir = directory();
    dir.replaceGroupRoleMappings.mockRejectedValue(
      new ClerkAPIResponseError('Conflict', {
        status: 409,
        data: [{ code: 'role_set_migration_in_progress', message: 'Role set migration in progress' }],
      }),
    );
    const { userEvent } = await renderRolesStep(dir);
    await screen.findByTestId('role-mapping-row-dirgrp_leads');

    await selectRole(userEvent, 'dirgrp_contractors', 'Admin');
    await userEvent.click(screen.getByRole('button', { name: 'Complete' }));

    expect(await screen.findByText('Role set migration in progress')).toBeInTheDocument();
    expect(roleIn('dirgrp_contractors')).toHaveTextContent('Admin');
  });

  it('keeps edits across steps and shows the empty state when no groups were pushed', async () => {
    const { userEvent } = await renderRolesStep();
    await screen.findByTestId('role-mapping-row-dirgrp_leads');
    await selectRole(userEvent, 'dirgrp_contractors', 'Admin');

    await userEvent.click(screen.getByRole('button', { name: 'Previous' }));
    await screen.findByRole('heading', { name: 'Test provisioning' });
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByRole('heading', { name: 'Role mapping' });
    expect(roleIn('dirgrp_contractors')).toHaveTextContent('Admin');
  });

  it('is read-only without permission to manage members', async () => {
    const { userEvent, directory: dir } = await renderRolesStep(directory({ groupRoleMappingEnabled: false }), {
      permissions: ['org:sys_entconns:manage'],
    });
    await screen.findByTestId('role-mapping-row-dirgrp_leads');

    expect(screen.getByText('Role mapping is read-only')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Sync roles' })).toBeDisabled();
    for (const id of ['dirgrp_leads', 'dirgrp_contractors']) {
      for (const button of within(screen.getByTestId(`role-mapping-row-${id}`)).getAllByRole('button')) {
        expect(button).toBeDisabled();
      }
    }

    await userEvent.click(screen.getByRole('button', { name: 'Complete' }));
    await waitFor(() => expect(dir.getGroupRoleMappings).toHaveBeenCalled());
    expect(dir.update).not.toHaveBeenCalled();
    expect(dir.replaceGroupRoleMappings).not.toHaveBeenCalled();
  });

  it('is read-only while the role set is being migrated', async () => {
    await renderRolesStep(directory(), { hasRoleSetMigration: true });
    expect(await screen.findByText('Roles are temporarily locked')).toBeInTheDocument();

    expect(screen.getByRole('switch', { name: 'Sync roles' })).toBeDisabled();
    expect(roleIn('dirgrp_contractors')).toBeDisabled();
    expect(roleIn('dirgrp_leads')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reorder Finance mapping' })).toBeDisabled();
  });

  it('shows the empty state when the directory has no groups', async () => {
    await renderRolesStep(directory({ groups: [], mappings: [] }));

    expect(await screen.findByText('No groups provisioned yet')).toBeInTheDocument();
    expect(screen.getByText(/Push groups from Okta Workforce/)).toBeInTheDocument();
  });

  it('shows the API error message when loading the mappings is refused', async () => {
    const dir = directory();
    dir.getGroupRoleMappings.mockRejectedValue(
      new ClerkAPIResponseError('Forbidden', {
        status: 403,
        data: [{ code: 'not_allowed', message: 'Not allowed', long_message: 'You cannot view role mappings' }],
      }),
    );
    await renderRolesStep(dir);

    expect(await screen.findByText('Could not load role mappings')).toBeInTheDocument();
    expect(screen.getByText('You cannot view role mappings')).toBeInTheDocument();
  });

  it('hides non-API error details when loading the mappings fails', async () => {
    const dir = directory();
    dir.getGroupRoleMappings.mockRejectedValue(
      new SyntaxError('Unexpected non-whitespace character after JSON at position 4'),
    );
    await renderRolesStep(dir);

    expect(await screen.findByText('Could not load role mappings')).toBeInTheDocument();
    expect(screen.queryByText(/Unexpected non-whitespace/)).not.toBeInTheDocument();
  });
});

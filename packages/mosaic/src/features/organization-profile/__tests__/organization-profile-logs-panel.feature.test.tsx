import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { openDialog } from '../../../__tests__/feature/dialog';
import { serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiMembership, fapiOrganization, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import { OrganizationProfileLogsPanel } from '../organization-profile-logs-panel';

const acme = fapiOrganization({ id: 'org_1', name: 'Acme' });

async function renderPanel(permissions: string[]) {
  const alice = fapiUser({
    id: 'user_1',
    first_name: 'Alice',
    organization_memberships: [fapiMembership(acme, { permissions })],
  });
  serveFapi({
    client: fapiClient([fapiSession({ id: 'sess_1', user: alice, last_active_organization_id: acme.id })]),
  });
  await renderWithClerk(<OrganizationProfileLogsPanel />);
  return userEvent.setup();
}

function bodyRows() {
  const [, ...rows] = within(screen.getByRole('grid', { name: 'Logs' })).getAllByRole('row');
  return rows;
}

describe('OrganizationProfileLogsPanel', () => {
  it('lists the latest events with their member, IP address and timestamp', async () => {
    await renderPanel(['org:sys_logs:read']);

    expect(await screen.findByRole('grid', { name: 'Logs' })).toBeVisible();
    expect(bodyRows()).toHaveLength(10);
    const [first] = bodyRows();
    expect(first).toHaveAccessibleName('Signed in session.created');
    expect(within(first).getByText('session.created')).toBeVisible();
    expect(within(first).getByText('Liam Chen')).toBeVisible();
    expect(within(first).getByText('198.51.100.7')).toBeVisible();
  });

  it('moves between pages of events', async () => {
    const user = await renderPanel(['org:sys_logs:read']);

    await user.click(await screen.findByRole('button', { name: 'Next logs page' }));

    expect(await screen.findByRole('row', { name: /^Domain added/ })).toBeVisible();
    expect(within(bodyRows()[0]).getByText('Maria Garcia')).toBeVisible();
  });

  it('filters events by IP address', async () => {
    const user = await renderPanel(['org:sys_logs:read']);

    await user.type(await screen.findByRole('searchbox', { name: 'Search logs' }), '192.0.2.146');

    await expect.poll(() => bodyRows().length).toBe(6);
    for (const row of bodyRows()) {
      expect(within(row).getByText('Jordan Smith')).toBeVisible();
    }
  });

  it('says when a search matches nothing', async () => {
    const user = await renderPanel(['org:sys_logs:read']);

    await user.type(await screen.findByRole('searchbox', { name: 'Search logs' }), 'nobody');

    expect(await screen.findByText('No logs found')).toBeVisible();
  });

  it('opens the details of an event from anywhere in its row', async () => {
    const user = await renderPanel(['org:sys_logs:read']);
    const row = await screen.findByRole('row', { name: /^Member role changed/ });
    expect(row).toHaveAttribute('data-actionable');

    const dialog = await openDialog(user, within(row).getByText('Maria Garcia'), { name: 'Member role changed' });

    expect(within(dialog).getByText('organization_membership.updated')).toBeVisible();
    expect(within(dialog).getByText('Maria Garcia (maria@acme.com)')).toBeVisible();
    expect(within(dialog).getByText('tom@acme.com → Admin')).toBeVisible();
    expect(within(dialog).getByText('San Francisco, US')).toBeVisible();
  });

  it('opens the details of an event with Enter and returns focus to its row on close', async () => {
    const user = await renderPanel(['org:sys_logs:read']);
    const row = await screen.findByRole('row', { name: /^Member role changed/ });

    act(() => row.focus());
    await user.keyboard('{Enter}');
    const dialog = await screen.findByRole('dialog', { name: 'Member role changed' });
    expect(within(dialog).getByText('organization_membership.updated')).toBeVisible();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(row).toHaveFocus();
  });

  it('tells a member without permission that they cannot view logs', async () => {
    await renderPanel([]);

    expect(await screen.findByText('You don’t have access to logs')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Logs' })).toBeVisible();
    expect(screen.queryByRole('grid', { name: 'Logs' })).toBeNull();
  });
});

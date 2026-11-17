import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { serveFapi } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEmailAddress,
  fapiInvitation,
  fapiMembership,
  fapiOrganization,
  fapiSession,
  fapiSuggestion,
  fapiUser,
} from '../../../__tests__/feature/fapi';
import { openMenu } from '../../../__tests__/feature/menu';
import { renderWithClerk } from '../../../__tests__/feature/render';
import type { UserButtonProps } from '../../switcher/switcher';
import { UserButton } from '../user-button';

const acme = fapiOrganization({ id: 'org_1', name: 'Acme' });
const other = fapiOrganization({ id: 'org_9', name: 'Other' });
const memberships = [fapiMembership(acme), fapiMembership(other)];

const alice = fapiUser({
  id: 'user_1',
  first_name: 'Alice',
  last_name: 'Smith',
  email_addresses: [fapiEmailAddress({ id: 'idn_alice', email_address: 'alice@example.com' })],
  organization_memberships: memberships,
});

const bob = fapiUser({
  id: 'user_2',
  first_name: 'Bob',
  last_name: 'Jones',
  email_addresses: [fapiEmailAddress({ id: 'idn_bob', email_address: 'bob@example.com' })],
});

async function renderUserButton(props: UserButtonProps = {}) {
  serveFapi({
    client: fapiClient([
      fapiSession({ id: 'sess_1', user: alice, last_active_organization_id: 'org_1' }),
      fapiSession({ id: 'sess_2', user: bob }),
    ]),
    memberships,
    invitations: [fapiInvitation('inv_1', fapiOrganization({ id: 'org_3', name: 'Gamma' }))],
    suggestions: [fapiSuggestion('sug_1', fapiOrganization({ id: 'org_2', name: 'Beta' }))],
  });
  await renderWithClerk(<UserButton {...props} />);
  const trigger = screen.getByRole('button', { name: 'Open account menu for Alice Smith' });
  const user = userEvent.setup();
  await user.click(trigger);
  return { trigger, user, popup: await screen.findByRole('dialog', { name: 'Account' }) };
}

describe('UserButton', () => {
  it('lists accounts and no organizations, even when one is active', async () => {
    const { trigger, user, popup } = await renderUserButton();

    expect(within(trigger).queryByText('Acme')).toBeNull();
    for (const name of ['Acme', 'Other', 'Beta', 'Gamma', 'Personal account']) {
      expect(within(popup).queryByText(name)).toBeNull();
    }
    expect(within(popup).queryByRole('button', { name: 'Invite members' })).toBeNull();

    const menu = await openMenu(user, within(popup).getByRole('button', { name: 'Switch account' }));
    expect(within(menu).getByRole('menuitem', { name: 'bob@example.com' })).toBeInTheDocument();
  });

  it('stays an account menu when handed a mode it does not take', async () => {
    const props: UserButtonProps = {};
    Object.assign(props, { mode: 'combined' });
    const { trigger, popup } = await renderUserButton(props);

    expect(trigger).toHaveAttribute('data-variant', 'condensed');
    expect(within(trigger).queryByText('Acme')).toBeNull();
    expect(within(popup).queryByRole('button', { name: 'Invite members' })).toBeNull();
  });
});

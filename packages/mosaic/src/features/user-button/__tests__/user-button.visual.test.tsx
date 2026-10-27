import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

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
import { renderWithClerk } from '../../../__tests__/feature/render';
import { UserButton } from '../user-button';

describe('UserButton visual state', () => {
  it('shows the combined account and organization menu open', async () => {
    const acme = fapiOrganization({ id: 'org_acme', name: 'Acme Studio', members_count: 12 });
    const orbit = fapiOrganization({ id: 'org_orbit', name: 'Orbit Labs', members_count: 8 });
    const invitation = fapiOrganization({ id: 'org_north', name: 'Northstar Design' });
    const suggestion = fapiOrganization({ id: 'org_field', name: 'Fieldwork' });
    const memberships = [fapiMembership(acme, { permissions: ['org:sys_memberships:manage'] }), fapiMembership(orbit)];
    const user = fapiUser({
      id: 'user_alice',
      first_name: 'Alice',
      last_name: 'Rivera',
      username: 'alice',
      email_addresses: [fapiEmailAddress({ id: 'email_alice', email_address: 'alice@example.com' })],
      organization_memberships: memberships,
    });
    const other = fapiUser({
      id: 'user_bob',
      first_name: 'Bob',
      last_name: 'Morgan',
      email_addresses: [fapiEmailAddress({ id: 'email_bob', email_address: 'bob@example.com' })],
    });
    serveFapi({
      client: fapiClient([
        fapiSession({ id: 'session_alice', user, last_active_organization_id: acme.id }),
        fapiSession({ id: 'session_bob', user: other }),
      ]),
      memberships,
      invitations: [fapiInvitation('invitation_north', invitation)],
      suggestions: [fapiSuggestion('suggestion_field', suggestion)],
    });
    await renderWithClerk(<UserButton mode='combined' />);
    await userEvent.setup().click(screen.getByRole('button', { name: /Open account menu/ }));
    await screen.findByRole('button', { name: 'Orbit Labs' });
    await screen.findByRole('button', { name: 'Accept' });
    await screen.findByText('Fieldwork');
    await waitFor(() => expect(screen.queryByText('Loading organizations…')).toBeNull());
    await document.fonts.ready;

    await expect(page).toMatchScreenshot('user-button-combined-open');
  });
});

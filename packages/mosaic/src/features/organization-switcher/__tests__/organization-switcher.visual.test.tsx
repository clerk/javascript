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
import { OrganizationSwitcher } from '../organization-switcher';

describe('OrganizationSwitcher visual state', () => {
  it('shows the organization menu open', async () => {
    const acme = fapiOrganization({ id: 'org_acme', name: 'Acme Studio', members_count: 12 });
    const orbit = fapiOrganization({ id: 'org_orbit', name: 'Orbit Labs', members_count: 8 });
    const invitation = fapiOrganization({ id: 'org_north', name: 'Northstar Design' });
    const suggestion = fapiOrganization({ id: 'org_field', name: 'Fieldwork' });
    const memberships = [fapiMembership(acme, { permissions: ['org:sys_memberships:manage'] }), fapiMembership(orbit)];
    const user = fapiUser({
      id: 'user_alice',
      first_name: 'Alice',
      last_name: 'Rivera',
      email_addresses: [fapiEmailAddress({ id: 'email_alice', email_address: 'alice@example.com' })],
      organization_memberships: memberships,
    });
    serveFapi({
      client: fapiClient([fapiSession({ id: 'session_alice', user, last_active_organization_id: acme.id })]),
      memberships,
      invitations: [fapiInvitation('invitation_north', invitation)],
      suggestions: [fapiSuggestion('suggestion_field', suggestion)],
    });
    await renderWithClerk(<OrganizationSwitcher />);
    await userEvent.setup().click(screen.getByRole('button', { name: /Open organization menu/ }));
    await screen.findByRole('button', { name: 'Orbit Labs' });
    await screen.findByRole('button', { name: 'Accept' });
    await screen.findByText('Fieldwork');
    await waitFor(() => expect(screen.queryByText('Loading organizations…')).toBeNull());
    await document.fonts.ready;

    await expect(page).toMatchScreenshot('organization-switcher-open');
  });
});

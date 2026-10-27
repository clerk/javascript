import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

type FapiSession = ReturnType<typeof fapiSession>;

export function serveSwitcherFixture({ otherSessions = [] }: { otherSessions?: FapiSession[] } = {}) {
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
  serveFapi({
    client: fapiClient([
      fapiSession({ id: 'session_alice', user, last_active_organization_id: acme.id }),
      ...otherSessions,
    ]),
    memberships,
    invitations: [fapiInvitation('invitation_north', invitation)],
    suggestions: [fapiSuggestion('suggestion_field', suggestion)],
  });
}

export async function openSwitcher(trigger: RegExp) {
  await userEvent.setup().click(screen.getByRole('button', { name: trigger }));
  await screen.findByRole('button', { name: 'Orbit Labs' });
  await screen.findByRole('button', { name: 'Accept' });
  await screen.findByText('Fieldwork');
  await waitFor(() => {
    if (screen.queryByText('Loading organizations…')) {
      throw new Error('Organizations are still loading');
    }
  });
  await document.fonts.ready;
  return page.elementLocator(screen.getByRole('dialog'));
}

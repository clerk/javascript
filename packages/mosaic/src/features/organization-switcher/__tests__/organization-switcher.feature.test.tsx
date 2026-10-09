import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { type FakeFapiSeed, holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEmailAddress,
  fapiEnvironment,
  fapiInvitation,
  fapiMembership,
  fapiOrganization,
  fapiSession,
  fapiSuggestion,
  fapiUser,
} from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import type { OrganizationSwitcherProps } from '../organization-switcher';
import { OrganizationSwitcher } from '../organization-switcher';

afterEach(() => {
  vi.restoreAllMocks();
});

const acme = fapiOrganization({ id: 'org_1', name: 'Acme', members_count: 3 });
const other = fapiOrganization({ id: 'org_9', name: 'Other' });
const beta = fapiOrganization({ id: 'org_2', name: 'Beta' });
const gamma = fapiOrganization({ id: 'org_3', name: 'Gamma' });

const aliceMemberships = [fapiMembership(acme, { permissions: ['org:sys_memberships:manage'] }), fapiMembership(other)];

const alice = fapiUser({
  id: 'user_1',
  first_name: 'Alice',
  last_name: 'Smith',
  username: 'alice',
  email_addresses: [fapiEmailAddress({ id: 'idn_alice', email_address: 'alice@example.com' })],
  organization_memberships: aliceMemberships,
});

const bob = fapiUser({
  id: 'user_2',
  first_name: 'Bob',
  last_name: 'Jones',
  email_addresses: [fapiEmailAddress({ id: 'idn_bob', email_address: 'bob@example.com' })],
});

const aliceSession = fapiSession({ id: 'sess_1', user: alice, last_active_organization_id: 'org_1' });
const bobSession = fapiSession({ id: 'sess_2', user: bob });
const personalSession = fapiSession({ id: 'sess_1', user: alice });

function signedIn(overrides: FakeFapiSeed = {}): FakeFapiSeed {
  return {
    client: fapiClient([aliceSession, bobSession]),
    memberships: aliceMemberships,
    invitations: [fapiInvitation('inv_1', gamma)],
    suggestions: [fapiSuggestion('sug_1', beta)],
    ...overrides,
  };
}

const noOffers = (overrides = {}) => signedIn({ invitations: [], suggestions: [], ...overrides });

function tree(props: OrganizationSwitcherProps = {}) {
  return (
    <div data-testid='host'>
      <OrganizationSwitcher {...props} />
    </div>
  );
}

function renderSwitcher(props: OrganizationSwitcherProps = {}, seed: FakeFapiSeed = signedIn()) {
  const fapi = serveFapi(seed);
  return renderWithClerk(tree(props)).then(view => ({ ...view, fapi }));
}

const host = () => screen.getByTestId('host');
const trigger = () => screen.getByRole('button', { name: /Open organization menu/ });
const popup = () => screen.queryByRole('dialog', { name: 'Organizations' });

function requiredPopup() {
  const surface = popup();
  if (!surface) {
    throw new Error('expected the popover to be open');
  }
  return surface;
}

async function open() {
  const user = userEvent.setup();
  await user.click(trigger());
  expect(popup()).toBeInTheDocument();
  return user;
}

async function openWithList() {
  const user = await open();
  await waitFor(() => expect(screen.queryByText('Loading organizations…')).toBeNull());
  return user;
}

const reading = (...names: string[]) =>
  within(requiredPopup())
    .queryAllByText(new RegExp(`^(${names.join('|')})$`))
    .filter(node => !node.closest('.cl-organization-switcher-header'))
    .map(node => node.textContent);

describe('OrganizationSwitcher', () => {
  it('renders nothing while Clerk is still loading', async () => {
    serveFapi(signedIn());
    const client = holdRequests('get', '/v1/client');
    const rendering = renderWithClerk(tree());

    await waitFor(() => expect(client.requests).toHaveLength(1));
    expect(host()).toBeEmptyDOMElement();

    client.release();
    await rendering;
    expect(trigger()).toBeInTheDocument();
  });

  it('renders nothing when nobody is signed in', async () => {
    await renderSwitcher({}, signedIn({ client: fapiClient() }));

    expect(host()).toBeEmptyDOMElement();
  });

  it('renders nothing when the instance has organizations disabled', async () => {
    await renderSwitcher({}, signedIn({ environment: fapiEnvironment({ organization_settings: { enabled: false } }) }));

    expect(host()).toBeEmptyDOMElement();
  });

  it('heads the surface with the active organization and what can be done to it', async () => {
    await renderSwitcher();
    await open();

    expect(within(requiredPopup()).getByText('Acme')).toBeInTheDocument();
    expect(within(requiredPopup()).getByText('3 members')).toBeInTheDocument();
    expect(within(requiredPopup()).getByRole('button', { name: 'Invite' })).toBeInTheDocument();
    expect(within(requiredPopup()).getByRole('button', { name: 'Settings' })).toBeInTheDocument();
  });

  it('falls back to the account where no organization is active', async () => {
    await renderSwitcher({}, signedIn({ client: fapiClient([personalSession]) }));
    await open();

    expect(within(requiredPopup()).getByText('Alice Smith')).toBeInTheDocument();
    expect(within(requiredPopup()).getByRole('button', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Invite' })).toBeNull();
  });

  it('names no organization selected where personal is hidden and none is active', async () => {
    await renderSwitcher({ hidePersonal: true }, signedIn({ client: fapiClient([personalSession]) }));

    expect(trigger()).toHaveAccessibleName(/No organization selected/);
    await open();

    expect(within(requiredPopup()).getByText('No organization selected')).toBeInTheDocument();
    expect(within(requiredPopup()).queryByText('Alice Smith')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Manage organization' })).toBeNull();
  });

  it('carries no account rows, and trails the organizations with create-organization', async () => {
    await renderSwitcher({}, noOffers());
    await openWithList();

    expect(reading('Personal account', 'Acme', 'Other', 'Create organization')).toEqual([
      'Personal account',
      'Acme',
      'Other',
      'Create organization',
    ]);
    for (const name of ['Switch account', 'Add account', 'Sign out', 'Sign out of all accounts']) {
      expect(screen.queryByRole('button', { name })).toBeNull();
    }
  });

  it('makes the selected organization active and closes', async () => {
    await renderSwitcher();
    const user = await open();

    await user.click(await screen.findByRole('button', { name: 'Other' }));
    await waitFor(() => expect(popup()).toBeNull());

    expect(within(trigger()).getByText('Other')).toBeInTheDocument();
  });

  it('carries custom rows at the foot of the popup, in the order given', async () => {
    const terms = { id: 'terms', label: 'Terms of service', href: 'https://example.com/terms' };
    const support = { id: 'support', label: 'Support', onClick: vi.fn() };
    await renderSwitcher({ customMenuItems: [terms, support], menuItemOrder: ['support', 'terms'] });
    await open();

    expect(reading('Terms of service', 'Support')).toEqual(['Support', 'Terms of service']);
  });

  it('themes its parts through organization-switcher slots', async () => {
    await renderSwitcher({}, noOffers());
    await openWithList();

    for (const slot of ['trigger', 'popover', 'header', 'item', 'group', 'separator']) {
      expect(document.querySelector(`.cl-organization-switcher-${slot}`)).not.toBeNull();
    }
    expect(document.querySelector('[class*="cl-user-button"]')).toBeNull();
  });

  describe('the trigger', () => {
    it('names the active organization beside the avatar', async () => {
      await renderSwitcher();

      expect(trigger()).toHaveAccessibleName('Open organization menu for Acme');
      expect(within(trigger()).getByText('Acme')).toBeInTheDocument();
      expect(popup()).toBeNull();
    });

    it('renders the avatar alone when the label is off', async () => {
      await renderSwitcher({ renderTriggerLabel: false });

      expect(trigger()).toHaveAccessibleName('Open organization menu for Acme');
      expect(within(trigger()).queryByText('Acme')).toBeNull();
    });

    it('names the active organization before its membership list has loaded', async () => {
      serveFapi(signedIn());
      const memberships = holdRequests('get', '/v1/me/organization_memberships');
      await renderWithClerk(tree());

      expect(within(trigger()).getByText('Acme')).toBeInTheDocument();
      await userEvent.setup().click(trigger());
      expect(within(requiredPopup()).getByRole('button', { name: 'Invite' })).toBeInTheDocument();

      memberships.release();
      await waitFor(() => expect(screen.queryByText('Loading organizations…')).toBeNull());
    });
  });
});

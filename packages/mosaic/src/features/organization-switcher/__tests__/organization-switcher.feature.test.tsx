import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, onTestFinished, vi } from 'vitest';
import { page } from 'vitest/browser';

import { openDialog } from '../../../__tests__/feature/dialog';
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

beforeAll(async () => {
  await import('../../organization-profile/organization-profile.modal-content');
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

  it('heads the surface with the active organization, and manages it from the rows beneath', async () => {
    const { clerk } = await renderSwitcher({}, noOffers());
    const openOrganizationProfile = vi.spyOn(clerk, 'openOrganizationProfile').mockImplementation(() => {});
    const user = await openWithList();

    const header = requiredPopup().querySelector('.cl-organization-switcher-header') ?? requiredPopup();
    expect(within(header).getByText('Acme')).toBeInTheDocument();
    expect(within(header).getByText('3 members')).toBeInTheDocument();
    expect(within(header).queryAllByRole('button')).toEqual([]);
    expect(reading('Add organization', 'Settings', 'Invite members')).toEqual([
      'Add organization',
      'Settings',
      'Invite members',
    ]);

    await user.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.queryByRole('menu')).toBeNull();
    expect(openOrganizationProfile).toHaveBeenCalled();
  });

  it('falls back to the account, with nothing to manage, where no organization is active', async () => {
    await renderSwitcher({}, signedIn({ client: fapiClient([personalSession]) }));
    await open();

    expect(within(requiredPopup()).getByText('Alice Smith')).toBeInTheDocument();
    expect(within(requiredPopup()).queryByRole('button', { name: 'Settings' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Invite members' })).toBeNull();
  });

  it('names no organization selected where personal is hidden and none is active', async () => {
    await renderSwitcher({ hidePersonal: true }, signedIn({ client: fapiClient([personalSession]) }));

    expect(trigger()).toHaveAccessibleName(/No organization selected/);
    await open();

    expect(within(requiredPopup()).getByText('No organization selected')).toBeInTheDocument();
    expect(within(requiredPopup()).queryByText('Alice Smith')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Settings' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Invite members' })).toBeNull();
  });

  it('carries no account rows, and trails the organizations with create-organization', async () => {
    await renderSwitcher({}, noOffers());
    await openWithList();

    expect(reading('Personal account', 'Acme', 'Other', 'Add organization')).toEqual([
      'Personal account',
      'Acme',
      'Other',
      'Add organization',
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

  describe('landing after an action', () => {
    it('lands on afterSelectPersonalUrl, filled from the account, after switching to the personal account', async () => {
      const { navigate } = await renderSwitcher({ afterSelectPersonalUrl: '/users/:id' }, noOffers());
      const user = await openWithList();

      await user.click(screen.getByRole('button', { name: 'Personal account' }));

      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/users/user_1'));
    });

    it('lands where an afterSelectOrganizationUrl function points for the selected organization', async () => {
      const { navigate } = await renderSwitcher(
        { afterSelectOrganizationUrl: organization => `/orgs/${organization.name}` },
        noOffers(),
      );
      const user = await openWithList();

      await user.click(screen.getByRole('button', { name: 'Other' }));

      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/orgs/Other'));
    });

    it('tells the organization profile where to land after leaving', async () => {
      const { clerk } = await renderSwitcher({ afterLeaveOrganizationUrl: '/left' }, noOffers());
      const openOrganizationProfile = vi.spyOn(clerk, 'openOrganizationProfile').mockImplementation(() => {});
      const user = await openWithList();

      await user.click(screen.getByRole('button', { name: 'Settings' }));

      expect(openOrganizationProfile).toHaveBeenCalledWith(
        expect.objectContaining({ afterLeaveOrganizationUrl: '/left' }),
      );
    });

    it('tells create-organization where to land and whether to skip inviting members', async () => {
      const { clerk } = await renderSwitcher(
        { afterCreateOrganizationUrl: '/created', skipInvitationScreen: true },
        noOffers(),
      );
      const openCreateOrganization = vi.spyOn(clerk, 'openCreateOrganization').mockImplementation(() => {});
      const user = await openWithList();

      await user.click(screen.getByRole('button', { name: 'Add organization' }));

      expect(openCreateOrganization).toHaveBeenCalledWith(
        expect.objectContaining({ afterCreateOrganizationUrl: '/created', skipInvitationScreen: true }),
      );
    });
  });

  describe('an accepted invitation', () => {
    const fullFirstPage = Array.from({ length: 10 }, (_, i) =>
      fapiMembership(fapiOrganization({ id: `org_page_${i}`, name: `Page ${i}` })),
    );
    const enabledRow = async (name: string) => {
      const row = await screen.findByRole('button', { name });
      await waitFor(() => expect(row).not.toHaveAttribute('aria-disabled', 'true'));
      return row;
    };

    it('stays reachable, and follows afterSelectOrganizationUrl, before the memberships list its organization', async () => {
      serveFapi(
        noOffers({
          client: fapiClient([personalSession]),
          memberships: fullFirstPage,
          invitations: [fapiInvitation('inv_1', gamma)],
        }),
      );
      const nextPage = holdRequests('get', '/v1/me/organization_memberships', { offset: '10' });
      const { navigate } = await renderWithClerk(tree({ afterSelectOrganizationUrl: '/orgs/:id' }));
      const user = await openWithList();

      await user.click(screen.getByRole('button', { name: 'Accept' }));
      await user.click(await enabledRow('Gamma'));

      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/orgs/org_3'));
      nextPage.release();
    });

    it('lists once, as a membership, when the memberships list its organization', async () => {
      await renderSwitcher({}, noOffers({ invitations: [fapiInvitation('inv_1', gamma)] }));
      const user = await openWithList();

      await user.click(screen.getByRole('button', { name: 'Accept' }));
      await enabledRow('Gamma');

      expect(reading('Gamma')).toEqual(['Gamma']);
    });
  });

  it('carries custom rows beside Settings, in the order given', async () => {
    const terms = { id: 'terms', label: 'Terms of service', href: 'https://example.com/terms' };
    const support = { id: 'support', label: 'Support', onClick: vi.fn() };
    await renderSwitcher({ customMenuItems: [terms, support], menuItemOrder: ['support', 'terms', 'settings'] });
    await open();

    expect(reading('Settings', 'Terms of service', 'Support')).toEqual(['Support', 'Terms of service', 'Settings']);
  });

  it('themes its parts through organization-switcher slots', async () => {
    await renderSwitcher({}, noOffers());
    await openWithList();

    for (const slot of ['trigger', 'trigger-label', 'popover', 'header', 'item', 'group', 'separator']) {
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
      await renderSwitcher({ showTriggerLabel: false });

      expect(trigger()).toHaveAccessibleName('Open organization menu for Acme');
      expect(within(trigger()).queryByText('Acme')).toBeNull();
    });

    it('names the active organization before its membership list has loaded', async () => {
      serveFapi(signedIn());
      const memberships = holdRequests('get', '/v1/me/organization_memberships');
      await renderWithClerk(tree());

      expect(within(trigger()).getByText('Acme')).toBeInTheDocument();
      await userEvent.setup().click(trigger());
      expect(within(requiredPopup()).getByRole('button', { name: 'Invite members' })).toBeInTheDocument();

      memberships.release();
      await waitFor(() => expect(screen.queryByText('Loading organizations…')).toBeNull());
    });
  });
});

describe('OrganizationSwitcher custom trigger badges', () => {
  it.each([
    { seed: signedIn(), badge: 'organization:org_1', name: 'Acme' },
    { seed: signedIn({ client: fapiClient([personalSession]) }), badge: 'user:user_1', name: 'Alice Smith' },
  ])('shows a badge for the displayed identity as $badge', async ({ seed, badge, name }) => {
    await renderSwitcher(
      { triggerBadge: ({ kind, id }) => Promise.resolve({ id: 'pro', label: `${kind}:${id}` }) },
      seed,
    );

    await waitFor(() => expect(within(trigger()).getByText(badge)).toBeInTheDocument());
    expect(within(trigger()).getByText(badge).closest('.cl-badge')).toHaveAttribute('data-badge-id', 'pro');
    expect(within(trigger()).getByText(name)).toBeInTheDocument();
  });

  it('does not request a badge when no organization or personal account is displayed', async () => {
    const triggerBadge = vi.fn(() => Promise.resolve({ id: 'custom', label: 'Custom plan' }));
    await renderSwitcher({ hidePersonal: true, triggerBadge }, signedIn({ client: fapiClient([personalSession]) }));

    expect(trigger()).toHaveTextContent('No organization selected');
    expect(triggerBadge).not.toHaveBeenCalled();
  });

  it('hides the badge for null and keeps the organization name', async () => {
    const triggerBadge = vi.fn(({ id }: { id: string }) =>
      Promise.resolve(id === 'org_1' ? { id: 'pro', label: 'Pro plan' } : null),
    );
    const { clerk } = await renderSwitcher({ triggerBadge });
    await waitFor(() => expect(within(trigger()).getByText('Pro plan')).toBeInTheDocument());

    await act(() => clerk.setActive({ organization: 'org_9' }));
    await waitFor(() => expect(triggerBadge).toHaveBeenCalledWith({ kind: 'organization', id: 'org_9' }));
    expect(trigger()).not.toHaveTextContent('Pro plan');
    expect(within(trigger()).getByText('Other')).toBeInTheDocument();
    expect(trigger()).toHaveAccessibleName('Open organization menu for Other');
  });
});

describe('OrganizationSwitcher with experimental.newProfiles', () => {
  async function renderWithNewProfiles(props: OrganizationSwitcherProps = {}) {
    await page.viewport(1280, 800);
    onTestFinished(() => page.viewport(414, 896));
    serveFapi(noOffers());
    return renderWithClerk(tree(props), undefined, undefined, { newProfiles: true });
  }

  it('opens the OrganizationProfile, without the account pages, from Settings', async () => {
    const { clerk } = await renderWithNewProfiles();
    const openOrganizationProfile = vi.spyOn(clerk, 'openOrganizationProfile');
    const user = await openWithList();

    await user.click(screen.getByRole('button', { name: 'Settings' }));

    expect(await screen.findByRole('tab', { name: 'General' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('tab', { name: 'Account' })).toBeNull();
    expect(openOrganizationProfile).not.toHaveBeenCalled();
  });

  it('lands on afterLeaveOrganizationUrl after leaving from the opened profile', async () => {
    const { navigate } = await renderWithNewProfiles({ afterLeaveOrganizationUrl: '/left' });
    const user = await openWithList();

    await user.click(screen.getByRole('button', { name: 'Settings' }));
    const dialog = await openDialog(user, await screen.findByRole('button', { name: 'Leave organization' }), {
      role: 'alertdialog',
    });
    await user.type(within(dialog).getByRole('textbox'), 'Acme');
    await user.click(within(dialog).getByRole('button', { name: 'Leave organization' }));

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/left'));
  });
});

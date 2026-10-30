import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, onTestFinished, vi } from 'vitest';
import { page } from 'vitest/browser';

import { type FakeFapiSeed, holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
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
import { PortalProvider } from '../../../primitives/portal';
import type { MosaicProfile } from '../../profile-pages/use-mosaic-profile';
import { signedIn as withConnectedAccounts } from '../../user-profile/user-profile-connected-accounts-section/__tests__/user-profile-connected-accounts.fixtures';
import type { UserButtonProps } from '../user-button';
import { UserButton } from '../user-button';

beforeAll(async () => {
  await import('../../user-profile/user-profile.modal-content');
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

function signedIn(overrides: FakeFapiSeed = {}): FakeFapiSeed {
  return {
    client: fapiClient([aliceSession, bobSession]),
    memberships: aliceMemberships,
    invitations: [fapiInvitation('inv_1', gamma)],
    suggestions: [fapiSuggestion('sug_1', beta)],
    ...overrides,
  };
}

function tree(props: UserButtonProps = {}) {
  return (
    <div data-testid='host'>
      <UserButton {...props} />
    </div>
  );
}

type User = ReturnType<typeof userEvent.setup>;

const trigger = () => screen.getByRole('button', { name: /Open account menu/ });
const popup = () => screen.queryByRole('dialog', { name: 'Account' });

async function open() {
  const user = userEvent.setup();
  await user.click(trigger());
  expect(popup()).toBeInTheDocument();
  return user;
}

async function openSettings(user: User, label: string) {
  await openMenu(user, within(requiredPopup()).getByRole('button', { name: 'Settings' }));
  await user.click(screen.getByRole('menuitem', { name: label }));
}

function requiredPopup() {
  const surface = popup();
  if (!surface) {
    throw new Error('expected the popover to be open');
  }
  return surface;
}

const terms = { label: 'Terms', path: 'terms', content: <p>Terms body</p> };
describe('UserButton with experimental.newProfiles', () => {
  const newProfiles = { newProfiles: true };

  async function renderWithNewProfiles(
    props: UserButtonProps = {},
    seed: FakeFapiSeed = signedIn(),
    profile?: MosaicProfile,
  ) {
    await page.viewport(1280, 800);
    onTestFinished(() => page.viewport(414, 896));
    serveFapi(seed);
    return renderWithClerk(tree(props), undefined, undefined, newProfiles, profile);
  }

  const profileTabs = () => screen.getAllByRole('tab').map(tab => tab.textContent);

  it('opens the combined UserProfile straight from Settings, without a menu, and closes', async () => {
    const { clerk, navigate } = await renderWithNewProfiles();
    const openUserProfile = vi.spyOn(clerk, 'openUserProfile');
    const user = await open();

    await user.click(screen.getByRole('button', { name: 'Settings' }));

    expect(screen.queryByRole('menu')).toBeNull();
    expect(await screen.findByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
    expect(profileTabs()).toEqual(['Account', 'Security', 'General', 'Members']);
    expect(openUserProfile).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    await waitFor(() => expect(popup()).toBeNull());
  });

  it('opens the profile as a modal, so an OAuth connection returns to it', async () => {
    await renderWithNewProfiles({}, withConnectedAccounts([]));
    const request = holdRequests('post', '/v1/me/external_accounts');
    const user = await open();

    await user.click(screen.getByRole('button', { name: 'Settings' }));
    await user.click(await screen.findByRole('button', { name: 'Connect GitHub' }));
    await waitFor(() => expect(request.requests).toHaveLength(1));

    const body = new URLSearchParams(await request.requests[0]?.text());
    const params = new URL(body.get('redirect_url') || '').searchParams;
    expect(params.get('__clerk_mosaic_modal')).toBe('user-profile/account');
    expect(params.has('__clerk_modal_state')).toBe(false);
    request.fail();
  });

  it('opens the profile into the portal root the app provides', async () => {
    await page.viewport(1280, 800);
    onTestFinished(() => page.viewport(414, 896));
    const container = document.body.appendChild(document.createElement('div'));
    onTestFinished(() => container.remove());
    serveFapi(signedIn());
    await renderWithClerk(
      <PortalProvider container={container}>{tree()}</PortalProvider>,
      undefined,
      undefined,
      newProfiles,
    );
    const user = await open();

    await user.click(screen.getByRole('button', { name: 'Settings' }));

    expect(within(container).getByRole('tab', { name: 'Account' })).toBeInTheDocument();
  });

  it('renders custom pages in their order, and leaves out links', async () => {
    await renderWithNewProfiles({}, undefined, {
      userProfileProps: {
        customPages: [terms, { label: 'Docs', path: 'docs', href: 'https://example.com/docs' }],
        pageOrder: ['terms', 'account'],
      },
    });
    const user = await open();

    await user.click(screen.getByRole('button', { name: 'Settings' }));

    expect(await screen.findByRole('tab', { name: 'Terms' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Terms body')).toBeVisible();
    expect(profileTabs()).toEqual(['Terms', 'Account', 'Security', 'General', 'Members']);
  });

  it("lists the organization's own pages in order in the combined profile", async () => {
    await renderWithNewProfiles({}, undefined, {
      organizationProfileProps: { customPages: [terms], pageOrder: ['terms'] },
    });
    const user = await open();

    await user.click(screen.getByRole('button', { name: 'Settings' }));

    expect(await screen.findByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
    expect(profileTabs()).toEqual(['Account', 'Security', 'Terms', 'General', 'Members']);
  });

  it('still asks which to manage when the organization profile routes to a page', async () => {
    const { navigate } = await renderWithNewProfiles({}, undefined, { organizationProfileUrl: '/org' });
    const user = await open();

    await openSettings(user, 'Manage organization');

    expect(navigate).toHaveBeenCalledWith('/org');
  });

  it("leaves the organization's pages out of a separate profile", async () => {
    await renderWithNewProfiles({ combined: false }, undefined, { combined: false });
    const user = await open();

    await user.click(screen.getByRole('button', { name: 'Settings' }));

    expect(await screen.findByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
    expect(profileTabs()).toEqual(['Account', 'Security']);
  });
});

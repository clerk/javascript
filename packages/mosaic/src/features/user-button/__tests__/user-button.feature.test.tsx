import { UNSAFE_PortalProvider as PortalProvider } from '@clerk/shared/react';
import type { CustomPage, PhoneNumberJSON, UserJSON, Web3WalletJSON } from '@clerk/shared/types';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

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
import type { UserButtonProps } from '../user-button';
import { UserButton } from '../user-button';

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

function renderUserButton(props: UserButtonProps = {}, seed: FakeFapiSeed = signedIn()) {
  const fapi = serveFapi(seed);
  return renderWithClerk(tree(props)).then(view => ({ ...view, fapi }));
}

type User = ReturnType<typeof userEvent.setup>;

const host = () => screen.getByTestId('host');
const trigger = () => screen.getByRole('button', { name: /Open account menu/ });
const popup = () => screen.queryByRole('dialog', { name: 'Account' });
const waiting = () =>
  Array.from(popup()?.querySelectorAll('button') ?? []).some(button => button.getAttribute('aria-disabled') === 'true');
const accountMenu = () => screen.getByRole('button', { name: 'Actions for alice' });

async function open() {
  const user = userEvent.setup();
  await user.click(trigger());
  expect(popup()).toBeInTheDocument();
  return user;
}

async function accountAction(user: User, label: string) {
  await user.click(accountMenu());
  await user.click(await screen.findByRole('menuitem', { name: label }));
}

async function openAccounts(user: User) {
  await user.click(screen.getByRole('button', { name: 'Switch account' }));
  return screen.findByRole('menu');
}

function requiredPopup() {
  const surface = popup();
  if (!surface) {
    throw new Error('expected the popover to be open');
  }
  return surface;
}

const reading = (...names: string[]) =>
  within(requiredPopup())
    .queryAllByText(new RegExp(`^(${names.join('|')})$`))
    .map(node => node.textContent);

const current = () =>
  Array.from(requiredPopup().querySelectorAll('[aria-current="true"]')).map(node => node.textContent);

const alone = () => signedIn({ client: fapiClient([aliceSession]) });

const noOffers = (overrides = {}) => signedIn({ invitations: [], suggestions: [], ...overrides });

const personalSession = fapiSession({ id: 'sess_1', user: alice });

async function openWithList() {
  const user = await open();
  await waitFor(() => expect(screen.queryByText('Loading organizations…')).toBeNull());
  return user;
}

describe('UserButton', () => {
  describe.each(['combined', 'organization', 'user'] as const)('in %s mode', mode => {
    it('renders nothing while Clerk is still loading', async () => {
      serveFapi(signedIn());
      const client = holdRequests('get', '/v1/client');
      const rendering = renderWithClerk(tree({ mode }));

      await waitFor(() => expect(client.requests).toHaveLength(1));
      expect(host()).toBeEmptyDOMElement();

      client.release();
      await rendering;
      expect(trigger()).toBeInTheDocument();
    });

    it('renders nothing when nobody is signed in', async () => {
      await renderUserButton({ mode }, signedIn({ client: fapiClient() }));

      expect(host()).toBeEmptyDOMElement();
    });

    it('leaves organizations out entirely when the instance has them disabled', async () => {
      await renderUserButton(
        { mode },
        signedIn({ environment: fapiEnvironment({ organization_settings: { enabled: false } }) }),
      );

      expect(screen.getByRole('button', { name: 'Open account menu for Alice Smith' })).toBeInTheDocument();
      const user = await open();

      for (const name of ['Acme', 'Other', 'Beta', 'Gamma', 'Personal account']) {
        expect(screen.queryByText(name)).toBeNull();
      }
      expect(screen.queryByRole('button', { name: 'Create organization' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Invite' })).toBeNull();

      expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
      const menu = await openAccounts(user);
      expect(within(menu).getByRole('menuitem', { name: 'bob@example.com' })).toBeInTheDocument();
    });
  });

  it('keeps the popover closed until the trigger is clicked', async () => {
    await renderUserButton();

    expect(trigger()).toBeInTheDocument();
    expect(popup()).toBeNull();
  });

  it('lists the organizations and the account when opened', async () => {
    await renderUserButton();
    await open();

    expect(await screen.findByRole('button', { name: 'Other' })).toBeInTheDocument();
    expect(accountMenu()).toBeInTheDocument();
  });

  describe('switching workspace', () => {
    it('makes the selected organization active and closes', async () => {
      const { navigate } = await renderUserButton();
      const user = await open();

      await user.click(await screen.findByRole('button', { name: 'Other' }));
      await waitFor(() => expect(popup()).toBeNull());

      await open();
      expect(await screen.findByRole('button', { name: 'Acme' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Other' })).toBeNull();
      expect(navigate).not.toHaveBeenCalled();
    });

    it('leaves the active organization for the personal workspace', async () => {
      await renderUserButton();
      const user = await open();

      await user.click(await screen.findByRole('button', { name: 'Personal account' }));
      await waitFor(() => expect(popup()).toBeNull());

      await open();
      expect(await screen.findByRole('button', { name: 'Acme' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Personal account' })).toBeNull();
    });

    it('drops the personal workspace where the app hides it', async () => {
      await renderUserButton({ hidePersonal: true });
      await open();

      expect(await screen.findByRole('button', { name: 'Other' })).toBeInTheDocument();
      expect(screen.queryByText('Personal account')).toBeNull();
    });

    it('names no organization selected when the instance forces one and none is active', async () => {
      await renderUserButton(
        {},
        signedIn({
          environment: fapiEnvironment({ organization_settings: { force_organization_selection: true } }),
          client: fapiClient([fapiSession({ id: 'sess_1', user: alice }), bobSession]),
        }),
      );

      expect(screen.getByRole('button', { name: /No organization selected/ })).toBeInTheDocument();
      await open();

      expect(within(requiredPopup()).getByText('No organization selected')).toBeInTheDocument();
      expect(screen.queryByText('Personal account')).toBeNull();
      expect(screen.getByRole('button', { name: 'Manage account' })).toBeInTheDocument();
    });

    it('lists no organizations on an account-only surface', async () => {
      await renderUserButton({ mode: 'user' });
      const user = await open();

      const menu = await openAccounts(user);
      expect(within(menu).getByRole('menuitem', { name: 'bob@example.com' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Other' })).toBeNull();
    });
  });

  describe('accounts', () => {
    it('switches to another signed-in account and stays open', async () => {
      await renderUserButton();
      const user = await open();

      const menu = await openAccounts(user);
      await user.click(within(menu).getByRole('menuitem', { name: 'bob@example.com' }));

      await waitFor(() => expect(trigger()).toHaveAccessibleName('Open account menu for Bob Jones'));
      await waitFor(() => expect(waiting()).toBe(false));
      expect(popup()).toBeInTheDocument();
    });

    it('signs out of the active account alone while another stays signed in', async () => {
      const { fapi, navigate } = await renderUserButton();
      const user = await open();

      await accountAction(user, 'Sign out');

      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/after-single-sign-out'));
      expect(fapi.client.sessions.map(session => session.id)).toEqual(['sess_2']);
    });

    it('does not reopen after signing out of the last account and signing back in', async () => {
      const { clerk, fapi, navigate } = await renderUserButton({}, signedIn({ client: fapiClient([aliceSession]) }));
      const user = await open();

      await accountAction(user, 'Sign out');
      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/'));
      await waitFor(() => expect(host()).toBeEmptyDOMElement());

      fapi.client = fapiClient([aliceSession]);
      await act(async () => {
        await clerk.client?.reload();
        await clerk.setActive({ session: 'sess_1' });
      });

      expect(trigger()).toBeInTheDocument();
      expect(popup()).toBeNull();
    });

    it('does not reopen after signing out of all accounts and signing back in', async () => {
      const { clerk, fapi, navigate } = await renderUserButton();
      const user = await open();

      await user.click(screen.getByRole('button', { name: 'Sign out of all accounts' }));
      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/'));
      await waitFor(() => expect(host()).toBeEmptyDOMElement());

      fapi.client = fapiClient([aliceSession]);
      await act(async () => {
        await clerk.client?.reload();
        await clerk.setActive({ session: 'sess_1' });
      });

      expect(trigger()).toBeInTheDocument();
      expect(popup()).toBeNull();
    });

    it('drops add-account and sign-out-of-all in single-session mode', async () => {
      await renderUserButton(
        {},
        signedIn({
          environment: fapiEnvironment({ auth_config: { single_session_mode: true } }),
          client: fapiClient([aliceSession]),
        }),
      );
      const user = await open();

      expect(screen.queryByRole('button', { name: 'Sign out of all accounts' })).toBeNull();
      expect(screen.queryByLabelText('Account actions')).toBeNull();
      await user.click(accountMenu());
      expect(await screen.findByRole('menuitem', { name: 'Manage account' })).toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: 'Add account' })).toBeNull();
    });
  });

  describe('invitations and suggestions', () => {
    it('accepts an invitation and stays open', async () => {
      await renderUserButton();
      const user = await open();

      await user.click(await screen.findByRole('button', { name: 'Accept' }));

      await waitFor(() => expect(screen.queryByRole('button', { name: 'Accept' })).toBeNull());
      await waitFor(() => expect(waiting()).toBe(false));
      expect(popup()).toBeInTheDocument();
    });

    it('stays busy until the invitations have reloaded', async () => {
      await renderUserButton();
      const user = await open();
      await screen.findByRole('button', { name: 'Accept' });
      const reload = holdRequests('get', '/v1/me/organization_invitations');

      await user.click(screen.getByRole('button', { name: 'Accept' }));
      await waitFor(() => expect(reload.requests).toHaveLength(1));

      await new Promise(resolve => setTimeout(resolve, 450));
      expect(waiting()).toBe(true);

      reload.release();
      await waitFor(() => expect(waiting()).toBe(false));
      expect(popup()).toBeInTheDocument();
    });

    it('joins a suggested organization and stays open', async () => {
      await renderUserButton();
      const user = await open();

      await user.click(await screen.findByRole('button', { name: 'Join' }));

      await waitFor(() => expect(screen.queryByRole('button', { name: 'Join' })).toBeNull());
      await waitFor(() => expect(waiting()).toBe(false));
      expect(popup()).toBeInTheDocument();
    });

    it('spins inside the join button while the suggestion is joined', async () => {
      await renderUserButton();
      const user = await open();
      await screen.findByRole('button', { name: 'Join' });
      const join = holdRequests('post', '/v1/me/organization_suggestions/:id/accept');

      await user.click(screen.getByRole('button', { name: 'Join' }));

      const button = screen.getByRole('button', { name: 'Join' });
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(within(button).getByRole('progressbar')).toBeInTheDocument();

      join.release();
      await waitFor(() => expect(waiting()).toBe(false));
      expect(popup()).toBeInTheDocument();
    });
  });

  describe('handing off', () => {
    it('opens the UserProfile modal and closes when managing the account', async () => {
      const { clerk, navigate } = await renderUserButton();
      const openUserProfile = vi.spyOn(clerk, 'openUserProfile').mockImplementation(() => {});
      const user = await open();

      await accountAction(user, 'Manage account');

      expect(openUserProfile).toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
      await waitFor(() => expect(popup()).toBeNull());
    });

    it('hands the opened profile the portal root the app provides', async () => {
      const container = document.createElement('div');
      serveFapi(signedIn());
      const { clerk } = await renderWithClerk(<PortalProvider getContainer={() => container}>{tree()}</PortalProvider>);
      const openUserProfile = vi.spyOn(clerk, 'openUserProfile').mockImplementation(() => {});
      const user = await open();

      await accountAction(user, 'Manage account');

      expect(openUserProfile.mock.calls[0]?.[0]?.getContainer?.()).toBe(container);
    });

    it('runs a custom menu item and closes', async () => {
      const onClick = vi.fn();
      await renderUserButton({ customMenuItems: [{ id: 'terms', label: 'Terms of service', onClick }] });
      const user = await open();

      await user.click(screen.getByRole('button', { name: 'Terms of service' }));

      expect(onClick).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(popup()).toBeNull());
    });

    it('renders a custom page into the element the opened profile hands back', async () => {
      const { clerk } = await renderUserButton({
        userProfileProps: { customPages: [{ label: 'Terms', path: 'terms', content: <p>Terms body</p> }] },
      });
      const openUserProfile = vi.spyOn(clerk, 'openUserProfile').mockImplementation(() => {});
      const user = await open();

      await accountAction(user, 'Manage account');
      await waitFor(() => expect(popup()).toBeNull());

      const customPages = openUserProfile.mock.calls[0]?.[0]?.customPages ?? [];
      expect(customPages).toHaveLength(1);
      expect(customPages[0]).toMatchObject({ label: 'Terms', url: 'terms' });

      const el = document.createElement('div');
      document.body.appendChild(el);
      act(() => {
        customPages[0]?.mount?.(el);
      });

      expect(within(el).getByText('Terms body')).toBeInTheDocument();
    });

    it('opens the profile with its pages in the order it was given', async () => {
      const { clerk } = await renderUserButton({
        userProfileProps: {
          customPages: [{ label: 'Terms', path: 'terms', content: <p>Terms body</p> }],
          pageOrder: ['account', 'terms'],
        },
      });
      const openUserProfile = vi.spyOn(clerk, 'openUserProfile').mockImplementation(() => {});
      const user = await open();

      await accountAction(user, 'Manage account');
      await waitFor(() => expect(popup()).toBeNull());

      const customPages = openUserProfile.mock.calls[0]?.[0]?.customPages ?? [];
      expect(customPages.map((page: CustomPage) => page.label)).toEqual(['account', 'Terms', 'security']);
    });

    it('opens the InviteMembers modal and closes', async () => {
      const { clerk, navigate } = await renderUserButton();
      const openInviteMembers = vi.spyOn(clerk, 'openInviteMembers').mockImplementation(() => {});
      const user = await open();

      await user.click(screen.getByRole('button', { name: 'Invite' }));

      expect(openInviteMembers).toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
      await waitFor(() => expect(popup()).toBeNull());
    });

    it('opens the CreateOrganization modal and closes', async () => {
      const { clerk, navigate } = await renderUserButton();
      const openCreateOrganization = vi.spyOn(clerk, 'openCreateOrganization').mockImplementation(() => {});
      const user = await open();

      await accountAction(user, 'Create organization');

      expect(openCreateOrganization).toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
      await waitFor(() => expect(popup()).toBeNull());
    });

    it('navigates to create an organization when a URL routes it', async () => {
      const { clerk, navigate } = await renderUserButton({ createOrganizationUrl: '/new-org' });
      const openCreateOrganization = vi.spyOn(clerk, 'openCreateOrganization').mockImplementation(() => {});
      const user = await open();

      await accountAction(user, 'Create organization');

      expect(navigate).toHaveBeenCalledWith('/new-org');
      expect(openCreateOrganization).not.toHaveBeenCalled();
      await waitFor(() => expect(popup()).toBeNull());
    });

    it('navigates to manage the account when a URL routes it', async () => {
      const { clerk, navigate } = await renderUserButton({ userProfileUrl: '/account' });
      const openUserProfile = vi.spyOn(clerk, 'openUserProfile').mockImplementation(() => {});
      const user = await open();

      await accountAction(user, 'Manage account');

      expect(navigate).toHaveBeenCalledWith('/account');
      expect(openUserProfile).not.toHaveBeenCalled();
    });

    it('navigates to manage the organization when a URL routes it', async () => {
      const { clerk, navigate } = await renderUserButton({ organizationProfileUrl: '/org' });
      const openOrganizationProfile = vi.spyOn(clerk, 'openOrganizationProfile').mockImplementation(() => {});
      const user = await open();

      await user.click(screen.getByRole('button', { name: 'Manage organization' }));

      expect(navigate).toHaveBeenCalledWith('/org');
      expect(openOrganizationProfile).not.toHaveBeenCalled();
    });

    it('sends add-account to the sign-in page', async () => {
      const { navigate } = await renderUserButton({ signInUrl: '/sign-in' });
      const user = await open();

      const menu = await openAccounts(user);
      await user.click(within(menu).getByRole('menuitem', { name: 'Add account' }));

      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/sign-in'));
    });

    it('sends a switched account with a pending task to finish it', async () => {
      const pendingBob = fapiSession({ ...bobSession, status: 'pending', tasks: [{ key: 'choose-organization' }] });
      const { navigate } = await renderUserButton(
        { signInUrl: '/sign-in' },
        signedIn({ client: fapiClient([aliceSession, pendingBob]) }),
      );
      const user = await open();

      const menu = await openAccounts(user);
      await user.click(within(menu).getByRole('menuitem', { name: 'bob@example.com' }));

      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/sign-in#/tasks/choose-organization'));
    });

    it('leaves create-organization out for a user who cannot create one', async () => {
      const restricted = fapiUser({ ...alice, create_organization_enabled: false });
      await renderUserButton(
        {},
        signedIn({ client: fapiClient([fapiSession({ ...aliceSession, user: restricted }), bobSession]) }),
      );
      const user = await open();
      await user.click(accountMenu());

      expect(await screen.findByRole('menuitem', { name: 'Manage account' })).toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: 'Create organization' })).toBeNull();
    });
  });

  describe('while an action is in flight', () => {
    it('spins the clicked row and stands every other one down', async () => {
      await renderUserButton();
      const user = await open();
      await screen.findByRole('button', { name: 'Other' });
      const touch = holdRequests('post', '/v1/client/sessions/:id/touch');

      await user.click(screen.getByRole('button', { name: 'Other' }));

      expect(waiting()).toBe(true);
      expect(screen.getByRole('button', { name: 'Sign out of all accounts' })).toHaveAttribute('aria-disabled', 'true');
      expect(screen.getByRole('button', { name: 'Switch account' })).toBeDisabled();
      expect(popup()).toBeInTheDocument();

      touch.release();
      await waitFor(() => expect(popup()).toBeNull());
    });

    it('holds the surface on the organization it started with while Clerk navigates after a switch', async () => {
      const { navigate } = await renderUserButton({
        afterSelectOrganizationUrl: '/org/:id',
        fallback: <output data-testid='fallback'>Loading</output>,
      });
      let arrive: () => void = () => {};
      navigate.mockImplementationOnce(
        () =>
          new Promise<void>(resolve => {
            arrive = resolve;
          }),
      );
      const user = await open();

      await user.click(await screen.findByRole('button', { name: 'Other' }));
      await waitFor(() => expect(navigate).toHaveBeenCalledWith('/org/org_9'));

      expect(screen.queryByTestId('fallback')).toBeNull();
      expect(within(requiredPopup()).getAllByText('Acme')).toHaveLength(2);

      act(() => arrive());
      await waitFor(() => expect(popup()).toBeNull());
    });

    it('stays open and clears busy state when the switch fails', async () => {
      await renderUserButton();
      const user = await open();
      await screen.findByRole('button', { name: 'Other' });
      const touch = holdRequests('post', '/v1/client/sessions/:id/touch');

      await user.click(screen.getByRole('button', { name: 'Other' }));
      expect(waiting()).toBe(true);

      touch.fail();

      await waitFor(() => expect(waiting()).toBe(false), { timeout: 2000 });
      expect(popup()).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign out of all accounts' })).toBeEnabled();
    });

    it('still shows the action when reopened before it settles, and starts no second one', async () => {
      await renderUserButton();
      const user = await open();
      await screen.findByRole('button', { name: 'Other' });
      const touch = holdRequests('post', '/v1/client/sessions/:id/touch');

      const menu = await openAccounts(user);
      await user.click(within(menu).getByRole('menuitem', { name: 'bob@example.com' }));
      expect(waiting()).toBe(true);

      await user.click(trigger());
      await waitFor(() => expect(popup()).toBeNull());

      await new Promise(resolve => setTimeout(resolve, 450));
      await user.click(trigger());

      expect(popup()).toBeInTheDocument();
      expect(waiting()).toBe(true);

      await user.click(screen.getByRole('button', { name: 'Other' }));
      expect(touch.requests).toHaveLength(1);

      touch.release();
      await waitFor(() => expect(waiting()).toBe(false));
      expect(popup()).toBeInTheDocument();
    });

    it('closes on success even if the popover was dismissed and reopened meanwhile', async () => {
      await renderUserButton();
      const user = await open();
      await screen.findByRole('button', { name: 'Other' });
      const touch = holdRequests('post', '/v1/client/sessions/:id/touch');

      await user.click(screen.getByRole('button', { name: 'Other' }));
      await user.click(trigger());
      await waitFor(() => expect(popup()).toBeNull());

      await user.click(trigger());
      expect(waiting()).toBe(true);

      touch.release();
      await waitFor(() => expect(popup()).toBeNull());
    });

    it('reopens ready to use after an action that closed it', async () => {
      await renderUserButton();
      const user = await open();

      await user.click(await screen.findByRole('button', { name: 'Other' }));
      await waitFor(() => expect(popup()).toBeNull());

      await user.click(trigger());

      expect(waiting()).toBe(false);
      expect(screen.getByRole('button', { name: 'Sign out of all accounts' })).toBeEnabled();
    });
  });

  it('loads the next page of organizations when the end of the list scrolls into view', async () => {
    const many = Array.from({ length: 15 }, (_, i) => fapiOrganization({ id: `org_p${i + 1}`, name: `Org ${i + 1}` }));
    await renderUserButton({}, signedIn({ memberships: [fapiMembership(acme), ...many.map(o => fapiMembership(o))] }));
    await open();

    const last = await screen.findByRole('button', { name: 'Org 9' });
    last.scrollIntoView();

    expect(await screen.findByRole('button', { name: 'Org 15' })).toBeInTheDocument();
  });

  describe('in user mode', () => {
    it('heads the surface with the account, never the active organization', async () => {
      await renderUserButton({ mode: 'user' });
      await open();

      expect(within(requiredPopup()).getByText('Alice Smith')).toBeInTheDocument();
      expect(within(requiredPopup()).getByText('alice')).toBeInTheDocument();
      expect(within(requiredPopup()).queryByText('Acme')).toBeNull();
    });

    it('drops the identifier line when it would only repeat the name', async () => {
      const nameless = fapiUser({ ...alice, first_name: null, last_name: null });
      await renderUserButton(
        { mode: 'user' },
        signedIn({ client: fapiClient([fapiSession({ ...aliceSession, user: nameless }), bobSession]) }),
      );
      await open();

      expect(within(requiredPopup()).getAllByText('alice')).toHaveLength(1);
    });

    it('lists no workspaces and offers no way to make one', async () => {
      await renderUserButton({ mode: 'user' });
      await open();

      expect(screen.queryByText('Personal account')).toBeNull();
      expect(screen.queryByText('Gamma')).toBeNull();
      expect(screen.queryByRole('button', { name: 'Create organization' })).toBeNull();
    });

    it('signs out from the header, beside the gear', async () => {
      await renderUserButton({ mode: 'user' });
      await open();

      expect(within(requiredPopup()).getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
      expect(within(requiredPopup()).getByRole('button', { name: 'Manage account' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Invite' })).toBeNull();
    });

    it('lists every account in the flyout, then the way to add one', async () => {
      await renderUserButton({ mode: 'user' });
      const user = await open();

      const items = within(await openAccounts(user)).getAllByRole('menuitem');

      expect(items.map(item => item.textContent)).toEqual([
        expect.stringContaining('alice'),
        expect.stringContaining('bob@example.com'),
        'Add account',
      ]);
      expect(reading('Switch account', 'Add account', 'Sign out of all accounts')).toEqual([
        'Switch account',
        'Sign out of all accounts',
      ]);
    });
  });

  describe('in organization mode', () => {
    it('heads the surface with the active organization and what can be done to it', async () => {
      await renderUserButton({ mode: 'organization' });
      await open();

      expect(within(requiredPopup()).getByText('Acme')).toBeInTheDocument();
      expect(within(requiredPopup()).getByText('3 members')).toBeInTheDocument();
      expect(within(requiredPopup()).getByRole('button', { name: 'Invite' })).toBeInTheDocument();
      expect(within(requiredPopup()).getByRole('button', { name: 'Manage organization' })).toBeInTheDocument();
    });

    it('falls back to the account where no organization is active', async () => {
      await renderUserButton({ mode: 'organization' }, signedIn({ client: fapiClient([personalSession]) }));
      await open();

      expect(within(requiredPopup()).getByText('Alice Smith')).toBeInTheDocument();
      expect(within(requiredPopup()).getByRole('button', { name: 'Manage account' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Invite' })).toBeNull();
    });

    it('names no organization selected where personal is hidden and none is active', async () => {
      await renderUserButton(
        { mode: 'organization', hidePersonal: true },
        signedIn({ client: fapiClient([personalSession]) }),
      );

      expect(trigger()).toHaveAccessibleName(/No organization selected/);
      await open();

      expect(within(requiredPopup()).getByText('No organization selected')).toBeInTheDocument();
      expect(within(requiredPopup()).queryByText('Alice Smith')).toBeNull();
      expect(screen.queryByRole('button', { name: 'Manage organization' })).toBeNull();
    });

    it('carries no account rows, and trails the workspaces with create-organization', async () => {
      await renderUserButton({ mode: 'organization' }, noOffers());
      await openWithList();

      expect(reading('Personal account', 'Acme', 'Other', 'Create organization')).toEqual([
        'Acme',
        'Personal account',
        'Acme',
        'Other',
        'Create organization',
      ]);
      for (const name of [
        'Switch account',
        'Add account',
        'Sign out',
        'Sign out of all accounts',
        'Actions for alice',
      ]) {
        expect(screen.queryByRole('button', { name })).toBeNull();
      }
    });
  });

  describe('in combined mode', () => {
    it('heads the surface with the account where the user takes priority', async () => {
      await renderUserButton({ modePriority: 'user' });

      expect(trigger()).toHaveAccessibleName('Open account menu for Alice Smith');
      await open();

      expect(within(requiredPopup()).getByText('Alice Smith')).toBeInTheDocument();
      expect(within(requiredPopup()).getByRole('button', { name: 'Manage account' })).toBeInTheDocument();
    });

    it('keeps sign-out off the header, since the account row carries it', async () => {
      await renderUserButton();
      await open();

      expect(within(requiredPopup()).queryByRole('button', { name: 'Sign out' })).toBeNull();
    });

    it('trails the workspaces with create-organization', async () => {
      await renderUserButton({}, noOffers());
      await openWithList();

      expect(reading('Personal account', 'Acme', 'Other', 'Create organization').at(-1)).toBe('Create organization');
    });

    it('marks the account it is already on in the flyout', async () => {
      await renderUserButton();
      const user = await open();

      const menu = await openAccounts(user);

      expect(within(menu).getByRole('menuitem', { name: 'alice' })).toHaveAttribute('aria-current', 'true');
      expect(within(menu).getByRole('menuitem', { name: 'bob@example.com' })).not.toHaveAttribute('aria-current');
      expect(within(menu).getByRole('menuitem', { name: 'Add account' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Add account' })).toBeNull();
    });

    it('takes add-account at the foot where there is no second account', async () => {
      await renderUserButton({}, alone());
      await open();

      expect(screen.queryByRole('button', { name: 'Switch account' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Sign out of all accounts' })).toBeNull();
      expect(reading('Switch account', 'Add account', 'Sign out of all accounts')).toEqual(['Add account']);
    });

    it('keeps the account row for an account with no organizations', async () => {
      const loner = fapiUser({ ...alice, organization_memberships: [] });
      await renderUserButton(
        {},
        noOffers({ memberships: [], client: fapiClient([fapiSession({ id: 'sess_1', user: loner }), bobSession]) }),
      );
      await open();

      expect(screen.getByRole('button', { name: 'Actions for alice' })).toBeInTheDocument();
      expect(screen.queryByText('Personal account')).toBeNull();
    });
  });

  describe('naming the account', () => {
    const phone: PhoneNumberJSON = {
      object: 'phone_number',
      id: 'idn_phone',
      phone_number: '+15550100',
      reserved_for_second_factor: false,
      default_second_factor: false,
      linked_to: [],
      verification: null,
    };
    const wallet: Web3WalletJSON = {
      object: 'web3_wallet',
      id: 'idn_wallet',
      web3_wallet: '0xabc',
      verification: null,
    };
    const noEmail = { username: null, email_addresses: [], primary_email_address_id: null };

    const signedInAs = (overrides: Partial<UserJSON>) =>
      signedIn({ client: fapiClient([fapiSession({ id: 'sess_1', user: fapiUser({ ...alice, ...overrides }) })]) });

    it.each([
      ['first and last name', {}, 'Alice Smith'],
      ['username', { first_name: null, last_name: null }, 'alice'],
      ['email address', { first_name: null, last_name: null, username: null }, 'alice@example.com'],
    ])('names it by its %s', async (_source, overrides, name) => {
      await renderUserButton({ mode: 'user' }, signedInAs(overrides));

      expect(trigger()).toHaveAccessibleName(`Open account menu for ${name}`);
    });

    it.each([
      ['username', {}, 'alice'],
      ['email address', { username: null }, 'alice@example.com'],
      ['phone number', { ...noEmail, phone_numbers: [phone], primary_phone_number_id: 'idn_phone' }, '+15550100'],
      ['web3 wallet', { ...noEmail, web3_wallets: [wallet], primary_web3_wallet_id: 'idn_wallet' }, '0xabc'],
    ])('identifies it by its %s', async (_source, overrides, identifier) => {
      await renderUserButton({}, signedInAs(overrides));
      await open();

      expect(screen.getByRole('button', { name: `Actions for ${identifier}` })).toBeInTheDocument();
    });
  });

  describe('the workspace list', () => {
    it('leads with invitations, then suggestions, then the workspaces held', async () => {
      await renderUserButton();
      await openWithList();

      expect(reading('Gamma', 'Beta', 'Personal account', 'Acme', 'Other')).toEqual([
        'Acme',
        'Gamma',
        'Beta',
        'Personal account',
        'Acme',
        'Other',
      ]);
    });

    it('names the active workspace as the current one', async () => {
      await renderUserButton();
      await openWithList();

      expect(current()).toEqual([expect.stringContaining('Acme')]);
    });

    it('checks the personal workspace, and offers no switch to it, where it is active', async () => {
      await renderUserButton({}, signedIn({ client: fapiClient([personalSession, bobSession]) }));
      await openWithList();

      expect(current()).toEqual([expect.stringContaining('Personal account')]);
      expect(screen.queryByRole('button', { name: 'Personal account' })).toBeNull();
    });

    it('describes each offer by the workspace it acts on', async () => {
      await renderUserButton();
      await openWithList();

      expect(screen.getByRole('button', { name: 'Accept' })).toHaveAccessibleDescription('Gamma');
      expect(screen.getByRole('button', { name: 'Join' })).toHaveAccessibleDescription('Beta');
    });

    it('lists an invitation for an account that holds nothing else', async () => {
      const loner = fapiUser({ ...alice, organization_memberships: [] });
      await renderUserButton(
        {},
        signedIn({
          memberships: [],
          suggestions: [],
          client: fapiClient([fapiSession({ id: 'sess_1', user: loner })]),
        }),
      );
      await open();

      expect(await screen.findByRole('button', { name: 'Accept' })).toBeInTheDocument();
      expect(reading('Gamma', 'Personal account')).toEqual(['Gamma', 'Personal account']);
    });

    it('drops revoked and expired invitations, which have nothing to accept', async () => {
      await renderUserButton(
        {},
        noOffers({
          invitations: [
            fapiInvitation('inv_1', gamma, { status: 'revoked' }),
            fapiInvitation('inv_2', beta, { status: 'expired' }),
          ],
        }),
      );
      await openWithList();

      expect(reading('Gamma', 'Beta', 'Personal account', 'Acme', 'Other')).toEqual([
        'Acme',
        'Personal account',
        'Acme',
        'Other',
      ]);
    });

    it('reports an accepted suggestion instead of offering to join it again', async () => {
      await renderUserButton({}, noOffers({ suggestions: [fapiSuggestion('sug_1', beta, { status: 'accepted' })] }));
      await openWithList();

      expect(screen.queryByRole('button', { name: 'Join' })).toBeNull();
      expect(reading('Beta', 'Requested')).toEqual(['Beta', 'Requested']);
    });

    it('lists an accepted invitation once, as a workspace to switch to', async () => {
      await renderUserButton({}, noOffers({ invitations: [fapiInvitation('inv_1', gamma)] }));
      const user = await openWithList();

      await user.click(screen.getByRole('button', { name: 'Accept' }));

      expect(await screen.findByRole('button', { name: 'Gamma' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Accept' })).toBeNull();
      expect(reading('Gamma')).toEqual(['Gamma']);
    });

    it('holds every row behind one placeholder until the first page lands', async () => {
      serveFapi(signedIn());
      const invitations = holdRequests('get', '/v1/me/organization_invitations');
      await renderWithClerk(tree());
      await open();

      expect(await screen.findByText('Loading organizations…')).toBeInTheDocument();
      expect(reading('Personal account', 'Other')).toEqual([]);
      expect(screen.getByRole('button', { name: 'Actions for alice' })).toBeInTheDocument();

      invitations.release();
      await waitFor(() => expect(screen.queryByText('Loading organizations…')).toBeNull());
      expect(reading('Personal account', 'Other')).toEqual(['Personal account', 'Other']);
    });
  });

  describe('the foot', () => {
    const terms = { id: 'terms', label: 'Terms of service', onClick: () => {} };
    const support = { id: 'support', label: 'Support', href: '/support' };

    it('leads with the custom rows', async () => {
      await renderUserButton({ customMenuItems: [terms, support] });
      await open();

      expect(
        reading('Terms of service', 'Support', 'Switch account', 'Add account', 'Sign out of all accounts'),
      ).toEqual(['Terms of service', 'Support', 'Switch account', 'Sign out of all accounts']);
      expect(screen.getByRole('link', { name: 'Support' })).toHaveAttribute('href', '/support');
    });

    it('renders the icon a custom row brings', async () => {
      await renderUserButton({ customMenuItems: [{ ...terms, icon: <svg data-testid='glyph' /> }] });
      await open();

      expect(screen.getByTestId('glyph')).toBeInTheDocument();
    });

    it('orders the rows by the ids it is given, dropping ids no row answers to', async () => {
      await renderUserButton({
        customMenuItems: [terms, support],
        menuItemOrder: ['signOutAll', 'manageAccount', 'support', 'nonsense'],
      });
      await open();

      expect(
        reading('Terms of service', 'Support', 'Switch account', 'Add account', 'Sign out of all accounts'),
      ).toEqual(['Sign out of all accounts', 'Support', 'Terms of service', 'Switch account']);
    });

    it.each([
      ['Switch account', signedIn()],
      ['Add account', alone()],
    ])('orders the accounts slot ahead of a custom row as "%s"', async (label, seed) => {
      await renderUserButton({ customMenuItems: [terms], menuItemOrder: ['switchAccount', 'addAccount'] }, seed);
      await open();

      expect(
        reading('Terms of service', 'Support', 'Switch account', 'Add account', 'Sign out of all accounts')[0],
      ).toBe(label);
    });

    it('carries the custom rows on an organization surface too', async () => {
      await renderUserButton({ mode: 'organization', customMenuItems: [terms] });
      await open();

      expect(
        reading('Terms of service', 'Support', 'Switch account', 'Add account', 'Sign out of all accounts'),
      ).toEqual(['Terms of service']);
    });

    it('signs the popup with Clerk where the instance is branded', async () => {
      await renderUserButton({}, signedIn({ environment: fapiEnvironment({ display_config: { branded: true } }) }));
      await open();

      expect(within(requiredPopup()).getByRole('link', { name: 'Clerk' })).toBeInTheDocument();
    });

    it('carries no mark where the instance is unbranded', async () => {
      await renderUserButton();
      await open();

      expect(within(requiredPopup()).queryByRole('link', { name: 'Clerk' })).toBeNull();
    });
  });

  describe('while an action is in flight', () => {
    it.each(['Other', 'Personal account', 'Sign out of all accounts'])(
      'holds "%s" in place, aria-disabled and still focusable',
      async label => {
        await renderUserButton({}, noOffers());
        const user = await openWithList();
        const before = screen.getByRole('button', { name: label });
        const touch = holdRequests('post', '/v1/client/sessions/:id/touch');

        await openAccounts(user).then(menu =>
          user.click(within(menu).getByRole('menuitem', { name: 'bob@example.com' })),
        );

        const after = screen.getByRole('button', { name: label });
        expect(after).toBe(before);
        expect(after).toHaveAttribute('aria-disabled', 'true');
        expect(after).toBeEnabled();

        touch.release();
        await waitFor(() => expect(waiting()).toBe(false));
      },
    );

    it('reports the switch on the row that owns it, and nothing on the rows beside it', async () => {
      await renderUserButton({}, noOffers());
      const user = await openWithList();
      const touch = holdRequests('post', '/v1/client/sessions/:id/touch');

      await user.click(screen.getByRole('button', { name: 'Other' }));

      const busy = screen.getByRole('button', { name: 'Other' });
      expect(busy).toHaveAttribute('aria-busy', 'true');
      expect(within(busy).getByRole('progressbar')).toHaveAccessibleName('pending');
      const idle = screen.getByRole('button', { name: 'Personal account' });
      expect(idle).not.toHaveAttribute('aria-busy');
      expect(within(idle).queryByRole('progressbar')).toBeNull();
      expect(screen.getByRole('button', { name: 'Actions for alice' })).toBeDisabled();

      touch.release();
      await waitFor(() => expect(popup()).toBeNull());
    });

    it('stands a custom action down but leaves a custom link followable', async () => {
      const onClick = vi.fn();
      await renderUserButton(
        {
          customMenuItems: [
            { id: 'terms', label: 'Terms of service', onClick },
            { id: 'support', label: 'Support', href: '/support' },
          ],
        },
        noOffers(),
      );
      const user = await openWithList();
      const touch = holdRequests('post', '/v1/client/sessions/:id/touch');

      await user.click(screen.getByRole('button', { name: 'Other' }));

      const action = screen.getByRole('button', { name: 'Terms of service' });
      expect(action).toHaveAttribute('aria-disabled', 'true');
      await user.click(action);
      expect(onClick).not.toHaveBeenCalled();
      expect(screen.getByRole('link', { name: 'Support' })).toHaveAttribute('href', '/support');

      touch.release();
      await waitFor(() => expect(popup()).toBeNull());
    });
  });

  describe('the trigger', () => {
    it.each([
      [{ mode: 'organization' as const }, 'Acme'],
      [{ mode: 'combined' as const }, 'Acme'],
      [{ mode: 'user' as const }, 'Alice Smith'],
      [{ mode: 'combined' as const, modePriority: 'user' as const }, 'Alice Smith'],
    ])('with %o names %s beside the avatar', async (props, name) => {
      await renderUserButton(props);

      expect(within(trigger()).getByText(name)).toBeInTheDocument();
      expect(popup()).toBeNull();
    });

    it('still names the account in user mode where personal is hidden and none is active', async () => {
      await renderUserButton({ mode: 'user', hidePersonal: true }, signedIn({ client: fapiClient([personalSession]) }));

      expect(within(trigger()).getByText('Alice Smith')).toBeInTheDocument();
    });

    it('renders the avatar alone when the label is off', async () => {
      await renderUserButton({ mode: 'organization', renderTriggerLabel: false });

      expect(trigger()).toHaveAccessibleName('Open account menu for Acme');
      expect(within(trigger()).queryByText('Acme')).toBeNull();
    });

    it('names the active organization before its membership list has loaded', async () => {
      serveFapi(signedIn());
      const memberships = holdRequests('get', '/v1/me/organization_memberships');
      await renderWithClerk(tree({ mode: 'organization' }));

      expect(within(trigger()).getByText('Acme')).toBeInTheDocument();
      await userEvent.setup().click(trigger());
      expect(within(requiredPopup()).getByRole('button', { name: 'Invite' })).toBeInTheDocument();

      memberships.release();
      await waitFor(() => expect(screen.queryByText('Loading organizations…')).toBeNull());
    });
  });
});

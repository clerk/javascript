import type { CustomPage } from '@clerk/shared/types';
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

const host = () => screen.getByTestId('host');
const trigger = () => screen.getByRole('button', { name: /Open account menu/ });
const popup = () => screen.queryByRole('dialog', { name: 'Account' });
const spinner = () => popup()?.querySelector('.cl-spinner') ?? null;
const accountMenu = () => screen.getByRole('button', { name: 'Actions for alice' });

async function open() {
  const user = userEvent.setup();
  await user.click(trigger());
  expect(popup()).toBeInTheDocument();
  return user;
}

async function accountAction(user: ReturnType<typeof userEvent.setup>, label: string) {
  await user.click(accountMenu());
  await user.click(await screen.findByRole('menuitem', { name: label }));
}

async function openAccounts(user: ReturnType<typeof userEvent.setup>) {
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
      await waitFor(() => expect(spinner()).toBeNull());
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
      await waitFor(() => expect(spinner()).toBeNull());
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
      expect(spinner()).toBeInTheDocument();

      reload.release();
      await waitFor(() => expect(spinner()).toBeNull());
      expect(popup()).toBeInTheDocument();
    });

    it('joins a suggested organization and stays open', async () => {
      await renderUserButton();
      const user = await open();

      await user.click(await screen.findByRole('button', { name: 'Join' }));

      await waitFor(() => expect(screen.queryByRole('button', { name: 'Join' })).toBeNull());
      await waitFor(() => expect(spinner()).toBeNull());
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
      await waitFor(() => expect(spinner()).toBeNull());
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

      expect(spinner()).toBeInTheDocument();
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
      expect(spinner()).toBeInTheDocument();

      touch.fail();

      await waitFor(() => expect(spinner()).toBeNull(), { timeout: 2000 });
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
      expect(spinner()).toBeInTheDocument();

      await user.click(trigger());
      await waitFor(() => expect(popup()).toBeNull());

      await new Promise(resolve => setTimeout(resolve, 450));
      await user.click(trigger());

      expect(popup()).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Switch account' }).querySelector('.cl-spinner')).not.toBeNull();

      await user.click(screen.getByRole('button', { name: 'Other' }));
      expect(touch.requests).toHaveLength(1);

      touch.release();
      await waitFor(() => expect(spinner()).toBeNull());
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
      expect(spinner()).toBeInTheDocument();

      touch.release();
      await waitFor(() => expect(popup()).toBeNull());
    });

    it('reopens ready to use after an action that closed it', async () => {
      await renderUserButton();
      const user = await open();

      await user.click(await screen.findByRole('button', { name: 'Other' }));
      await waitFor(() => expect(popup()).toBeNull());

      await user.click(trigger());

      expect(spinner()).toBeNull();
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
});

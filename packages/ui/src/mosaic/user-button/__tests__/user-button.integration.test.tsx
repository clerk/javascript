import type * as SharedReact from '@clerk/shared/react';
import type { CustomPage } from '@clerk/shared/types';
import { act as reactAct, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import type { UserButtonProps } from '../user-button';
import { UserButton } from '../user-button';

// End-to-end wiring test for the connected UserButton: it renders the real view through the real
// model and controller against a mocked Clerk, then drives the real popover DOM. Unlike the model
// test (model -> Clerk), this proves the layers compose, including what closes the popover:
// selecting a workspace closes on success in the machine, and anything that opens a modal or
// navigates closes before it hands off.

interface FakeUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  primaryEmailAddress: { emailAddress: string } | null;
  imageUrl: string;
  organizationMemberships: unknown[];
  createOrganizationEnabled: boolean;
}

interface FakeSession {
  id: string;
  user: FakeUser;
}

interface FakeList {
  data: unknown[];
  count: number;
  hasNextPage: boolean;
  isLoading: boolean;
  revalidate: ReturnType<typeof vi.fn>;
}

let isUserLoaded: boolean;
let isSessionLoaded: boolean;
let isOrgLoaded: boolean;
let user: FakeUser | null;
let session: { id: string; checkAuthorization: ReturnType<typeof vi.fn> } | null;
let organization: { id: string; name: string; imageUrl: string; membersCount: number } | null;
let userMemberships: FakeList;
let userInvitations: FakeList;
let userSuggestions: FakeList;
let signedInSessions: FakeSession[];
let pagingRef: ReturnType<typeof vi.fn>;
let singleSessionMode: boolean;
let organizationsEnabled: boolean;

let setActive: ReturnType<typeof vi.fn>;
let signOut: ReturnType<typeof vi.fn>;
let navigate: ReturnType<typeof vi.fn>;
let openUserProfile: ReturnType<typeof vi.fn>;
let openOrganizationProfile: ReturnType<typeof vi.fn>;
let openCreateOrganization: ReturnType<typeof vi.fn>;
let openInviteMembers: ReturnType<typeof vi.fn>;

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof SharedReact>();
  return {
    ...actual,
    useUser: () => ({ isLoaded: isUserLoaded, user }),
    useSession: () => ({ isLoaded: isSessionLoaded, session }),
    useOrganization: () => ({ isLoaded: isOrgLoaded, organization }),
    useClerk: () => ({
      navigate,
      setActive,
      signOut,
      openUserProfile,
      openOrganizationProfile,
      openCreateOrganization,
      openInviteMembers,
      buildUserProfileUrl: () => '/user-profile',
      buildOrganizationProfileUrl: () => '/org-profile',
      buildCreateOrganizationUrl: () => '/create-org',
      buildSignInUrl: () => '/sign-in',
      buildAfterSignOutUrl: () => '/after-sign-out',
      buildAfterMultiSessionSingleSignOutUrl: () => '/after-single-sign-out',
      client: { signedInSessions },
      __internal_environment: {
        displayConfig: { afterSwitchSessionUrl: '/after-switch' },
        authConfig: { singleSessionMode },
        organizationSettings: { enabled: organizationsEnabled, forceOrganizationSelection: false },
        commerceSettings: { billing: { user: { enabled: false } } },
        apiKeysSettings: { user_api_keys_enabled: false },
      },
    }),
  };
});

// Stubbed at the same seam as the controller test: the in-view helper is the controller's whole
// fetch boundary, so `ref` doubles as the assertion that the paging sentinel mounted.
vi.mock('../../../hooks/useOrganizationListInView', () => ({
  useOrganizationListInView: () => ({ userMemberships, userInvitations, userSuggestions, ref: pagingRef }),
}));

function acceptable(id: string, orgId: string, orgName: string, status: 'pending' | 'accepted' = 'pending') {
  return {
    id,
    status,
    accept: vi.fn().mockResolvedValue(undefined),
    publicOrganizationData: { id: orgId, name: orgName, imageUrl: '' },
  };
}

function membership(orgId: string, name: string, membersCount: number) {
  return { organization: { id: orgId, name, imageUrl: '', membersCount } };
}

function list(data: unknown[], count: number, hasNextPage = false, isLoading = false): FakeList {
  return { data, count, hasNextPage, isLoading, revalidate: vi.fn().mockResolvedValue(undefined) };
}

/** A promise whose settling is controlled by the test, to hold an async action in flight. */
function createDeferred() {
  let resolve: () => void = () => {};
  let reject: (reason?: unknown) => void = () => {};
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  isUserLoaded = true;
  isSessionLoaded = true;
  isOrgLoaded = true;
  user = {
    id: 'user_1',
    firstName: 'Alice',
    lastName: 'Smith',
    username: 'alice',
    primaryEmailAddress: { emailAddress: 'alice@example.com' },
    imageUrl: 'https://img/alice',
    organizationMemberships: [{ id: 'orgmem_1' }],
    createOrganizationEnabled: true,
  };
  session = { id: 'sess_1', checkAuthorization: vi.fn().mockReturnValue(true) };
  organization = { id: 'org_1', name: 'Acme', imageUrl: '', membersCount: 3 };
  userMemberships = list([membership('org_1', 'Acme', 3), membership('org_9', 'Other', 1)], 2);
  userInvitations = list([acceptable('inv_1', 'org_3', 'Gamma')], 1);
  userSuggestions = list([acceptable('sug_1', 'org_2', 'Beta')], 1);
  pagingRef = vi.fn();
  singleSessionMode = false;
  organizationsEnabled = true;
  signedInSessions = [
    { id: 'sess_1', user },
    {
      id: 'sess_2',
      user: {
        id: 'user_2',
        firstName: 'Bob',
        lastName: 'Jones',
        username: null,
        primaryEmailAddress: { emailAddress: 'bob@example.com' },
        imageUrl: 'https://img/bob',
        organizationMemberships: [],
        createOrganizationEnabled: true,
      },
    },
  ];
  setActive = vi.fn().mockResolvedValue(undefined);
  signOut = vi.fn().mockResolvedValue(undefined);
  navigate = vi.fn().mockResolvedValue(undefined);
  openUserProfile = vi.fn();
  openOrganizationProfile = vi.fn();
  openCreateOrganization = vi.fn();
  openInviteMembers = vi.fn();
});

afterEach(() => {
  vi.clearAllMocks();
});

function renderUserButton(props: UserButtonProps = {}) {
  return render(
    <MosaicProvider>
      {/* The button portals its popup out, so this host holds only what it renders in place. */}
      <div data-testid='host'>
        <UserButton {...props} />
      </div>
    </MosaicProvider>,
  );
}

const host = () => screen.getByTestId('host');
const trigger = () => screen.getByRole('button', { name: /Open account menu/ });
const popup = () => screen.queryByRole('dialog', { name: 'Account' });
const spinner = () => popup()?.querySelector('.cl-spinner') ?? null;

async function open() {
  const act = userEvent.setup();
  await act.click(trigger());
  expect(popup()).toBeInTheDocument();
  return act;
}

// Alice has a username, so that is what identifies her row; Bob has none and falls back to email.
const accountMenu = () => screen.getByRole('button', { name: 'Actions for alice' });

/** Opens the `⋯` on the active account's row and clicks one of its actions. */
async function accountAction(act: ReturnType<typeof userEvent.setup>, label: string) {
  await act.click(accountMenu());
  await act.click(await screen.findByRole('menuitem', { name: label }));
}

describe('UserButton (connected)', () => {
  // Nothing stands in for the button before Clerk answers, in any mode: until it does, a signed-out
  // visitor is indistinguishable from a session still resolving, so a placeholder here would be
  // promising a button to people who never get one.
  describe.each(['combined', 'organization', 'user'] as const)('in %s mode', mode => {
    it('renders nothing while Clerk is still loading', () => {
      isUserLoaded = false;
      renderUserButton({ mode });
      expect(host()).toBeEmptyDOMElement();
    });

    it('renders nothing when nobody is signed in', () => {
      user = null;
      renderUserButton({ mode });
      expect(host()).toBeEmptyDOMElement();
    });

    // Organizations off at the instance is the same answer whatever mode asked for: the button is
    // the account's. An org-only surface would otherwise render its own empty shell, since the
    // clerk-js mount boundary that withholds `<OrganizationSwitcher>` never runs for this one.
    it('leaves organizations out entirely when the instance has them disabled', async () => {
      organizationsEnabled = false;
      renderUserButton({ mode });

      // The account heads the surface, rather than the organization that is active regardless.
      expect(screen.getByRole('button', { name: 'Open account menu for Alice Smith' })).toBeInTheDocument();
      await open();

      for (const name of ['Acme', 'Other', 'Beta', 'Gamma', 'Personal account']) {
        expect(screen.queryByText(name)).toBeNull();
      }
      expect(screen.queryByRole('button', { name: 'Create organization' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Invite' })).toBeNull();

      // Everything the account itself carries is still on offer.
      expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'bob@example.com' })).toBeInTheDocument();
    });
  });

  it('renders the trigger and keeps the popover closed until clicked', () => {
    renderUserButton();
    expect(trigger()).toBeInTheDocument();
    expect(popup()).toBeNull();
  });

  it('opens the popover on trigger click', async () => {
    renderUserButton();
    await open();

    expect(screen.getByRole('button', { name: 'Other' })).toBeInTheDocument();
    expect(accountMenu()).toBeInTheDocument();
  });

  it('selecting an organization calls setActive without a redirect by default and closes the popover', async () => {
    renderUserButton();
    const act = await open();

    await act.click(screen.getByRole('button', { name: 'Other' }));

    expect(setActive).toHaveBeenCalledWith({ organization: 'org_9', redirectUrl: undefined });
    await waitFor(() => expect(popup()).toBeNull());
  });

  it('leaving the active organization for the personal workspace clears it', async () => {
    renderUserButton();
    const act = await open();

    await act.click(screen.getByRole('button', { name: 'Personal account' }));

    expect(setActive).toHaveBeenCalledWith({ organization: null, redirectUrl: undefined });
    await waitFor(() => expect(popup()).toBeNull());
  });

  it('drops the personal workspace where the app hides it, leaving the organizations', async () => {
    renderUserButton({ hidePersonal: true });
    await open();

    expect(screen.queryByText('Personal account')).toBeNull();
    expect(screen.getByRole('button', { name: 'Other' })).toBeInTheDocument();
  });

  // `mode` is the view's own prop; this only proves the connected component hands it down, since
  // the account-only surface is otherwise indistinguishable from an account with no organizations.
  it('forwards mode to the view, so an account-only surface lists no organizations', async () => {
    renderUserButton({ mode: 'user' });
    await open();

    expect(screen.queryByRole('button', { name: 'Other' })).toBeNull();
    expect(screen.getByRole('button', { name: 'bob@example.com' })).toBeInTheDocument();
  });

  it('switching to another account calls setActive with the session and stays open', async () => {
    renderUserButton();
    const act = await open();

    await act.click(screen.getByRole('button', { name: 'bob@example.com' }));

    expect(setActive).toHaveBeenCalledWith({ session: 'sess_2', navigate: expect.any(Function) });
    await waitFor(() => expect(spinner()).toBeNull());
    expect(popup()).toBeInTheDocument();
  });

  it('signing out of the active account calls signOut with its session id', async () => {
    renderUserButton();
    const act = await open();

    await accountAction(act, 'Sign out');

    // Another account stays signed in, so this is a single sign out, not a full one.
    expect(signOut).toHaveBeenCalledWith({ sessionId: 'sess_1', redirectUrl: '/after-single-sign-out' });
  });

  it('signing out of all accounts calls signOut with the after-sign-out url', async () => {
    renderUserButton();
    const act = await open();

    await act.click(screen.getByRole('button', { name: 'Sign out of all accounts' }));

    expect(signOut).toHaveBeenCalledWith({ redirectUrl: '/after-sign-out' });
  });

  it('accepting an invitation accepts it, revalidates, and stays open', async () => {
    renderUserButton();
    const act = await open();
    const invitation = userInvitations.data[0] as ReturnType<typeof acceptable>;

    await act.click(screen.getByRole('button', { name: 'Accept' }));

    await waitFor(() => expect(invitation.accept).toHaveBeenCalledTimes(1));
    expect(userInvitations.revalidate).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(spinner()).toBeNull());
    expect(popup()).toBeInTheDocument();
  });

  it('accepting a suggestion accepts it, revalidates, and stays open', async () => {
    renderUserButton();
    const act = await open();
    const suggestion = userSuggestions.data[0] as ReturnType<typeof acceptable>;

    await act.click(screen.getByRole('button', { name: 'Join' }));

    await waitFor(() => expect(suggestion.accept).toHaveBeenCalledTimes(1));
    expect(userSuggestions.revalidate).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(spinner()).toBeNull());
    expect(popup()).toBeInTheDocument();
  });

  it('drops add-account and sign-out-of-all in single-session mode', async () => {
    singleSessionMode = true;
    signedInSessions = signedInSessions.slice(0, 1);
    renderUserButton();
    const act = await open();

    expect(screen.queryByRole('button', { name: 'Sign out of all accounts' })).toBeNull();
    expect(screen.queryByLabelText('Account actions')).toBeNull();
    await act.click(accountMenu());
    expect(screen.queryByRole('menuitem', { name: 'Add account' })).toBeNull();
  });

  it('managing the account opens the UserProfile modal and closes the popover', async () => {
    renderUserButton();
    const act = await open();

    await accountAction(act, 'Manage account');

    expect(openUserProfile).toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    await waitFor(() => expect(popup()).toBeNull());
  });

  // A custom action is the app's to run, and whatever it opens takes over from here, so the popover
  // goes with it the way it does for managing an account.
  it('running a custom menu item calls back and closes the popover', async () => {
    const onClick = vi.fn();
    renderUserButton({ customMenuItems: [{ id: 'terms', label: 'Terms of service', onClick }] });
    const act = await open();

    await act.click(screen.getByRole('button', { name: 'Terms of service' }));

    expect(onClick).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(popup()).toBeNull());
  });

  // The whole round trip for a custom page: the prop a consumer writes, through the bridge, out to
  // the callbacks clerk-js is handed, and back into the element clerk-js renders for the page. The
  // popover has closed by then, so this also covers the portals outliving what opened them.
  it('renders a custom page into the element the opened profile hands back', async () => {
    renderUserButton({
      userProfileProps: { customPages: [{ label: 'Terms', path: 'terms', content: <p>Terms body</p> }] },
    });
    const act = await open();

    await accountAction(act, 'Manage account');
    await waitFor(() => expect(popup()).toBeNull());

    const { customPages } = openUserProfile.mock.calls[0][0];
    expect(customPages).toHaveLength(1);
    expect(customPages[0]).toMatchObject({ label: 'Terms', url: 'terms' });

    // Stands in for clerk-js's `ExternalElementMounter`, which renders this `div` where the page goes.
    const el = document.createElement('div');
    document.body.appendChild(el);
    reactAct(() => {
      customPages[0].mount(el);
    });

    expect(within(el).getByText('Terms body')).toBeInTheDocument();
  });

  it('opens the profile with its pages in the order it was given', async () => {
    renderUserButton({
      userProfileProps: {
        customPages: [{ label: 'Terms', path: 'terms', content: <p>Terms body</p> }],
        pageOrder: ['account', 'terms'],
      },
    });
    const act = await open();

    await accountAction(act, 'Manage account');
    await waitFor(() => expect(popup()).toBeNull());

    const { customPages } = openUserProfile.mock.calls[0][0];
    expect(customPages.map((page: CustomPage) => page.label)).toEqual(['account', 'Terms', 'security']);
  });

  it('inviting members opens the InviteMembers modal and closes the popover', async () => {
    renderUserButton();
    const act = await open();

    await act.click(screen.getByRole('button', { name: 'Invite' }));

    expect(openInviteMembers).toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    await waitFor(() => expect(popup()).toBeNull());
  });

  it('creating an organization opens the modal and closes the popover', async () => {
    renderUserButton();
    const act = await open();

    await accountAction(act, 'Create organization');

    expect(openCreateOrganization).toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    await waitFor(() => expect(popup()).toBeNull());
  });

  it('creating an organization navigates instead when a URL routes it', async () => {
    renderUserButton({ createOrganizationUrl: '/new-org' });
    const act = await open();

    await accountAction(act, 'Create organization');

    expect(navigate).toHaveBeenCalledWith('/new-org');
    expect(openCreateOrganization).not.toHaveBeenCalled();
    await waitFor(() => expect(popup()).toBeNull());
  });

  it('leaves create-organization out of the account menu for a user who cannot open one', async () => {
    user = { ...(user as FakeUser), createOrganizationEnabled: false };
    renderUserButton();
    const act = await open();
    await act.click(accountMenu());

    expect(await screen.findByRole('menuitem', { name: 'Manage account' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Create organization' })).toBeNull();
  });

  it('spins the clicked affordance and stands every other one down while an action is in flight', async () => {
    const deferred = createDeferred();
    setActive.mockReturnValueOnce(deferred.promise);
    renderUserButton();
    const act = await open();

    await act.click(screen.getByRole('button', { name: 'Other' }));

    // Every one of these is a network round trip, so there is nothing to debounce: the click gets
    // its spinner in the same pass rather than after a delay window.
    expect(spinner()).toBeInTheDocument();
    // A stood-down row stays a button, and `aria-disabled` rather than natively disabled so it
    // keeps its place in the tab order. Dropping it to a static row would remount it, and with it
    // the avatar it carries.
    expect(screen.getByRole('button', { name: 'Sign out of all accounts' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: 'bob@example.com' })).toHaveAttribute('aria-disabled', 'true');
    expect(popup()).toBeInTheDocument();

    deferred.resolve();
    await waitFor(() => expect(popup()).toBeNull());
  });

  // `setActive` swaps the active organization mid-flight. See `frozen` in the machine.
  it('holds the surface on the data it started with until the action settles', async () => {
    const deferred = createDeferred();
    setActive.mockReturnValueOnce(deferred.promise);
    renderUserButton();
    const act = await open();

    await act.click(screen.getByRole('button', { name: 'Other' }));
    organization = { id: 'org_9', name: 'Other', imageUrl: '', membersCount: 1 };

    // Any re-render now reads the swapped organization; the surface must not follow it.
    await waitFor(() => expect(spinner()).toBeInTheDocument());
    const surface = popup();
    if (!surface) {
      throw new Error('expected the popover to be open');
    }
    // Still the organization the surface opened on: heading it and listed under it, unclickable.
    expect(within(surface).getAllByText('Acme')).toHaveLength(2);
    expect(screen.queryByRole('button', { name: 'Acme' })).toBeNull();

    deferred.resolve();
    await waitFor(() => expect(popup()).toBeNull());
  });

  it('spins inside the join button while a suggestion is being joined', async () => {
    const deferred = createDeferred();
    const suggestion = userSuggestions.data[0] as ReturnType<typeof acceptable>;
    suggestion.accept.mockReturnValueOnce(deferred.promise);
    renderUserButton();
    const act = await open();

    await act.click(screen.getByRole('button', { name: 'Join' }));

    const join = screen.getByRole('button', { name: 'Join' });
    expect(join).toHaveAttribute('aria-busy', 'true');
    expect(within(join).getByRole('progressbar')).toBeInTheDocument();

    deferred.resolve();
    await waitFor(() => expect(spinner()).toBeNull());
    expect(popup()).toBeInTheDocument();
  });

  it('keeps the popover open and clears busy state when an action rejects', async () => {
    const deferred = createDeferred();
    setActive.mockReturnValueOnce(deferred.promise);
    renderUserButton();
    const act = await open();

    await act.click(screen.getByRole('button', { name: 'Other' }));
    expect(spinner()).toBeInTheDocument();

    deferred.reject(new Error('setActive failed'));

    await waitFor(() => expect(spinner()).toBeNull(), { timeout: 2000 });
    expect(popup()).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign out of all accounts' })).toBeEnabled();
  });

  // The spinner is held up for a minimum so it cannot flicker off. That hold is for a surface still
  // on screen, so an action that closes the surface must not carry it: reopening inside the window
  // would otherwise find the popup spinning over rows that are all stood down, for nothing.
  it('reopens ready to use after an action that closed it', async () => {
    const deferred = createDeferred();
    setActive.mockReturnValueOnce(deferred.promise);
    renderUserButton();
    const act = await open();

    await act.click(screen.getByRole('button', { name: 'Other' }));
    expect(spinner()).toBeInTheDocument();

    deferred.resolve();
    await waitFor(() => expect(popup()).toBeNull());

    await act.click(trigger());

    expect(spinner()).toBeNull();
    expect(screen.getByRole('button', { name: 'Sign out of all accounts' })).toBeEnabled();
  });

  // The view decides whether to mount the sentinel at all; this is the wiring that carries the
  // in-view ref from the paginated lists, through the controller, to it.
  it('hands the paging sentinel to the in-view ref when a list has a next page', async () => {
    userMemberships = list([membership('org_1', 'Acme', 3)], 1, true);
    renderUserButton();
    await open();

    expect(pagingRef).toHaveBeenCalledWith(expect.any(HTMLElement));
  });
});

import type * as SharedReact from '@clerk/shared/react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import type { UserButtonProps } from '../user-button';
import { UserButton } from '../user-button';

// End-to-end wiring test for the connected UserButton: it renders the real view through the real
// controller against a mocked Clerk, then drives the real popover DOM. Unlike the controller test
// (controller -> Clerk), this proves the layers compose — including the container's
// close-on-success: one-shot actions close the popover, navigations leave it open.

interface FakeUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  primaryEmailAddress: { emailAddress: string } | null;
  imageUrl: string;
  organizationMemberships: unknown[];
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

let setActive: ReturnType<typeof vi.fn>;
let signOut: ReturnType<typeof vi.fn>;
let navigate: ReturnType<typeof vi.fn>;
let openUserProfile: ReturnType<typeof vi.fn>;
let openOrganizationProfile: ReturnType<typeof vi.fn>;

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
  };
  session = { id: 'sess_1', checkAuthorization: vi.fn().mockReturnValue(true) };
  organization = { id: 'org_1', name: 'Acme', imageUrl: '', membersCount: 3 };
  userMemberships = list([membership('org_1', 'Acme', 3), membership('org_9', 'Other', 1)], 2);
  userInvitations = list([acceptable('inv_1', 'org_3', 'Gamma')], 1);
  userSuggestions = list([acceptable('sug_1', 'org_2', 'Beta')], 1);
  pagingRef = vi.fn();
  singleSessionMode = false;
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
      },
    },
  ];
  setActive = vi.fn().mockResolvedValue(undefined);
  signOut = vi.fn().mockResolvedValue(undefined);
  navigate = vi.fn().mockResolvedValue(undefined);
  openUserProfile = vi.fn();
  openOrganizationProfile = vi.fn();
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

const accountMenu = () => screen.getByRole('button', { name: 'Actions for alice@example.com' });

/** Opens the `⋯` on the active account's row and clicks one of its actions. */
async function accountAction(act: ReturnType<typeof userEvent.setup>, label: string) {
  await act.click(accountMenu());
  await act.click(await screen.findByRole('menuitem', { name: label }));
}

describe('UserButton (connected)', () => {
  it('renders a non-interactive placeholder while the controller is loading', () => {
    isUserLoaded = false;
    renderUserButton();

    expect(host()).not.toBeEmptyDOMElement();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders nothing when there is no active user', () => {
    user = null;
    renderUserButton();
    expect(host()).toBeEmptyDOMElement();
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

  it('switching to another account calls setActive with the session and stays open', async () => {
    renderUserButton();
    const act = await open();

    await act.click(screen.getByRole('button', { name: 'bob@example.com' }));

    expect(setActive).toHaveBeenCalledWith({ session: 'sess_2', redirectUrl: '/after-switch' });
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

  it('inviting members opens the OrganizationProfile modal and closes the popover', async () => {
    renderUserButton();
    const act = await open();

    await act.click(screen.getByRole('button', { name: 'Invite' }));

    expect(openOrganizationProfile).toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    await waitFor(() => expect(popup()).toBeNull());
  });

  it('creating an organization navigates and closes the popover', async () => {
    renderUserButton();
    const act = await open();

    await accountAction(act, 'Create organization');

    expect(navigate).toHaveBeenCalledWith('/create-org');
    await waitFor(() => expect(popup()).toBeNull());
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
    // A stood-down row stays a button, disabled. Dropping it to a static row would remount it,
    // and with it the avatar it carries.
    expect(screen.getByRole('button', { name: 'Sign out of all accounts' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'bob@example.com' })).toBeDisabled();
    expect(popup()).toBeInTheDocument();

    deferred.resolve();
    await waitFor(() => expect(popup()).toBeNull());
  });

  // `setActive` swaps the active organization while its promise is still in flight, so live data
  // would rearrange the surface under the pointer: the header renaming itself, the check jumping
  // rows, and Invite appearing or leaving as the permission is re-read.
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

  it('replaces the accept button with a spinner while a suggestion is being joined', async () => {
    const deferred = createDeferred();
    const suggestion = userSuggestions.data[0] as ReturnType<typeof acceptable>;
    suggestion.accept.mockReturnValueOnce(deferred.promise);
    renderUserButton();
    const act = await open();

    await act.click(screen.getByRole('button', { name: 'Join' }));

    expect(spinner()).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Join' })).toBeNull();

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

  // The view decides whether to mount the sentinel at all; this is the wiring that carries the
  // in-view ref from the paginated lists, through the controller, to it.
  it('hands the paging sentinel to the in-view ref when a list has a next page', async () => {
    userMemberships = list([membership('org_1', 'Acme', 3)], 1, true);
    renderUserButton();
    await open();

    expect(pagingRef).toHaveBeenCalledWith(expect.any(HTMLElement));
  });
});

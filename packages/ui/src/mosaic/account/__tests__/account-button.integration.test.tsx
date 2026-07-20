import type * as SharedReact from '@clerk/shared/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import { AccountButton } from '../account-button';

// End-to-end wiring test for the connected AccountButton: it renders the real view through the real
// controller against a mocked Clerk, then drives the real popover DOM. Unlike the controller test
// (controller -> Clerk) and the view test (props -> DOM), this proves the three layers compose —
// including the container's close-on-success: one-shot actions close the popover, navigations leave
// it open.

interface FakeUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  primaryEmailAddress: { emailAddress: string } | null;
  imageUrl: string;
}

interface FakeSession {
  id: string;
  user: FakeUser;
}

let isUserLoaded: boolean;
let isSessionLoaded: boolean;
let isOrgLoaded: boolean;
let user: FakeUser | null;
let session: { id: string; checkAuthorization: ReturnType<typeof vi.fn> } | null;
let organization: { id: string } | null;
let membershipRequests: { count: number };
let userMemberships: { data: ReturnType<typeof membership>[]; count: number; revalidate: ReturnType<typeof vi.fn> };
let userInvitations: { data: ReturnType<typeof acceptable>[]; count: number; revalidate: ReturnType<typeof vi.fn> };
let userSuggestions: { data: ReturnType<typeof acceptable>[]; count: number; revalidate: ReturnType<typeof vi.fn> };
let signedInSessions: FakeSession[];
let singleSessionMode: boolean;

let setActive: ReturnType<typeof vi.fn>;
let signOut: ReturnType<typeof vi.fn>;
let navigate: ReturnType<typeof vi.fn>;

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof SharedReact>();
  return {
    ...actual,
    useUser: () => ({ isLoaded: isUserLoaded, user }),
    useSession: () => ({ isLoaded: isSessionLoaded, session }),
    useOrganization: () => ({ isLoaded: isOrgLoaded, organization, membershipRequests }),
    useOrganizationList: () => ({ userMemberships, userInvitations, userSuggestions }),
    useClerk: () => ({
      navigate,
      setActive,
      signOut,
      buildUserProfileUrl: () => '/user-profile',
      buildOrganizationProfileUrl: () => '/org-profile',
      buildCreateOrganizationUrl: () => '/create-org',
      buildSignInUrl: () => '/sign-in',
      buildAfterSignOutUrl: () => '/after-signout',
      buildAfterMultiSessionSingleSignOutUrl: () => '/after-single-signout',
      client: { signedInSessions },
      __internal_environment: {
        authConfig: { singleSessionMode },
        displayConfig: {
          afterCreateOrganizationUrl: '/after-create',
          afterSwitchSessionUrl: '/after-switch',
        },
      },
    }),
  };
});

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

const spinner = () => popup()?.querySelector('[data-cl-spinner]') ?? null;

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
  };
  session = { id: 'sess_1', checkAuthorization: vi.fn().mockReturnValue(true) };
  organization = { id: 'org_1' };
  membershipRequests = { count: 4 };
  userMemberships = {
    data: [membership('org_1', 'Acme', 3), membership('org_9', 'Other', 1)],
    count: 2,
    revalidate: vi.fn().mockResolvedValue(undefined),
  };
  userInvitations = {
    data: [acceptable('inv_1', 'org_3', 'Gamma')],
    count: 1,
    revalidate: vi.fn().mockResolvedValue(undefined),
  };
  userSuggestions = {
    data: [acceptable('sug_1', 'org_2', 'Beta')],
    count: 1,
    revalidate: vi.fn().mockResolvedValue(undefined),
  };
  signedInSessions = [
    { id: 'sess_1', user: user },
    {
      id: 'sess_2',
      user: {
        id: 'user_2',
        firstName: 'Bob',
        lastName: 'Jones',
        username: null,
        primaryEmailAddress: { emailAddress: 'bob@example.com' },
        imageUrl: 'https://img/bob',
      },
    },
  ];
  setActive = vi.fn().mockResolvedValue(undefined);
  signOut = vi.fn().mockResolvedValue(undefined);
  navigate = vi.fn().mockResolvedValue(undefined);
  singleSessionMode = false;
});

afterEach(() => {
  vi.clearAllMocks();
});

function renderAccountButton() {
  return render(
    <MosaicProvider>
      <AccountButton />
    </MosaicProvider>,
  );
}

const trigger = () => document.querySelector('[data-cl-slot="account-button-trigger"]');
const popup = () => document.querySelector('[data-cl-slot="account-button-popup"]');

async function open() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button'));
  expect(popup()).toBeInTheDocument();
  return user;
}

describe('AccountButton (connected)', () => {
  it('renders a non-interactive skeleton trigger while the controller is loading', () => {
    isUserLoaded = false;
    renderAccountButton();
    const t = trigger();
    expect(t).toBeInTheDocument();
    expect(t).toHaveAttribute('data-cl-loading');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders nothing when there is no active user', () => {
    user = null;
    renderAccountButton();
    expect(trigger()).toBeNull();
  });

  it('renders the trigger and keeps the popover closed until clicked', () => {
    renderAccountButton();
    expect(trigger()).toBeInTheDocument();
    expect(popup()).toBeNull();
  });

  it('opens the popover on trigger click', async () => {
    renderAccountButton();
    await open();
    expect(screen.getByRole('button', { name: /Other/ })).toBeInTheDocument();
  });

  it('selecting an organization calls setActive without a redirect by default and closes the popover', async () => {
    renderAccountButton();
    const user = await open();

    await user.click(screen.getByRole('button', { name: /Other/ }));

    expect(setActive).toHaveBeenCalledWith({ organization: 'org_9', redirectUrl: undefined });
    await waitFor(() => expect(popup()).not.toBeInTheDocument());
  });

  it('selecting an organization redirects to the configured afterSelectOrganizationUrl', async () => {
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <AccountButton afterSelectOrganizationUrl={org => `/o/${org.id}`} />
      </MosaicProvider>,
    );
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('button', { name: /Other/ }));

    expect(setActive).toHaveBeenCalledWith({ organization: 'org_9', redirectUrl: '/o/org_9' });
  });

  it('selecting the personal workspace calls setActive with a null organization and closes', async () => {
    renderAccountButton();
    const user = await open();

    await user.click(screen.getByRole('button', { name: /Alice Smith/ }));

    expect(setActive).toHaveBeenCalledWith(expect.objectContaining({ organization: null }));
    await waitFor(() => expect(popup()).not.toBeInTheDocument());
  });

  it('switching to an additional account calls setActive with the session and closes', async () => {
    renderAccountButton();
    const user = await open();

    await user.click(screen.getByRole('button', { name: /Bob Jones/ }));

    expect(setActive).toHaveBeenCalledWith(expect.objectContaining({ session: 'sess_2' }));
    await waitFor(() => expect(popup()).not.toBeInTheDocument());
  });

  it('signing out of a single session calls signOut with the session id and closes', async () => {
    renderAccountButton();
    await open();

    // The per-row "Sign out" is hover-revealed (pointer-events: none until row hover), a visual
    // state jsdom can't apply, so dispatch the click directly rather than through userEvent.
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(signOut).toHaveBeenCalledWith({ sessionId: 'sess_1', redirectUrl: '/after-single-signout' });
    await waitFor(() => expect(popup()).not.toBeInTheDocument());
  });

  it('signing out of all accounts calls signOut with the after-sign-out url and closes', async () => {
    renderAccountButton();
    const user = await open();

    await user.click(screen.getByRole('button', { name: 'Sign out of all accounts' }));

    expect(signOut).toHaveBeenCalledWith({ redirectUrl: '/after-signout' });
    await waitFor(() => expect(popup()).not.toBeInTheDocument());
  });

  it('accepting an invitation accepts it, revalidates, and closes', async () => {
    renderAccountButton();
    const user = await open();
    const invitation = userInvitations.data[0];

    await user.click(screen.getByRole('button', { name: 'Accept' }));

    await waitFor(() => expect(invitation.accept).toHaveBeenCalledTimes(1));
    expect(userInvitations.revalidate).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(popup()).not.toBeInTheDocument());
  });

  it('accepting a suggestion accepts it, revalidates, and closes', async () => {
    renderAccountButton();
    const user = await open();
    const suggestion = userSuggestions.data[0];

    await user.click(screen.getByRole('button', { name: 'Join' }));

    await waitFor(() => expect(suggestion.accept).toHaveBeenCalledTimes(1));
    expect(userSuggestions.revalidate).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(popup()).not.toBeInTheDocument());
  });

  it('renders an accepted suggestion as non-actionable, without a Join button', async () => {
    userSuggestions = {
      data: [acceptable('sug_1', 'org_2', 'Beta', 'accepted')],
      count: 1,
      revalidate: vi.fn().mockResolvedValue(undefined),
    };
    renderAccountButton();
    await open();

    expect(screen.queryByRole('button', { name: 'Join' })).toBeNull();
    expect(screen.getByText('Pending approval')).toBeInTheDocument();
  });

  it('in single-session mode hides add-account and sign-out-of-all', async () => {
    singleSessionMode = true;
    signedInSessions = [{ id: 'sess_1', user: user as FakeUser }];
    renderAccountButton();
    await open();

    expect(screen.queryByRole('button', { name: 'Add account' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Sign out of all accounts' })).toBeNull();
  });

  it('shows pending invitations and suggestions even with no organization memberships', async () => {
    userMemberships = { data: [], count: 0, revalidate: vi.fn().mockResolvedValue(undefined) };
    organization = null;
    renderAccountButton();
    await open();

    expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Join' })).toBeInTheDocument();
  });

  it('navigating to manage the organization navigates and leaves the popover open', async () => {
    renderAccountButton();
    const user = await open();

    await user.click(screen.getByRole('button', { name: 'Settings' }));

    expect(navigate).toHaveBeenCalledWith('/org-profile');
    expect(popup()).toBeInTheDocument();
  });

  it('navigating to manage the account (personal mode) navigates and leaves the popover open', async () => {
    organization = null;
    renderAccountButton();
    const user = await open();

    await user.click(screen.getByRole('button', { name: 'Manage account' }));

    expect(navigate).toHaveBeenCalledWith('/user-profile');
    expect(popup()).toBeInTheDocument();
  });

  it('creating an organization navigates and leaves the popover open', async () => {
    renderAccountButton();
    const user = await open();

    await user.click(screen.getByRole('button', { name: 'Add organization' }));

    expect(navigate).toHaveBeenCalledWith('/create-org');
    expect(popup()).toBeInTheDocument();
  });

  it('shows a spinner on the clicked action and disables other actions while it is in flight', async () => {
    const deferred = createDeferred();
    setActive.mockReturnValueOnce(deferred.promise);
    renderAccountButton();
    const user = await open();

    await user.click(screen.getByRole('button', { name: /Other/ }));

    expect(spinner()).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign out of all accounts' })).toBeDisabled();
    expect(popup()).toBeInTheDocument();

    deferred.resolve();
    await waitFor(() => expect(popup()).not.toBeInTheDocument());
  });

  it('replaces the label with a spinner in the clicked inline button while accepting a suggestion', async () => {
    const deferred = createDeferred();
    userSuggestions.data[0].accept.mockReturnValueOnce(deferred.promise);
    renderAccountButton();
    const user = await open();

    await user.click(screen.getByRole('button', { name: 'Join' }));

    expect(screen.queryByRole('button', { name: 'Join' })).toBeNull();
    expect(spinner()).toBeInTheDocument();

    deferred.resolve();
    await waitFor(() => expect(popup()).not.toBeInTheDocument());
  });

  it('keeps the popover open and clears busy state when an action rejects', async () => {
    const deferred = createDeferred();
    setActive.mockReturnValueOnce(deferred.promise);
    renderAccountButton();
    const user = await open();

    await user.click(screen.getByRole('button', { name: /Other/ }));
    expect(spinner()).toBeInTheDocument();

    deferred.reject(new Error('setActive failed'));

    await waitFor(() => expect(spinner()).toBeNull());
    expect(popup()).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign out of all accounts' })).toBeEnabled();
  });
});

import type * as SharedReact from '@clerk/shared/react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { UserButtonControllerOptions } from '../user-button.controller';
import { useUserButtonController } from '../user-button.controller';

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
let pagingRef: (element: HTMLElement | null) => void;
let singleSessionMode: boolean;
let forceOrganizationSelection: boolean;

let setActive: ReturnType<typeof vi.fn>;
let signOut: ReturnType<typeof vi.fn>;
let navigate: ReturnType<typeof vi.fn>;
let openUserProfile: ReturnType<typeof vi.fn>;
let openOrganizationProfile: ReturnType<typeof vi.fn>;
let checkAuthorization: ReturnType<typeof vi.fn>;
let getContainer: () => HTMLElement | null;

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof SharedReact>();
  return {
    ...actual,
    useUser: () => ({ isLoaded: isUserLoaded, user }),
    useSession: () => ({ isLoaded: isSessionLoaded, session }),
    useOrganization: () => ({ isLoaded: isOrgLoaded, organization }),
    // Stubbed with a sentinel so the assertion is that this exact function reaches Clerk, rather
    // than that some function did.
    usePortalRoot: () => getContainer,
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
        organizationSettings: { forceOrganizationSelection },
      },
    }),
  };
});

// The controller reads its three paginated lists through the shared in-view helper, so the fetch
// boundary is stubbed there rather than at `useOrganizationList`.
vi.mock('../../../hooks/useOrganizationListInView', () => ({
  useOrganizationListInView: () => ({ userMemberships, userInvitations, userSuggestions, ref: pagingRef }),
}));

function acceptable(
  id: string,
  orgId: string,
  orgName: string,
  status: 'pending' | 'accepted' | 'revoked' | 'expired' = 'pending',
) {
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
    organizationMemberships: [],
  };
  session = { id: 'sess_1', checkAuthorization: (checkAuthorization = vi.fn().mockReturnValue(true)) };
  organization = { id: 'org_1', name: 'Acme', imageUrl: 'https://img/acme', membersCount: 3 };
  userMemberships = list([membership('org_1', 'Acme', 3), membership('org_9', 'Other', 1)], 2);
  userInvitations = list([acceptable('inv_1', 'org_3', 'Gamma')], 1);
  userSuggestions = list([acceptable('sug_1', 'org_2', 'Beta')], 1);
  pagingRef = vi.fn();
  singleSessionMode = false;
  forceOrganizationSelection = false;
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
        organizationMemberships: [],
      },
    },
  ];
  setActive = vi.fn().mockResolvedValue(undefined);
  signOut = vi.fn().mockResolvedValue(undefined);
  navigate = vi.fn().mockResolvedValue(undefined);
  openUserProfile = vi.fn();
  openOrganizationProfile = vi.fn();
  getContainer = () => null;
});

afterEach(() => {
  vi.clearAllMocks();
});

function Harness(options: UserButtonControllerOptions = {}) {
  const c = useUserButtonController(options);
  if (c.status !== 'ready') {
    return <output data-testid='status'>{c.status}</output>;
  }
  return (
    <div>
      <output data-testid='status'>{c.status}</output>
      <output data-testid='active-name'>{c.activeSession.name}</output>
      <output data-testid='active-email'>{c.activeSession.email}</output>
      <output data-testid='active-session'>{c.activeSession.sessionId}</output>
      <output data-testid='active-org'>{JSON.stringify(c.activeOrganization)}</output>
      <output data-testid='has-orgs'>{String(c.hasOrganizations)}</output>
      <output data-testid='hide-personal'>{String(c.hidePersonal)}</output>
      <output data-testid='orgs-loading'>{String(c.organizationsLoading)}</output>
      <output data-testid='additional'>{c.additionalSessions.map(a => a.sessionId).join(',')}</output>
      <output data-testid='has-more'>{String(c.paging?.hasMore)}</output>
      <output data-testid='paging-ref'>{String(c.paging?.ref === pagingRef)}</output>
      <output data-testid='can-invite'>{String(Boolean(c.onInviteMembers))}</output>
      <output data-testid='can-sign-out-all'>{String(Boolean(c.onSignOutAll))}</output>
      <output data-testid='can-add-account'>{String(Boolean(c.onAddAccount))}</output>
      <output data-testid='memberships'>{JSON.stringify(c.memberships)}</output>
      <output data-testid='suggestions'>{JSON.stringify(c.suggestions)}</output>
      <output data-testid='invitations'>{JSON.stringify(c.invitations)}</output>
      <button
        type='button'
        onClick={() => void c.onSelectOrganization?.('org_9')}
      >
        select-org
      </button>
      <button
        type='button'
        onClick={() => void c.onSelectOrganization?.(null)}
      >
        select-personal
      </button>
      <button
        type='button'
        onClick={() => void c.onSwitchSession?.('sess_2')}
      >
        switch
      </button>
      <button
        type='button'
        onClick={() => void c.onSignOutSession?.('sess_2')}
      >
        sign-out-one
      </button>
      <button
        type='button'
        onClick={() => void c.onSignOutAll?.()}
      >
        sign-out-all
      </button>
      <button
        type='button'
        onClick={() => void c.onManageAccount?.()}
      >
        manage-account
      </button>
      <button
        type='button'
        onClick={() => void c.onManageOrganization?.()}
      >
        manage-org
      </button>
      <button
        type='button'
        onClick={() => void c.onInviteMembers?.()}
      >
        invite-members
      </button>
      <button
        type='button'
        onClick={() => void c.onCreateOrganization?.()}
      >
        create-org
      </button>
      <button
        type='button'
        onClick={() => void c.onAddAccount?.()}
      >
        add-account
      </button>
      <button
        type='button'
        onClick={() => void c.onAcceptSuggestion?.('sug_1')}
      >
        accept-suggestion
      </button>
      <button
        type='button'
        onClick={() => void c.onAcceptInvitation?.('inv_1')}
      >
        accept-invitation
      </button>
    </div>
  );
}

function memberships() {
  return JSON.parse(screen.getByTestId('memberships').textContent ?? '[]');
}

function invitations() {
  return JSON.parse(screen.getByTestId('invitations').textContent ?? '[]');
}

function activeOrganization() {
  return JSON.parse(screen.getByTestId('active-org').textContent ?? 'null');
}

describe('useUserButtonController', () => {
  it('is loading until the user, session, and organization are all loaded', () => {
    isUserLoaded = false;
    const { rerender } = render(<Harness />);
    expect(screen.getByTestId('status')).toHaveTextContent('loading');

    isUserLoaded = true;
    isSessionLoaded = false;
    rerender(<Harness />);
    expect(screen.getByTestId('status')).toHaveTextContent('loading');

    isSessionLoaded = true;
    isOrgLoaded = false;
    rerender(<Harness />);
    expect(screen.getByTestId('status')).toHaveTextContent('loading');
  });

  it('is hidden when loaded but there is no active user', () => {
    user = null;
    render(<Harness />);
    expect(screen.getByTestId('status')).toHaveTextContent('hidden');
  });

  it('maps the active account and prefers first+last > username > email for the name', () => {
    const { rerender } = render(<Harness />);
    expect(screen.getByTestId('status')).toHaveTextContent('ready');
    expect(screen.getByTestId('active-name')).toHaveTextContent('Alice Smith');
    expect(screen.getByTestId('active-email')).toHaveTextContent('alice@example.com');
    expect(screen.getByTestId('active-session')).toHaveTextContent('sess_1');

    user = { ...(user as FakeUser), firstName: null, lastName: null };
    rerender(<Harness />);
    expect(screen.getByTestId('active-name')).toHaveTextContent('alice');

    user = { ...user, username: null };
    rerender(<Harness />);
    expect(screen.getByTestId('active-name')).toHaveTextContent('alice@example.com');
  });

  it('describes the active organization whole, and null in personal mode', () => {
    const { rerender } = render(<Harness />);
    expect(activeOrganization()).toMatchObject({
      kind: 'membership',
      organizationId: 'org_1',
      name: 'Acme',
      imageUrl: 'https://img/acme',
      membersCount: 3,
    });

    organization = null;
    rerender(<Harness />);
    expect(activeOrganization()).toBeNull();
  });

  // The trigger names it, so waiting on the list it belongs to would show the wrong workspace first.
  it('names the active organization from the organization itself, not the membership list', () => {
    userMemberships = list([], 0, false, true);
    render(<Harness />);

    expect(activeOrganization()).toMatchObject({ organizationId: 'org_1', name: 'Acme' });
  });

  it('reports the organization list as loading until every one of its three parts has landed', () => {
    const { rerender } = render(<Harness />);
    expect(screen.getByTestId('orgs-loading')).toHaveTextContent('false');

    userSuggestions = list([], 0, false, true);
    rerender(<Harness />);
    expect(screen.getByTestId('orgs-loading')).toHaveTextContent('true');
  });

  it('derives hasOrganizations from the membership count, not the array length', () => {
    userMemberships = list([membership('org_1', 'Acme', 3)], 0);
    const { rerender } = render(<Harness />);
    expect(screen.getByTestId('has-orgs')).toHaveTextContent('false');

    userMemberships = list([], 5);
    rerender(<Harness />);
    expect(screen.getByTestId('has-orgs')).toHaveTextContent('true');
  });

  // The surface decides whether to carry a workspace section at all from this, so waiting on the
  // list would open a section under every personal-only account and then take it away again.
  it('answers hasOrganizations from the user resource before any list has loaded', () => {
    userMemberships = list([], 0, false, true);
    user = { ...(user as FakeUser), organizationMemberships: [{ id: 'orgmem_1' }] };
    render(<Harness />);

    expect(screen.getByTestId('orgs-loading')).toHaveTextContent('true');
    expect(screen.getByTestId('has-orgs')).toHaveTextContent('true');
  });

  it('carries only sessions in additionalSessions, excluding the active one', () => {
    render(<Harness />);
    expect(screen.getByTestId('additional')).toHaveTextContent('sess_2');
    expect(screen.getByTestId('additional')).not.toHaveTextContent('sess_1');
  });

  it('maps membership, suggestion, and invitation rows with the correct kind discriminants', () => {
    render(<Harness />);

    const rows = memberships();
    expect(rows[0]).toMatchObject({ kind: 'membership', organizationId: 'org_1', name: 'Acme', membersCount: 3 });

    const suggestions = JSON.parse(screen.getByTestId('suggestions').textContent ?? '[]');
    expect(suggestions[0]).toMatchObject({
      kind: 'suggestion',
      id: 'sug_1',
      organizationId: 'org_2',
      name: 'Beta',
      status: 'pending',
    });

    expect(invitations()[0]).toMatchObject({
      kind: 'invitation',
      id: 'inv_1',
      organizationId: 'org_3',
      organizationName: 'Gamma',
      status: 'pending',
    });
  });

  // Accepting is all an invitation row offers, and an accepted one lists as the workspace it joined.
  it('lists invitations still open to the account, dropping the revoked and expired ones', () => {
    userInvitations = list(
      [
        acceptable('inv_1', 'org_3', 'Gamma'),
        acceptable('inv_2', 'org_4', 'Delta', 'accepted'),
        acceptable('inv_3', 'org_5', 'Epsilon', 'revoked'),
        acceptable('inv_4', 'org_6', 'Zeta', 'expired'),
      ],
      4,
    );
    render(<Harness />);

    expect(invitations().map((i: { id: string }) => i.id)).toEqual(['inv_1', 'inv_2']);
  });

  it('reports more to page in when any of the three lists has a next page', () => {
    const { rerender } = render(<Harness />);
    expect(screen.getByTestId('has-more')).toHaveTextContent('false');
    expect(screen.getByTestId('paging-ref')).toHaveTextContent('true');

    userSuggestions = list([], 0, true);
    rerender(<Harness />);
    expect(screen.getByTestId('has-more')).toHaveTextContent('true');
  });

  it('offers inviting members only with the manage-memberships permission', () => {
    const { rerender } = render(<Harness />);
    expect(screen.getByTestId('can-invite')).toHaveTextContent('true');
    expect(checkAuthorization).toHaveBeenCalledWith({ permission: 'org:sys_memberships:manage' });

    checkAuthorization.mockReturnValue(false);
    rerender(<Harness />);
    expect(screen.getByTestId('can-invite')).toHaveTextContent('false');
  });

  it('selects an organization via setActive, with no redirect unless one is configured', () => {
    const { rerender } = render(<Harness />);

    fireEvent.click(screen.getByText('select-org'));
    expect(setActive).toHaveBeenCalledWith({ organization: 'org_9', redirectUrl: undefined });

    rerender(<Harness afterSelectOrganizationUrl='/orgs/:id' />);
    fireEvent.click(screen.getByText('select-org'));
    expect(setActive).toHaveBeenCalledWith({ organization: 'org_9', redirectUrl: '/orgs/org_9' });

    rerender(<Harness afterSelectOrganizationUrl={org => `/o/${org.name}`} />);
    fireEvent.click(screen.getByText('select-org'));
    expect(setActive).toHaveBeenCalledWith({ organization: 'org_9', redirectUrl: '/o/Other' });
  });

  // `null` is Clerk's own name for the personal workspace. There is no organization to resolve a
  // redirect against, so `afterSelectOrganizationUrl` has nothing to say about it.
  it('selects the personal workspace by clearing the active organization', () => {
    render(<Harness afterSelectOrganizationUrl='/orgs/:id' />);

    fireEvent.click(screen.getByText('select-personal'));
    expect(setActive).toHaveBeenCalledWith({ organization: null, redirectUrl: undefined });
  });

  // Its own redirect, resolved against the user the way an organization's is resolved against the
  // organization.
  it('redirects the personal workspace to the configured afterSelectPersonalUrl', () => {
    const { rerender } = render(<Harness afterSelectPersonalUrl='/u/:id' />);

    fireEvent.click(screen.getByText('select-personal'));
    expect(setActive).toHaveBeenCalledWith({ organization: null, redirectUrl: '/u/user_1' });

    rerender(<Harness afterSelectPersonalUrl={u => `/u/${u.username}`} />);
    fireEvent.click(screen.getByText('select-personal'));
    expect(setActive).toHaveBeenCalledWith({ organization: null, redirectUrl: '/u/alice' });
  });

  // The two are configured apart, so routing the personal workspace leaves the organizations alone.
  it('keeps the personal redirect off the organizations', () => {
    render(<Harness afterSelectPersonalUrl='/u/:id' />);

    fireEvent.click(screen.getByText('select-org'));
    expect(setActive).toHaveBeenCalledWith({ organization: 'org_9', redirectUrl: undefined });
  });

  // An instance that requires an organization has no personal workspace: clerk-js refuses
  // `setActive({ organization: null })` outright there, so offering the switch would offer nothing.
  it('reports no personal workspace where the instance forces an organization', () => {
    const { rerender } = render(<Harness />);
    expect(screen.getByTestId('hide-personal')).toHaveTextContent('false');

    forceOrganizationSelection = true;
    rerender(<Harness />);
    expect(screen.getByTestId('hide-personal')).toHaveTextContent('true');
  });

  it('switches sessions and routes each sign out to the URL that matches what is left', () => {
    const { rerender } = render(<Harness />);

    fireEvent.click(screen.getByText('switch'));
    expect(setActive).toHaveBeenCalledWith(expect.objectContaining({ session: 'sess_2' }));

    // Another account stays signed in, so this is a single sign out, not a full one.
    fireEvent.click(screen.getByText('sign-out-one'));
    expect(signOut).toHaveBeenCalledWith({ sessionId: 'sess_2', redirectUrl: '/after-single-sign-out' });

    fireEvent.click(screen.getByText('sign-out-all'));
    expect(signOut).toHaveBeenCalledWith({ redirectUrl: '/after-sign-out' });

    signedInSessions = signedInSessions.slice(0, 1);
    rerender(<Harness />);
    fireEvent.click(screen.getByText('sign-out-one'));
    expect(signOut).toHaveBeenCalledWith({ sessionId: 'sess_2', redirectUrl: '/after-sign-out' });
  });

  it('drops sign-out-all and add-account in single-session mode', () => {
    singleSessionMode = true;
    render(<Harness />);
    expect(screen.getByTestId('can-sign-out-all')).toHaveTextContent('false');
    expect(screen.getByTestId('can-add-account')).toHaveTextContent('false');
  });

  // Both profiles open as a modal unless a URL routes instead, which is what the pre-Mosaic
  // UserButton and OrganizationSwitcher each do. Nothing navigates, so the page underneath stays.
  it('opens the profile modals for manage-account and manage-org', () => {
    render(<Harness />);

    fireEvent.click(screen.getByText('manage-account'));
    expect(openUserProfile).toHaveBeenCalled();

    fireEvent.click(screen.getByText('manage-org'));
    expect(openOrganizationProfile).toHaveBeenCalled();

    expect(navigate).not.toHaveBeenCalled();
  });

  // An app that mounts the button inside its own dialog or popover puts a portal root around it, and
  // the modal has to land there too or it renders behind the surface that opened it.
  it('opens the profile modals into the portal root the app configured', () => {
    render(<Harness />);

    fireEvent.click(screen.getByText('manage-account'));
    expect(openUserProfile).toHaveBeenCalledWith({ getContainer });

    fireEvent.click(screen.getByText('manage-org'));
    expect(openOrganizationProfile).toHaveBeenCalledWith({ getContainer });
  });

  // A URL is the whole opt-in: passing one means navigation, with no mode to remember to pass
  // alongside it. The two are resolved apart, so routing one profile leaves the other a modal.
  it('navigates to a profile URL when one is given, and only for that profile', () => {
    render(<Harness userProfileUrl='/account' />);

    fireEvent.click(screen.getByText('manage-account'));
    expect(navigate).toHaveBeenCalledWith('/account');
    expect(openUserProfile).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('manage-org'));
    expect(openOrganizationProfile).toHaveBeenCalled();
  });

  it('navigates to an organization profile URL when one is given', () => {
    render(<Harness organizationProfileUrl='/settings' />);

    fireEvent.click(screen.getByText('manage-org'));

    expect(navigate).toHaveBeenCalledWith('/settings');
    expect(openOrganizationProfile).not.toHaveBeenCalled();
  });

  // An explicit `navigation` is redundant next to a URL, but it is what the pre-Mosaic props accept,
  // so passing both has to resolve the same as passing the URL alone.
  it('accepts an explicit navigation mode alongside a URL', () => {
    render(
      <Harness
        organizationProfileUrl='/settings'
        organizationProfileMode='navigation'
      />,
    );

    fireEvent.click(screen.getByText('manage-org'));

    expect(navigate).toHaveBeenCalledWith('/settings');
    expect(openOrganizationProfile).not.toHaveBeenCalled();
  });

  // Invite is the other way into administering the org, so it lands wherever manage-org lands.
  // Splitting them would send one to the app's own page and the other to Clerk's.
  it('sends invite-members to the same place as manage-org', () => {
    render(<Harness organizationProfileUrl='/settings' />);

    fireEvent.click(screen.getByText('invite-members'));

    expect(navigate).toHaveBeenCalledWith('/settings');
  });

  it('navigates for create and add-account actions using clerk build URLs', () => {
    render(<Harness />);

    fireEvent.click(screen.getByText('create-org'));
    expect(navigate).toHaveBeenCalledWith('/create-org');

    fireEvent.click(screen.getByText('add-account'));
    expect(navigate).toHaveBeenCalledWith('/sign-in');
  });

  it('accepts invitations and suggestions, then revalidates whatever the accept changed', async () => {
    render(<Harness />);

    // Accepting an invitation joins the organization, so the membership list is stale too.
    const invitation = userInvitations.data[0] as ReturnType<typeof acceptable>;
    await act(async () => {
      fireEvent.click(screen.getByText('accept-invitation'));
    });
    expect(invitation.accept).toHaveBeenCalledTimes(1);
    expect(userInvitations.revalidate).toHaveBeenCalledTimes(1);
    expect(userMemberships.revalidate).toHaveBeenCalledTimes(1);

    // A suggestion only files a request an admin has yet to approve, so nothing has been joined.
    const suggestion = userSuggestions.data[0] as ReturnType<typeof acceptable>;
    await act(async () => {
      fireEvent.click(screen.getByText('accept-suggestion'));
    });
    expect(suggestion.accept).toHaveBeenCalledTimes(1);
    expect(userSuggestions.revalidate).toHaveBeenCalledTimes(1);
    expect(userMemberships.revalidate).toHaveBeenCalledTimes(1);
  });
});

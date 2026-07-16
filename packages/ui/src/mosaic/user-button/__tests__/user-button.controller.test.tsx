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
}

interface FakeSession {
  id: string;
  user: FakeUser;
}

interface FakeList {
  data: unknown[];
  count: number;
  hasNextPage: boolean;
  revalidate: ReturnType<typeof vi.fn>;
}

let isUserLoaded: boolean;
let isSessionLoaded: boolean;
let isOrgLoaded: boolean;
let user: FakeUser | null;
let session: { id: string; checkAuthorization: ReturnType<typeof vi.fn> } | null;
let organization: { id: string } | null;
let userMemberships: FakeList;
let userInvitations: FakeList;
let userSuggestions: FakeList;
let signedInSessions: FakeSession[];
let pagingRef: (element: HTMLElement | null) => void;
let singleSessionMode: boolean;

let setActive: ReturnType<typeof vi.fn>;
let signOut: ReturnType<typeof vi.fn>;
let navigate: ReturnType<typeof vi.fn>;
let checkAuthorization: ReturnType<typeof vi.fn>;

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

// The controller reads its three paginated lists through the shared in-view helper, so the fetch
// boundary is stubbed there rather than at `useOrganizationList`.
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

function list(data: unknown[], count: number, hasNextPage = false): FakeList {
  return { data, count, hasNextPage, revalidate: vi.fn().mockResolvedValue(undefined) };
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
  };
  session = { id: 'sess_1', checkAuthorization: (checkAuthorization = vi.fn().mockReturnValue(true)) };
  organization = { id: 'org_1' };
  userMemberships = list([membership('org_1', 'Acme', 3), membership('org_9', 'Other', 1)], 2);
  userInvitations = list([acceptable('inv_1', 'org_3', 'Gamma')], 1);
  userSuggestions = list([acceptable('sug_1', 'org_2', 'Beta')], 1);
  pagingRef = vi.fn();
  singleSessionMode = false;
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
      <output data-testid='active-org'>{String(c.activeOrganizationId)}</output>
      <output data-testid='has-orgs'>{String(c.hasOrganizations)}</output>
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

  it('reflects the active organization id, and null in personal mode', () => {
    const { rerender } = render(<Harness />);
    expect(screen.getByTestId('active-org')).toHaveTextContent('org_1');

    organization = null;
    rerender(<Harness />);
    expect(screen.getByTestId('active-org')).toHaveTextContent('null');
  });

  it('derives hasOrganizations from the membership count, not the array length', () => {
    userMemberships = list([membership('org_1', 'Acme', 3)], 0);
    const { rerender } = render(<Harness />);
    expect(screen.getByTestId('has-orgs')).toHaveTextContent('false');

    userMemberships = list([], 5);
    rerender(<Harness />);
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

    const invitations = JSON.parse(screen.getByTestId('invitations').textContent ?? '[]');
    expect(invitations[0]).toMatchObject({
      kind: 'invitation',
      id: 'inv_1',
      organizationId: 'org_3',
      organizationName: 'Gamma',
    });
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

  it('navigates for manage, invite, create, and add-account actions using clerk build URLs', () => {
    render(<Harness />);

    fireEvent.click(screen.getByText('manage-account'));
    expect(navigate).toHaveBeenCalledWith('/user-profile');

    fireEvent.click(screen.getByText('manage-org'));
    expect(navigate).toHaveBeenCalledWith('/org-profile');

    fireEvent.click(screen.getByText('invite-members'));
    expect(navigate).toHaveBeenCalledWith('/org-profile');

    fireEvent.click(screen.getByText('create-org'));
    expect(navigate).toHaveBeenCalledWith('/create-org');

    fireEvent.click(screen.getByText('add-account'));
    expect(navigate).toHaveBeenCalledWith('/sign-in');
  });

  it('accepts invitations and suggestions, then revalidates the collection', async () => {
    render(<Harness />);

    const invitation = userInvitations.data[0] as ReturnType<typeof acceptable>;
    await act(async () => {
      fireEvent.click(screen.getByText('accept-invitation'));
    });
    expect(invitation.accept).toHaveBeenCalledTimes(1);
    expect(userInvitations.revalidate).toHaveBeenCalledTimes(1);

    const suggestion = userSuggestions.data[0] as ReturnType<typeof acceptable>;
    await act(async () => {
      fireEvent.click(screen.getByText('accept-suggestion'));
    });
    expect(suggestion.accept).toHaveBeenCalledTimes(1);
    expect(userSuggestions.revalidate).toHaveBeenCalledTimes(1);
  });
});

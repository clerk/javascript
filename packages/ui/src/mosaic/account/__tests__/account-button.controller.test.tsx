import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAccountButtonController } from '../account-button.controller';

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
let userMemberships: { data: unknown[]; count: number; revalidate: ReturnType<typeof vi.fn> };
let userInvitations: { data: unknown[]; count: number; revalidate: ReturnType<typeof vi.fn> };
let userSuggestions: { data: unknown[]; count: number; revalidate: ReturnType<typeof vi.fn> };
let signedInSessions: FakeSession[];
let singleSessionMode: boolean;
let controllerOptions: AccountButtonControllerOptions | undefined;

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
  controllerOptions = undefined;
});

afterEach(() => {
  vi.clearAllMocks();
});

function Harness() {
  const c = useAccountButtonController(controllerOptions);
  if (c.status !== 'ready') {
    return <output data-testid='status'>{c.status}</output>;
  }
  return (
    <div>
      <output data-testid='status'>{c.status}</output>
      <output data-testid='active-name'>{c.activeAccount.name}</output>
      <output data-testid='active-email'>{c.activeAccount.email}</output>
      <output data-testid='active-session'>{c.activeAccount.sessionId}</output>
      <output data-testid='active-user'>{c.activeAccount.userId}</output>
      <output data-testid='active-org'>{String(c.activeOrganizationId)}</output>
      <output data-testid='has-orgs'>{String(c.hasOrganizations)}</output>
      <output data-testid='additional'>{c.additionalAccounts.map(a => a.userId).join(',')}</output>
      <output data-testid='can-add-account'>{String(Boolean(c.onAddAccount))}</output>
      <output data-testid='can-sign-out-all'>{String(Boolean(c.onSignOutAll))}</output>
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
        onClick={() => void c.onSelectPersonal?.()}
      >
        select-personal
      </button>
      <button
        type='button'
        onClick={() => void c.onSwitchAccount?.('sess_2')}
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
        onClick={() => void c.onManageMembers?.()}
      >
        manage-members
      </button>
      <button
        type='button'
        onClick={() => void c.onCreateOrganization?.()}
      >
        create-org
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

describe('useAccountButtonController', () => {
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
    expect(screen.getByTestId('active-user')).toHaveTextContent('user_1');

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
    userMemberships = { data: [membership('org_1', 'Acme', 3)], count: 0, revalidate: vi.fn() };
    const { rerender } = render(<Harness />);
    expect(screen.getByTestId('has-orgs')).toHaveTextContent('false');

    userMemberships = { data: [], count: 5, revalidate: vi.fn() };
    rerender(<Harness />);
    expect(screen.getByTestId('has-orgs')).toHaveTextContent('true');
  });

  it('excludes the active user session from additionalAccounts and includes the others', () => {
    render(<Harness />);
    expect(screen.getByTestId('additional')).toHaveTextContent('user_2');
    expect(screen.getByTestId('additional')).not.toHaveTextContent('user_1');
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

  it('populates membershipRequestCount only on the active org row and only with manage permission', () => {
    const { rerender } = render(<Harness />);
    let rows = memberships();
    expect(rows[0]).toMatchObject({ organizationId: 'org_1', membershipRequestCount: 4 });
    expect(rows[1].membershipRequestCount).toBeUndefined();
    expect(checkAuthorization).toHaveBeenCalledWith({ permission: 'org:sys_memberships:manage' });

    checkAuthorization.mockReturnValue(false);
    rerender(<Harness />);
    rows = memberships();
    expect(rows[0].membershipRequestCount).toBeUndefined();
    expect(rows[1].membershipRequestCount).toBeUndefined();
  });

  it('selects an organization and personal via setActive, with no redirect when no select url is configured', () => {
    render(<Harness />);

    fireEvent.click(screen.getByText('select-org'));
    expect(setActive).toHaveBeenCalledWith({ organization: 'org_9', redirectUrl: undefined });

    fireEvent.click(screen.getByText('select-personal'));
    expect(setActive).toHaveBeenCalledWith({ organization: null, redirectUrl: undefined });
  });

  it('resolves a function-form afterSelect url from the selected organization and the user', () => {
    controllerOptions = {
      afterSelectOrganizationUrl: org => `/o/${org.id}`,
      afterSelectPersonalUrl: u => `/me/${u.id}`,
    };
    render(<Harness />);

    fireEvent.click(screen.getByText('select-org'));
    expect(setActive).toHaveBeenCalledWith({ organization: 'org_9', redirectUrl: '/o/org_9' });

    fireEvent.click(screen.getByText('select-personal'));
    expect(setActive).toHaveBeenCalledWith({ organization: null, redirectUrl: '/me/user_1' });
  });

  it('resolves a token-string afterSelect url against the selected organization and the user', () => {
    controllerOptions = {
      afterSelectOrganizationUrl: '/o/:id',
      afterSelectPersonalUrl: '/me/:id',
    };
    render(<Harness />);

    fireEvent.click(screen.getByText('select-org'));
    expect(setActive).toHaveBeenCalledWith({ organization: 'org_9', redirectUrl: '/o/org_9' });

    fireEvent.click(screen.getByText('select-personal'));
    expect(setActive).toHaveBeenCalledWith({ organization: null, redirectUrl: '/me/user_1' });
  });

  it('switches and signs out sessions via setActive and signOut', () => {
    render(<Harness />);

    fireEvent.click(screen.getByText('switch'));
    expect(setActive).toHaveBeenCalledWith(expect.objectContaining({ session: 'sess_2' }));

    fireEvent.click(screen.getByText('sign-out-one'));
    expect(signOut).toHaveBeenCalledWith({ sessionId: 'sess_2', redirectUrl: '/after-single-signout' });

    fireEvent.click(screen.getByText('sign-out-all'));
    expect(signOut).toHaveBeenCalledWith({ redirectUrl: '/after-signout' });
  });

  it('signs out the only session with the after-sign-out url, not the multi-session url', () => {
    signedInSessions = [{ id: 'sess_1', user: user as FakeUser }];
    render(<Harness />);

    fireEvent.click(screen.getByText('sign-out-one'));
    expect(signOut).toHaveBeenCalledWith({ sessionId: 'sess_2', redirectUrl: '/after-signout' });
  });

  it('navigates for manage and create actions using clerk build URLs', () => {
    render(<Harness />);

    fireEvent.click(screen.getByText('manage-account'));
    expect(navigate).toHaveBeenCalledWith('/user-profile');

    fireEvent.click(screen.getByText('manage-org'));
    expect(navigate).toHaveBeenCalledWith('/org-profile');

    fireEvent.click(screen.getByText('manage-members'));
    expect(navigate).toHaveBeenCalledWith('/org-profile');

    fireEvent.click(screen.getByText('create-org'));
    expect(navigate).toHaveBeenCalledWith('/create-org');
  });

  it('offers add-account and sign-out-all in multi-session mode', () => {
    render(<Harness />);
    expect(screen.getByTestId('can-add-account')).toHaveTextContent('true');
    expect(screen.getByTestId('can-sign-out-all')).toHaveTextContent('true');
  });

  it('omits add-account and sign-out-all in single-session mode', () => {
    singleSessionMode = true;
    render(<Harness />);
    expect(screen.getByTestId('can-add-account')).toHaveTextContent('false');
    expect(screen.getByTestId('can-sign-out-all')).toHaveTextContent('false');
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

import type * as SharedReact from '@clerk/shared/react';
import { useOrganization } from '@clerk/shared/react';
import type { CustomPage } from '@clerk/shared/types';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useOrganizationListInView } from '../../../hooks/useOrganizationListInView';
import type { UserButtonModel, UserButtonModelOptions } from '../user-button.model';
import { useUserButtonModel } from '../user-button.model';

interface FakeUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  primaryEmailAddress: { emailAddress: string } | null;
  primaryPhoneNumber?: { phoneNumber: string } | null;
  primaryWeb3Wallet?: { web3Wallet: string } | null;
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
  revalidate: ReturnType<typeof vi.fn<() => Promise<void>>>;
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
let branded: boolean;
let forceOrganizationSelection: boolean;
let afterSwitchSessionUrl: string;
let organizationsEnabled: boolean;
// False stands for the window before clerk-js has hydrated it, which the model has to sit out.
let environmentHydrated: boolean;

// Built per read rather than once, so a test setting any of the flags above is answered by it.
function environment() {
  return environmentHydrated
    ? {
        displayConfig: { afterSwitchSessionUrl, branded },
        authConfig: { singleSessionMode },
        organizationSettings: { enabled: organizationsEnabled, forceOrganizationSelection },
      }
    : null;
}

let setActive: ReturnType<typeof vi.fn>;
let signOut: ReturnType<typeof vi.fn>;
let navigate: ReturnType<typeof vi.fn>;
let openUserProfile: ReturnType<typeof vi.fn>;
let openOrganizationProfile: ReturnType<typeof vi.fn>;
let openCreateOrganization: ReturnType<typeof vi.fn>;
let openInviteMembers: ReturnType<typeof vi.fn>;
let checkAuthorization: ReturnType<typeof vi.fn>;
let getContainer: () => HTMLElement | null;

vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal<typeof SharedReact>();
  return {
    ...actual,
    useUser: () => ({ isLoaded: isUserLoaded, user }),
    useSession: () => ({ isLoaded: isSessionLoaded, session }),
    useOrganization: vi.fn(() => ({ isLoaded: isOrgLoaded, organization })),
    // Stubbed with a sentinel so the assertion is that this exact function reaches Clerk, rather
    // than that some function did.
    usePortalRoot: () => getContainer,
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
      __internal_environment: environment(),
    }),
  };
});

// The model reads its three paginated lists through the shared in-view helper, so the fetch
// boundary is stubbed there rather than at `useOrganizationList`.
vi.mock('../../../hooks/useOrganizationListInView', () => ({
  useOrganizationListInView: vi.fn(() => ({ userMemberships, userInvitations, userSuggestions, ref: pagingRef })),
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
  return {
    data,
    count,
    hasNextPage,
    isLoading,
    revalidate: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  };
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
    createOrganizationEnabled: true,
  };
  session = { id: 'sess_1', checkAuthorization: (checkAuthorization = vi.fn().mockReturnValue(true)) };
  organization = { id: 'org_1', name: 'Acme', imageUrl: 'https://img/acme', membersCount: 3 };
  userMemberships = list([membership('org_1', 'Acme', 3), membership('org_9', 'Other', 1)], 2);
  userInvitations = list([acceptable('inv_1', 'org_3', 'Gamma')], 1);
  userSuggestions = list([acceptable('sug_1', 'org_2', 'Beta')], 1);
  pagingRef = vi.fn();
  singleSessionMode = false;
  branded = true;
  forceOrganizationSelection = false;
  afterSwitchSessionUrl = '/after-switch';
  organizationsEnabled = true;
  environmentHydrated = true;
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
  getContainer = () => null;
});

afterEach(() => {
  vi.clearAllMocks();
});

// Actions are promises the controller waits on, so the tests need the model itself and not only
// the buttons that fire and forget it.
let latest: UserButtonModel = { status: 'loading' };

function readyModel() {
  if (latest.status !== 'ready') {
    throw new Error(`model is ${latest.status}`);
  }
  return latest;
}

function Harness({ customPages, ...options }: UserButtonModelOptions & { customPages?: CustomPage[] } = {}) {
  const c = useUserButtonModel(options, customPages);
  latest = c;
  if (c.status !== 'ready') {
    return <output data-testid='status'>{c.status}</output>;
  }
  return (
    <div>
      <output data-testid='status'>{c.status}</output>
      <output data-testid='active-name'>{c.activeSession.name}</output>
      <output data-testid='active-identifier'>{c.activeSession.identifier}</output>
      <output data-testid='active-session'>{c.activeSession.sessionId}</output>
      <output data-testid='active-org'>{JSON.stringify(c.activeOrganization)}</output>
      <output data-testid='has-orgs'>{String(c.hasOrganizations)}</output>
      <output data-testid='orgs-enabled'>{String(c.organizationsEnabled)}</output>
      <output data-testid='branded'>{String(c.renderBranding)}</output>
      <output data-testid='hide-personal'>{String(c.hidePersonal)}</output>
      <output data-testid='orgs-loading'>{String(c.organizationsLoading)}</output>
      <output data-testid='additional'>{c.additionalSessions.map(a => a.sessionId).join(',')}</output>
      <output data-testid='has-more'>{String(c.paging?.hasMore)}</output>
      <output data-testid='paging-ref'>{String(c.paging?.ref === pagingRef)}</output>
      <output data-testid='can-invite'>{String(Boolean(c.onInviteMembers))}</output>
      <output data-testid='can-sign-out-all'>{String(Boolean(c.onSignOutAll))}</output>
      <output data-testid='can-add-account'>{String(Boolean(c.onAddAccount))}</output>
      <output data-testid='can-create-org'>{String(Boolean(c.onCreateOrganization))}</output>
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

describe('useUserButtonModel', () => {
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

  // Every instance-level answer the surface needs — organizations, single-session, forced
  // selection — comes off the environment, and it hydrates on its own schedule. Reporting ready
  // without it would mean guessing at all three and rearranging once it lands.
  it('is loading until the environment has hydrated', () => {
    environmentHydrated = false;
    const { rerender } = render(<Harness />);
    expect(screen.getByTestId('status')).toHaveTextContent('loading');

    environmentHydrated = true;
    rerender(<Harness />);
    expect(screen.getByTestId('status')).toHaveTextContent('ready');
  });

  it('reports whether the instance has organizations at all', () => {
    render(<Harness />);
    expect(screen.getByTestId('orgs-enabled')).toHaveTextContent('true');
    expect(useOrganizationListInView).toHaveBeenCalledWith({ enabled: true });

    cleanup();
    organizationsEnabled = false;
    render(<Harness />);
    expect(screen.getByTestId('orgs-enabled')).toHaveTextContent('false');
    expect(useOrganizationListInView).toHaveBeenCalledWith({ enabled: false });
  });

  it('does not fetch the organization lists until the environment says they are on', () => {
    environmentHydrated = false;
    const { rerender } = render(<Harness />);
    expect(useOrganizationListInView).toHaveBeenCalledWith({ enabled: false });

    environmentHydrated = true;
    rerender(<Harness />);
    expect(useOrganizationListInView).toHaveBeenCalledWith({ enabled: true });
  });

  it('does not treat reading the active organization as a request to enable them', () => {
    render(<Harness />);
    expect(useOrganization).toHaveBeenCalledWith({
      __internal_skipAttemptToEnableOrganizations: true,
    });
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
    expect(screen.getByTestId('active-session')).toHaveTextContent('sess_1');

    user = { ...(user as FakeUser), firstName: null, lastName: null };
    rerender(<Harness />);
    expect(screen.getByTestId('active-name')).toHaveTextContent('alice');

    user = { ...user, username: null };
    rerender(<Harness />);
    expect(screen.getByTestId('active-name')).toHaveTextContent('alice@example.com');
  });

  it('identifies the active account by username, then email, then phone, then wallet', () => {
    const { rerender } = render(<Harness />);
    expect(screen.getByTestId('active-identifier')).toHaveTextContent('alice');

    user = { ...(user as FakeUser), username: null };
    rerender(<Harness />);
    expect(screen.getByTestId('active-identifier')).toHaveTextContent('alice@example.com');

    user = { ...user, primaryEmailAddress: null, primaryPhoneNumber: { phoneNumber: '+15550100' } };
    rerender(<Harness />);
    expect(screen.getByTestId('active-identifier')).toHaveTextContent('+15550100');

    user = { ...user, primaryPhoneNumber: null, primaryWeb3Wallet: { web3Wallet: '0xabc' } };
    rerender(<Harness />);
    expect(screen.getByTestId('active-identifier')).toHaveTextContent('0xabc');
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

  // Waiting on the list would open a workspace section under every personal-only account, then
  // take it away again.
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

  // `null` is Clerk's own name for the personal workspace, and there is no organization for
  // `afterSelectOrganizationUrl` to resolve against.
  it('selects the personal workspace by clearing the active organization', () => {
    render(<Harness afterSelectOrganizationUrl='/orgs/:id' />);

    fireEvent.click(screen.getByText('select-personal'));
    expect(setActive).toHaveBeenCalledWith({ organization: null, redirectUrl: undefined });
  });

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

  // An app whose organizations are the whole product withholds it itself. The instance setting is
  // the other way in, and neither one can be talked out of it by the other.
  it('lets the app withhold the personal workspace on an instance that allows one', () => {
    const { rerender } = render(<Harness hidePersonal />);
    expect(screen.getByTestId('hide-personal')).toHaveTextContent('true');

    forceOrganizationSelection = true;
    rerender(<Harness hidePersonal={false} />);
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

  // The session switched to can land on a task of its own. A plain `redirectUrl` routes past it and
  // strands the account, so the switch hands `setActive` a callback that answers both cases.
  it('routes a switched session to its pending task, and to the after-switch URL when it has none', async () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('switch'));

    expect(setActive).toHaveBeenCalledWith({ session: 'sess_2', navigate: expect.any(Function) });
    const navigateOnSetActive = setActive.mock.calls[0][0].navigate;
    const decorateUrl = vi.fn((url: string) => url);

    await act(async () => {
      await navigateOnSetActive({ session: { currentTask: { key: 'choose-organization' } }, decorateUrl });
    });
    expect(navigate).toHaveBeenCalledWith(expect.stringContaining('/sign-in'));
    expect(navigate).toHaveBeenCalledWith(expect.stringContaining('/tasks/choose-organization'));

    await act(async () => {
      await navigateOnSetActive({ session: { currentTask: null }, decorateUrl });
    });
    expect(navigate).toHaveBeenCalledWith('/after-switch');
    // `redirectUrl` was decorated for us; taking the callback takes the Safari ITP refresh with it.
    expect(decorateUrl).toHaveBeenCalledWith('/after-switch');
  });

  // An instance can restrict who may open an organization, and a user at their creation limit is
  // restricted the same way. Offering the action anyway lands them on a page that turns them away.
  it('drops create-organization for a user who cannot open one', () => {
    const { rerender } = render(<Harness />);
    expect(screen.getByTestId('can-create-org')).toHaveTextContent('true');

    user = { ...(user as FakeUser), createOrganizationEnabled: false };
    rerender(<Harness />);
    expect(screen.getByTestId('can-create-org')).toHaveTextContent('false');
  });

  it('drops sign-out-all and add-account in single-session mode', () => {
    singleSessionMode = true;
    render(<Harness />);
    expect(screen.getByTestId('can-sign-out-all')).toHaveTextContent('false');
    expect(screen.getByTestId('can-add-account')).toHaveTextContent('false');
  });

  // An instance that has paid the branding off carries none of it, and the environment is the only
  // place that answer lives.
  it('carries the branding the instance is on, not the branding everyone gets', () => {
    render(<Harness />);
    expect(screen.getByTestId('branded')).toHaveTextContent('true');

    cleanup();
    branded = false;
    render(<Harness />);
    expect(screen.getByTestId('branded')).toHaveTextContent('false');
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

  // Custom pages are bridged into this DOM-callback form by the container, since it is the layer
  // that can render their portals. All the model owes them is a ride to the modal.
  it('hands the profile modal the custom pages it was given', () => {
    const customPages = [
      {
        label: 'Terms',
        url: 'terms',
        mount: vi.fn(),
        unmount: vi.fn(),
        mountIcon: vi.fn(),
        unmountIcon: vi.fn(),
      },
    ];
    render(<Harness customPages={customPages} />);

    fireEvent.click(screen.getByText('manage-account'));

    expect(openUserProfile).toHaveBeenCalledWith({ getContainer, customPages });
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

  // Invite opens its own modal rather than following manage-org: there is no invite page to route
  // to, so an app that routes organization management to its own page still gets the form here.
  it('opens the invite-members modal into the portal root, whatever manage-org is routed to', () => {
    render(<Harness organizationProfileUrl='/settings' />);

    fireEvent.click(screen.getByText('invite-members'));

    expect(openInviteMembers).toHaveBeenCalledWith({ getContainer });
    expect(navigate).not.toHaveBeenCalled();
  });

  // Creating an organization resolves like the two profiles do: a modal unless a URL routes
  // instead. Adding an account always leaves, since signing in cannot happen inside the popover.
  it('opens the create-organization modal into the portal root, and navigates for add-account', () => {
    render(<Harness />);

    fireEvent.click(screen.getByText('create-org'));
    expect(openCreateOrganization).toHaveBeenCalledWith({ getContainer });
    expect(navigate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('add-account'));
    expect(navigate).toHaveBeenCalledWith('/sign-in');
  });

  it('navigates to a create-organization URL when one is given', () => {
    render(<Harness createOrganizationUrl='/new-org' />);

    fireEvent.click(screen.getByText('create-org'));

    expect(navigate).toHaveBeenCalledWith('/new-org');
    expect(openCreateOrganization).not.toHaveBeenCalled();
  });

  // Without a URL there is nothing to navigate to but Clerk's own page, which is what an explicit
  // `navigation` asks for.
  it('falls back to the clerk create-organization URL for an explicit navigation mode', () => {
    render(<Harness createOrganizationMode='navigation' />);

    fireEvent.click(screen.getByText('create-org'));

    expect(navigate).toHaveBeenCalledWith('/create-org');
    expect(openCreateOrganization).not.toHaveBeenCalled();
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

  // `afterSwitchSessionUrl` is empty unless the instance sets one, and navigating to an empty URL
  // reloads the page the account just switched on.
  it('leaves the page alone on a session switch with no after-switch URL', async () => {
    afterSwitchSessionUrl = '';
    render(<Harness />);
    fireEvent.click(screen.getByText('switch'));

    const navigateOnSetActive = setActive.mock.calls[0][0].navigate;
    await act(async () => {
      await navigateOnSetActive({ session: { currentTask: null }, decorateUrl: (url: string) => url });
    });

    expect(navigate).not.toHaveBeenCalled();
  });

  // An accept is not done until the lists it changed have caught up. Settling first puts the row
  // back to offering a join for a workspace already joined, and lets the accept run a second time.
  it('waits for the revalidations before an accept settles', async () => {
    let release = () => {};
    userMemberships.revalidate.mockImplementation(() => new Promise<void>(resolve => (release = resolve)));
    render(<Harness />);

    let settled = false;
    const accepting = Promise.resolve(readyModel().onAcceptInvitation?.('inv_1')).then(() => {
      settled = true;
    });

    await act(async () => {});
    expect(settled).toBe(false);

    await act(async () => {
      release();
      await accepting;
    });
    expect(settled).toBe(true);
  });

  // A stale list is not a failed accept: the invitation was accepted either way, and failing the
  // action would re-offer a row for a workspace already joined.
  it('keeps an accept successful when a revalidation fails', async () => {
    userMemberships.revalidate.mockRejectedValue(new Error('offline'));
    render(<Harness />);

    await act(async () => {
      await expect(readyModel().onAcceptInvitation?.('inv_1')).resolves.toBeUndefined();
    });
  });
});

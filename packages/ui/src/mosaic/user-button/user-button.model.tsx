import { buildTaskUrl } from '@clerk/shared/internal/clerk-js/sessionTasks';
import { getFullName, getIdentifier } from '@clerk/shared/internal/clerk-js/user';
import { useClerk, useOrganization, usePortalRoot, useSession, useUser } from '@clerk/shared/react';
import type { CustomPage, OrganizationResource, UserResource } from '@clerk/shared/types';

import { populateParamFromObject } from '../../contexts/utils';
import { useOrganizationListInView } from '../../hooks/useOrganizationListInView';
import { useMosaicEnvironment } from '../hooks/useMosaicEnvironment';
import { useMosaicRouter } from '../hooks/useMosaicRouter';
import type {
  UserButtonBrandingProps,
  UserButtonCallbacks,
  UserButtonData,
  UserButtonInvitation,
  UserButtonMembership,
  UserButtonSession,
  UserButtonSuggestion,
} from './user-button.types';

// The controller awaits these one-shot actions to drive busy state, so the model exposes their
// promise; navigation callbacks stay fire-and-forget (`() => void`) and reach the view's DOM handlers.
interface UserButtonAsyncCallbacks {
  onSelectOrganization?: (organizationId: string | null) => void | Promise<unknown>;
  onSwitchSession?: (sessionId: string) => void | Promise<unknown>;
  onSignOutSession?: (sessionId: string) => void | Promise<unknown>;
  onSignOutAll?: () => void | Promise<unknown>;
  onAcceptSuggestion?: (suggestionId: string) => void | Promise<unknown>;
  onAcceptInvitation?: (invitationId: string) => void | Promise<unknown>;
}

export type UserButtonModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | (UserButtonData &
    Omit<UserButtonCallbacks, keyof UserButtonAsyncCallbacks> &
    UserButtonAsyncCallbacks &
    UserButtonBrandingProps & {
      status: 'ready';
      /** Whether the instance has organizations turned on at all. False forces the button to `user` mode. */
      organizationsEnabled: boolean;
    });

// Mirrors the `<OrganizationSwitcher>` `afterSelectOrganizationUrl` prop: a full URL/path, a `:token`
// path template resolved against the organization, or a builder function.
type AfterSelectUrl<T> = ((entity: T) => string) | string;

/**
 * How a profile surface opens, in the shape `<UserButton>` and `<OrganizationSwitcher>` already
 * use: a URL is the whole opt-in to navigation, and `modal` forbids one, so the pair can never
 * contradict itself. The two profiles are configured apart, so routing one leaves the other a modal.
 */
type UserProfileMode =
  | { userProfileUrl: string; userProfileMode?: 'navigation' }
  | { userProfileUrl?: never; userProfileMode?: 'modal' };

type OrganizationProfileMode =
  | { organizationProfileUrl: string; organizationProfileMode?: 'navigation' }
  | { organizationProfileUrl?: never; organizationProfileMode?: 'modal' };

type CreateOrganizationMode =
  | { createOrganizationUrl: string; createOrganizationMode?: 'navigation' }
  | { createOrganizationUrl?: never; createOrganizationMode?: 'modal' };

export type UserButtonModelOptions = UserProfileMode &
  OrganizationProfileMode &
  CreateOrganizationMode & {
    afterSelectOrganizationUrl?: AfterSelectUrl<OrganizationResource>;
    /** Where selecting the personal workspace lands. Resolved against the user, not an organization. */
    afterSelectPersonalUrl?: AfterSelectUrl<UserResource>;
    /**
     * Leaves the personal workspace out, for an app whose organizations are the whole product. An
     * instance that forces organization selection withholds it either way; this cannot opt back in.
     */
    hidePersonal?: boolean;
  };

function resolveAfterSelectUrl<T extends object>(config: AfterSelectUrl<T> | undefined, entity: T): string | undefined {
  if (typeof config === 'function') {
    return config(entity);
  }
  if (config) {
    return populateParamFromObject({ urlWithParam: config, entity });
  }
  return undefined;
}

/**
 * One rule for every surface Clerk can host: open the modal unless a URL routes instead. An explicit
 * mode has the last word; a URL on its own means navigation, so passing one is all it takes to
 * route. `url` falls back to Clerk's own so an explicit `navigation` still lands somewhere.
 */
function openOrNavigate({
  url,
  mode,
  openModal,
  buildUrl,
  navigate,
}: {
  url: string | undefined;
  mode: 'navigation' | 'modal' | undefined;
  openModal: () => void;
  buildUrl: () => string;
  navigate: (to: string) => unknown;
}): () => void {
  const resolved = mode ?? (url ? 'navigation' : 'modal');
  return resolved === 'navigation' ? () => void navigate(url ?? buildUrl()) : () => openModal();
}

const INVITE_MEMBERS_PERMISSION = 'org:sys_memberships:manage';

function displayName(user: UserResource): string {
  return getFullName(user) || getIdentifier(user);
}

function toMembership(organization: OrganizationResource): UserButtonMembership {
  return {
    kind: 'membership',
    organizationId: organization.id,
    name: organization.name,
    imageUrl: organization.imageUrl || undefined,
    membersCount: organization.membersCount,
  };
}

function toSession(sessionId: string, user: UserResource): UserButtonSession {
  return {
    sessionId,
    name: displayName(user),
    identifier: getIdentifier(user),
    imageUrl: user.imageUrl,
  };
}

/**
 * @param userProfileCustomPages - The consumer's custom pages, already bridged into clerk-js's
 *   DOM-callback form. The wrapper owns that conversion because it is the layer that can render
 *   the portals behind it, so they arrive here ready to forward and stay out of the public options.
 */
export function useUserButtonModel(
  options?: UserButtonModelOptions,
  userProfileCustomPages?: CustomPage[],
): UserButtonModel {
  const { isLoaded: isUserLoaded, user } = useUser();
  const { isLoaded: isSessionLoaded, session } = useSession();
  const { isLoaded: isOrgLoaded, organization } = useOrganization();
  const clerk = useClerk();
  const router = useMosaicRouter();
  // An app can mount the button inside its own dialog or popover; the modal has to portal into that
  // same root or it renders behind the surface that opened it.
  const getContainer = usePortalRoot();
  const environment = useMosaicEnvironment();
  // Don't fetch orgsLists until we know orgs are enabled.
  // This wont delay rendering of the trigger, or even the popup shell, since the "ready" status
  // does not depend on this.
  const { userMemberships, userInvitations, userSuggestions, ref } = useOrganizationListInView({
    enabled: Boolean(environment?.organizationSettings.enabled),
  });

  const manageAccount = openOrNavigate({
    url: options?.userProfileUrl,
    mode: options?.userProfileMode,
    openModal: () => clerk.openUserProfile({ getContainer, customPages: userProfileCustomPages }),
    buildUrl: () => clerk.buildUserProfileUrl(),
    navigate: router.navigate,
  });

  const manageOrganization = openOrNavigate({
    url: options?.organizationProfileUrl,
    mode: options?.organizationProfileMode,
    openModal: () => clerk.openOrganizationProfile({ getContainer }),
    buildUrl: () => clerk.buildOrganizationProfileUrl(),
    navigate: router.navigate,
  });

  const createOrganization = openOrNavigate({
    url: options?.createOrganizationUrl,
    mode: options?.createOrganizationMode,
    openModal: () => clerk.openCreateOrganization({ getContainer }),
    buildUrl: () => clerk.buildCreateOrganizationUrl(),
    navigate: router.navigate,
  });

  // Organizations, single-session and forced selection all come off the environment, and it
  // hydrates on its own schedule. Waiting for it beats guessing at three answers and rearranging.
  if (!isUserLoaded || !isSessionLoaded || !isOrgLoaded || !environment) {
    return { status: 'loading' };
  }

  if (!user || !session) {
    return { status: 'hidden' };
  }

  const { displayConfig, authConfig, organizationSettings } = environment;
  // clerk-js refuses `setActive({ organization: null })` outright on an instance that forces
  // organization selection, so there is no personal workspace to offer a way back to.
  const { enabled: organizationsEnabled, forceOrganizationSelection } = organizationSettings;
  const { singleSessionMode } = authConfig;

  const canInviteMembers = session.checkAuthorization({ permission: INVITE_MEMBERS_PERMISSION }) ?? false;
  const membershipData = userMemberships.data ?? [];
  const suggestionData = userSuggestions.data ?? [];
  const invitationData = userInvitations.data ?? [];

  const memberships: UserButtonMembership[] = membershipData.map(m => toMembership(m.organization));

  const suggestions: UserButtonSuggestion[] = suggestionData.map(s => ({
    kind: 'suggestion',
    id: s.id,
    organizationId: s.publicOrganizationData.id,
    name: s.publicOrganizationData.name,
    imageUrl: s.publicOrganizationData.imageUrl || undefined,
    status: s.status,
  }));

  // Accepting is all an invitation row offers, so a revoked or expired one has nothing to offer.
  const invitations: UserButtonInvitation[] = invitationData.flatMap(i =>
    i.status === 'pending' || i.status === 'accepted'
      ? [
        {
          kind: 'invitation',
          id: i.id,
          status: i.status,
          organizationId: i.publicOrganizationData.id,
          organizationName: i.publicOrganizationData.name,
          imageUrl: i.publicOrganizationData.imageUrl || undefined,
        },
      ]
      : [],
  );

  // Organization requests are scoped to the session that makes them, so another account's
  // workspaces are unknowable until it is the active one. Sessions are all we can hand over.
  const additionalSessions: UserButtonSession[] = (clerk.client?.signedInSessions ?? []).flatMap(s => {
    const sessionUser = s.user;
    if (!sessionUser || s.id === session.id) {
      return [];
    }
    return [toSession(s.id, sessionUser)];
  });

  // `null` is Clerk's own name for the personal workspace, and it has no organization to resolve
  // against, so it takes its own URL rather than the organizations'.
  const afterSelectUrl = (organizationId: string | null): string | undefined => {
    if (!organizationId) {
      return resolveAfterSelectUrl(options?.afterSelectPersonalUrl, user);
    }
    const selected = membershipData.find(m => m.organization.id === organizationId)?.organization;
    return selected ? resolveAfterSelectUrl(options?.afterSelectOrganizationUrl, selected) : undefined;
  };

  return {
    status: 'ready',
    organizationsEnabled,
    renderBranding: displayConfig.branded,
    activeSession: toSession(session.id, user),
    activeOrganization: organization ? toMembership(organization) : null,
    // The user resource carries its own memberships, so whether the account has any is settled
    // before the paginated list is asked. The fetched count still counts, in case the resource is
    // behind the server.
    hasOrganizations: user.organizationMemberships.length > 0 || (userMemberships.count ?? 0) > 0,
    hidePersonal: forceOrganizationSelection || (options?.hidePersonal ?? false),
    // `isLoading` is "a request is out and nothing has come back", which is the only window where
    // an empty list is indistinguishable from one that has not arrived. Paging in later pages
    // leaves it false, since by then the list is already on screen.
    organizationsLoading: userMemberships.isLoading || userInvitations.isLoading || userSuggestions.isLoading,
    memberships,
    suggestions,
    invitations,
    additionalSessions,
    paging: {
      ref,
      hasMore: Boolean(userMemberships.hasNextPage || userInvitations.hasNextPage || userSuggestions.hasNextPage),
    },
    onSelectOrganization: organizationId =>
      clerk.setActive({ organization: organizationId, redirectUrl: afterSelectUrl(organizationId) }),
    // The session switched to can carry a task of its own, and a plain `redirectUrl` routes past it.
    // App-level `taskUrls` outrank this callback, so it only answers for an app that set none.
    onSwitchSession: sessionId =>
      clerk.setActive({
        session: sessionId,
        navigate: async ({ session, decorateUrl }) => {
          const task = session.currentTask;
          if (task) {
            await router.navigate(buildTaskUrl(task, { base: clerk.buildSignInUrl() }));
            return;
          }
          // `redirectUrl` decorated for us; taking the callback takes the Safari ITP refresh with it.
          await router.navigate(decorateUrl(displayConfig.afterSwitchSessionUrl));
        },
      }),
    onSignOutSession: sessionId =>
      clerk.signOut({
        sessionId,
        // Other accounts stay signed in, so route to the single-session-out URL; otherwise this is
        // a full sign out.
        redirectUrl:
          additionalSessions.length > 0 ? clerk.buildAfterMultiSessionSingleSignOutUrl() : clerk.buildAfterSignOutUrl(),
      }),
    // Single-session apps cannot hold a second account, so adding one and signing out of "all
    // accounts" are meaningless there; the per-account sign out on the active row remains.
    onSignOutAll: singleSessionMode ? undefined : () => clerk.signOut({ redirectUrl: clerk.buildAfterSignOutUrl() }),
    onManageAccount: manageAccount,
    onManageOrganization: manageOrganization,
    // Invite has no page of its own to route to, so it opens its modal even where managing the
    // organization is routed to the app's own page.
    onInviteMembers: canInviteMembers ? () => clerk.openInviteMembers({ getContainer }) : undefined,
    // The instance can restrict who opens an organization, and the flag also goes false once a user
    // reaches their creation limit, so it covers both ways the action can be unavailable.
    onCreateOrganization: user.createOrganizationEnabled ? createOrganization : undefined,
    onAddAccount: singleSessionMode ? undefined : () => void router.navigate(clerk.buildSignInUrl()),
    onAcceptSuggestion: suggestionId => {
      const suggestion = suggestionData.find(s => s.id === suggestionId);
      return Promise.resolve(suggestion?.accept()).finally(() => void userSuggestions.revalidate?.());
    },
    // Accepting an invitation joins the organization, so the membership list is stale too. A
    // suggestion only files a request an admin has yet to approve, so nothing has been joined.
    onAcceptInvitation: invitationId => {
      const invitation = invitationData.find(i => i.id === invitationId);
      return Promise.resolve(invitation?.accept()).finally(() => {
        void userInvitations.revalidate?.();
        void userMemberships.revalidate?.();
      });
    },
  };
}

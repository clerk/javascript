import { buildTaskUrl } from '@clerk/shared/internal/clerk-js/sessionTasks';
import { getFullName, getIdentifier } from '@clerk/shared/internal/clerk-js/user';
import { useClerk, useOrganization, usePortalRoot, useSession, useUser } from '@clerk/shared/react';
import type { OrganizationResource, UserResource } from '@clerk/shared/types';

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

// Promise-returning so the controller can drive busy state. Navigation callbacks stay fire-and-forget.
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

// Mirrors `<OrganizationSwitcher>`: a URL, a `:token` template resolved against the entity, or a builder.
type AfterSelectUrl<T> = ((entity: T) => string) | string;

/** A URL is the whole opt-in to navigation, and `modal` forbids one, so the pair cannot contradict itself. */
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
     * Leaves the personal workspace out. An instance that forces organization selection withholds it
     * either way, so this cannot opt back in.
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

/** Opens the modal unless a URL routes instead. An explicit mode wins; a URL on its own means navigation. */
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

export function useUserButtonModel(options?: UserButtonModelOptions): UserButtonModel {
  const { isLoaded: isUserLoaded, user } = useUser();
  const { isLoaded: isSessionLoaded, session } = useSession();
  const { isLoaded: isOrgLoaded, organization } = useOrganization();
  const { userMemberships, userInvitations, userSuggestions, ref } = useOrganizationListInView();

  const clerk = useClerk();
  const router = useMosaicRouter();
  // The modal must portal into the app's own dialog root, or it renders behind the surface that opened it.
  const getContainer = usePortalRoot();
  const environment = useMosaicEnvironment();

  const manageAccount = openOrNavigate({
    url: options?.userProfileUrl,
    mode: options?.userProfileMode,
    openModal: () => clerk.openUserProfile({ getContainer }),
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

  // These all affect layout, so wait for every one and avoid a reshuffle.
  if (!isUserLoaded || !isSessionLoaded || !isOrgLoaded || !environment) {
    return { status: 'loading' };
  }

  if (!user || !session) {
    return { status: 'hidden' };
  }

  const { displayConfig, authConfig, organizationSettings } = environment;
  // clerk-js refuses `setActive({ organization: null })` when selection is forced, so there is no way back.
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

  // Accepting is all a row offers, so a revoked or expired invitation has nothing to show.
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

  // Organization requests are scoped to the active session, so another account's workspaces are unknowable.
  const additionalSessions: UserButtonSession[] = (clerk.client?.signedInSessions ?? []).flatMap(s => {
    const sessionUser = s.user;
    if (!sessionUser || s.id === session.id) {
      return [];
    }
    return [toSession(s.id, sessionUser)];
  });

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
    // The user resource settles this before the paginated list answers; the count covers a stale resource.
    hasOrganizations: user.organizationMemberships.length > 0 || (userMemberships.count ?? 0) > 0,
    hidePersonal: forceOrganizationSelection || (options?.hidePersonal ?? false),
    // Only true before the first page lands, which is the one window where empty and pending look alike.
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
        // Other accounts stay signed in, so this is a single sign out rather than a full one.
        redirectUrl:
          additionalSessions.length > 0 ? clerk.buildAfterMultiSessionSingleSignOutUrl() : clerk.buildAfterSignOutUrl(),
      }),
    // Single-session apps cannot hold a second account, so both actions are meaningless there.
    onSignOutAll: singleSessionMode ? undefined : () => clerk.signOut({ redirectUrl: clerk.buildAfterSignOutUrl() }),
    onManageAccount: manageAccount,
    onManageOrganization: manageOrganization,
    // Invite has no page of its own to route to, so it opens its modal even when management is routed.
    onInviteMembers: canInviteMembers ? () => clerk.openInviteMembers({ getContainer }) : undefined,
    // Covers both restricted instances and users at their creation limit.
    onCreateOrganization: user.createOrganizationEnabled ? createOrganization : undefined,
    onAddAccount: singleSessionMode ? undefined : () => void router.navigate(clerk.buildSignInUrl()),
    onAcceptSuggestion: suggestionId => {
      const suggestion = suggestionData.find(s => s.id === suggestionId);
      return Promise.resolve(suggestion?.accept()).finally(() => void userSuggestions.revalidate?.());
    },
    // Accepting joins the organization, so memberships are stale too. A suggestion joins nothing.
    onAcceptInvitation: invitationId => {
      const invitation = invitationData.find(i => i.id === invitationId);
      return Promise.resolve(invitation?.accept()).finally(() => {
        void userInvitations.revalidate?.();
        void userMemberships.revalidate?.();
      });
    },
  };
}

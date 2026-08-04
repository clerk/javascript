import { useClerk, useOrganization, useSession, useUser } from '@clerk/shared/react';
import type { OrganizationResource, UserResource } from '@clerk/shared/types';

import { populateParamFromObject } from '../../contexts/utils';
import { useOrganizationListInView } from '../../hooks/useOrganizationListInView';
import { useMosaicEnvironment } from '../hooks/useMosaicEnvironment';
import { useMosaicRouter } from '../hooks/useMosaicRouter';
import type {
  UserButtonCallbacks,
  UserButtonData,
  UserButtonInvitation,
  UserButtonMembership,
  UserButtonSession,
  UserButtonSuggestion,
} from './user-button.view';

// The container awaits these one-shot actions to drive busy state, so the controller exposes their
// promise; navigation callbacks stay fire-and-forget (`() => void`) and reach the view's DOM handlers.
interface UserButtonAsyncCallbacks {
  onSelectOrganization?: (organizationId: string) => void | Promise<unknown>;
  onSwitchSession?: (sessionId: string) => void | Promise<unknown>;
  onSignOutSession?: (sessionId: string) => void | Promise<unknown>;
  onSignOutAll?: () => void | Promise<unknown>;
  onAcceptSuggestion?: (suggestionId: string) => void | Promise<unknown>;
  onAcceptInvitation?: (invitationId: string) => void | Promise<unknown>;
}

export type UserButtonController =
  | { status: 'loading' }
  | { status: 'hidden' }
  | (UserButtonData &
      Omit<UserButtonCallbacks, keyof UserButtonAsyncCallbacks> &
      UserButtonAsyncCallbacks & { status: 'ready' });

// Mirrors the `<OrganizationSwitcher>` `afterSelectOrganizationUrl` prop: a full URL/path, a `:token`
// path template resolved against the organization, or a builder function.
type AfterSelectUrl<T> = ((entity: T) => string) | string;

export interface UserButtonControllerOptions {
  afterSelectOrganizationUrl?: AfterSelectUrl<OrganizationResource>;
}

function resolveAfterSelectUrl(
  config: AfterSelectUrl<OrganizationResource> | undefined,
  entity: OrganizationResource,
): string | undefined {
  if (typeof config === 'function') {
    return config(entity);
  }
  if (config) {
    return populateParamFromObject({ urlWithParam: config, entity });
  }
  return undefined;
}

const INVITE_MEMBERS_PERMISSION = 'org:sys_memberships:manage';

function displayName(user: UserResource): string {
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  if (full) {
    return full;
  }
  if (user.username) {
    return user.username;
  }
  return user.primaryEmailAddress?.emailAddress ?? '';
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
    email: user.primaryEmailAddress?.emailAddress ?? '',
    imageUrl: user.imageUrl,
  };
}

export function useUserButtonController(options?: UserButtonControllerOptions): UserButtonController {
  const { isLoaded: isUserLoaded, user } = useUser();
  const { isLoaded: isSessionLoaded, session } = useSession();
  const { isLoaded: isOrgLoaded, organization } = useOrganization();
  const { userMemberships, userInvitations, userSuggestions, ref } = useOrganizationListInView();

  const clerk = useClerk();
  const router = useMosaicRouter();
  const environment = useMosaicEnvironment();
  const displayConfig = environment?.displayConfig;
  const singleSessionMode = environment?.authConfig?.singleSessionMode ?? false;

  if (!isUserLoaded || !isSessionLoaded || !isOrgLoaded) {
    return { status: 'loading' };
  }

  if (!user || !session) {
    return { status: 'hidden' };
  }

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

  return {
    status: 'ready',
    activeSession: toSession(session.id, user),
    activeOrganization: organization ? toMembership(organization) : null,
    hasOrganizations: (userMemberships.count ?? 0) > 0,
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
    onSelectOrganization: organizationId => {
      const selected = membershipData.find(m => m.organization.id === organizationId)?.organization;
      return clerk.setActive({
        organization: organizationId,
        redirectUrl: selected ? resolveAfterSelectUrl(options?.afterSelectOrganizationUrl, selected) : undefined,
      });
    },
    onSwitchSession: sessionId =>
      clerk.setActive({ session: sessionId, redirectUrl: displayConfig?.afterSwitchSessionUrl }),
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
    onManageAccount: () => void router.navigate(clerk.buildUserProfileUrl()),
    onManageOrganization: () => void router.navigate(clerk.buildOrganizationProfileUrl()),
    onInviteMembers: canInviteMembers ? () => void router.navigate(clerk.buildOrganizationProfileUrl()) : undefined,
    onCreateOrganization: () => void router.navigate(clerk.buildCreateOrganizationUrl()),
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

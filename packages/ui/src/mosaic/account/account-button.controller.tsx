import { useClerk, useOrganization, useOrganizationList, useSession, useUser } from '@clerk/shared/react';
import type { UserResource } from '@clerk/shared/types';

import { organizationListParams } from '../../components/OrganizationSwitcher/utils';
import { useMosaicEnvironment } from '../hooks/useMosaicEnvironment';
import { useMosaicRouter } from '../hooks/useMosaicRouter';
import type {
  AccountButtonAccount,
  AccountButtonCallbacks,
  AccountButtonData,
  AccountButtonInvitation,
  AccountButtonMembership,
  AccountButtonSuggestion,
} from './account-button.view';

export type AccountButtonController =
  | { status: 'loading' }
  | { status: 'hidden' }
  | (AccountButtonData & AccountButtonCallbacks & { status: 'ready' });

const MANAGE_MEMBERS_PERMISSION = 'org:sys_memberships:manage';

function accountName(user: UserResource): string {
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  if (full) {
    return full;
  }
  if (user.username) {
    return user.username;
  }
  return user.primaryEmailAddress?.emailAddress ?? '';
}

function toAccount(sessionId: string, user: UserResource): AccountButtonAccount {
  return {
    sessionId,
    userId: user.id,
    name: accountName(user),
    email: user.primaryEmailAddress?.emailAddress ?? '',
    imageUrl: user.imageUrl,
  };
}

export function useAccountButtonController(): AccountButtonController {
  const { isLoaded: isUserLoaded, user } = useUser();
  const { isLoaded: isSessionLoaded, session } = useSession();

  // The session resolves before the org fetch, so gate the membership-requests
  // fetch on the manage permission to avoid requesting a count we cannot show.
  const canManageMembers = session?.checkAuthorization({ permission: MANAGE_MEMBERS_PERMISSION }) ?? false;
  const {
    isLoaded: isOrgLoaded,
    organization,
    membershipRequests,
  } = useOrganization({ membershipRequests: canManageMembers ? true : undefined });
  const { userMemberships, userInvitations, userSuggestions } = useOrganizationList(organizationListParams);

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

  const activeOrganizationId = organization?.id ?? null;
  const membershipData = userMemberships.data ?? [];
  const suggestionData = userSuggestions.data ?? [];
  const invitationData = userInvitations.data ?? [];

  const memberships: AccountButtonMembership[] = membershipData.map(m => ({
    kind: 'membership',
    organizationId: m.organization.id,
    name: m.organization.name,
    imageUrl: m.organization.imageUrl || undefined,
    membersCount: m.organization.membersCount,
    membershipRequestCount:
      canManageMembers && m.organization.id === activeOrganizationId ? membershipRequests?.count : undefined,
  }));

  const suggestions: AccountButtonSuggestion[] = suggestionData.map(s => ({
    kind: 'suggestion',
    id: s.id,
    organizationId: s.publicOrganizationData.id,
    name: s.publicOrganizationData.name,
    imageUrl: s.publicOrganizationData.imageUrl || undefined,
    status: s.status,
  }));

  const invitations: AccountButtonInvitation[] = invitationData.map(i => ({
    kind: 'invitation',
    id: i.id,
    organizationId: i.publicOrganizationData.id,
    organizationName: i.publicOrganizationData.name,
    imageUrl: i.publicOrganizationData.imageUrl || undefined,
  }));

  const additionalAccounts: AccountButtonAccount[] = (clerk.client?.signedInSessions ?? []).flatMap(s => {
    const sessionUser = s.user;
    if (!sessionUser || sessionUser.id === user.id) {
      return [];
    }
    return [toAccount(s.id, sessionUser)];
  });

  return {
    status: 'ready',
    activeAccount: toAccount(session.id, user),
    activeOrganizationId,
    hasOrganizations: (userMemberships.count ?? 0) > 0,
    memberships,
    suggestions,
    invitations,
    additionalAccounts,
    onSelectOrganization: organizationId =>
      clerk.setActive({ organization: organizationId, redirectUrl: displayConfig?.afterCreateOrganizationUrl }),
    onSelectPersonal: () => clerk.setActive({ organization: null }),
    onSwitchAccount: sessionId =>
      clerk.setActive({ session: sessionId, redirectUrl: displayConfig?.afterSwitchSessionUrl }),
    onSignOutSession: sessionId => clerk.signOut({ sessionId }),
    // Single-session apps cannot hold a second session, so adding an account and signing out of
    // "all accounts" are meaningless there; the per-session sign out on the active row remains.
    onSignOutAll: singleSessionMode ? undefined : () => clerk.signOut(),
    onManageAccount: () => router.navigate(clerk.buildUserProfileUrl()),
    onManageOrganization: () => router.navigate(clerk.buildOrganizationProfileUrl()),
    onManageMembers: () => router.navigate(clerk.buildOrganizationProfileUrl()),
    onCreateOrganization: () => router.navigate(clerk.buildCreateOrganizationUrl()),
    onAddAccount: singleSessionMode ? undefined : () => router.navigate(clerk.buildSignInUrl()),
    onAcceptSuggestion: suggestionId => {
      const suggestion = suggestionData.find(s => s.id === suggestionId);
      return Promise.resolve(suggestion?.accept()).finally(() => void userSuggestions.revalidate?.());
    },
    onAcceptInvitation: invitationId => {
      const invitation = invitationData.find(i => i.id === invitationId);
      return Promise.resolve(invitation?.accept()).finally(() => void userInvitations.revalidate?.());
    },
  };
}

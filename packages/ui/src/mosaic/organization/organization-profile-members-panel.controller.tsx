import { useOrganization, useSession, useUser } from '@clerk/shared/react';

import type { Snapshot } from '../machine/types';
import { useMachine } from '../machine/useMachine';
import type {
  OrganizationProfileMembersPanelContext,
  OrganizationProfileMembersPanelEvent,
} from './organization-profile-members-panel.machine';
import { organizationProfileMembersPanelMachine } from './organization-profile-members-panel.machine';

/** A single active member, reduced to plain data the view can render without Clerk. */
export interface MemberRow {
  id: string;
  /** Display name, falling back to the identifier when no name is set. */
  name: string;
  /** Email / phone / username used to identify the user. */
  identifier: string;
  /** Human-readable role label (`roleName`, falling back to the raw role key). */
  roleLabel: string;
  /** Locale-formatted join date. */
  joinedAt: string;
  /** Whether this row is the signed-in user (their own remove action is disabled). */
  isCurrentUser: boolean;
  /** Whether the member is banned (surfaced as a badge). */
  isBanned: boolean;
  /** Dispatches the removal for this member; wired by the controller so the view stays Clerk-free. */
  onRemove: () => void;
}

type OrganizationProfileMembersPanelController =
  | { status: 'loading' }
  | { status: 'hidden' }
  | {
      status: 'ready';
      snapshot: Snapshot<OrganizationProfileMembersPanelContext>;
      send: (event: OrganizationProfileMembersPanelEvent) => void;
      rows: MemberRow[];
      /** Whether the user can manage memberships (gates the remove action). */
      canManage: boolean;
      page: number;
      pageCount: number;
      /** First-page load with no data yet — the view shows a skeleton. */
      isLoading: boolean;
      onPageChange: (page: number) => void;
    };

function memberName(firstName: string | null, lastName: string | null, identifier: string): string {
  const full = [firstName, lastName].filter(Boolean).join(' ').trim();
  return full || identifier;
}

export function useOrganizationProfileMembersPanelController(): OrganizationProfileMembersPanelController {
  const [snapshot, send] = useMachine(organizationProfileMembersPanelMachine);
  const { isLoaded: isSessionLoaded, session } = useSession();
  const { user } = useUser();

  // Permissions gate both what we fetch and what the view can do. Computing them
  // from the session (which is available before the org fetch resolves) lets us
  // skip requesting memberships the user isn't allowed to read.
  const canRead = session?.checkAuthorization({ permission: 'org:sys_memberships:read' }) ?? false;
  const canManage = session?.checkAuthorization({ permission: 'org:sys_memberships:manage' }) ?? false;

  const {
    isLoaded: isOrganizationLoaded,
    organization,
    memberships,
  } = useOrganization({
    memberships: canRead ? { keepPreviousData: true, query: snapshot.context.query || undefined } : undefined,
  });

  // Both the session and the organization must be resolved before we can decide
  // between 'ready' and 'hidden' — treat either still loading as 'loading'.
  if (!isSessionLoaded || !isOrganizationLoaded) {
    return { status: 'loading' };
  }

  if (!organization || !canRead) {
    return { status: 'hidden' };
  }

  const currentUserId = user?.id;
  const rows: MemberRow[] = (memberships?.data ?? []).map(membership => {
    const publicUserData = membership.publicUserData;
    return {
      id: membership.id,
      name: memberName(
        publicUserData?.firstName ?? null,
        publicUserData?.lastName ?? null,
        publicUserData?.identifier ?? '',
      ),
      identifier: publicUserData?.identifier ?? '',
      roleLabel: membership.roleName || membership.role,
      joinedAt: membership.createdAt.toLocaleDateString(),
      isCurrentUser: !!currentUserId && publicUserData?.userId === currentUserId,
      isBanned: !!publicUserData?.banned,
      onRemove: () =>
        send({
          type: 'REMOVE_MEMBER',
          membershipId: membership.id,
          run: async () => {
            await membership.destroy();
            // Refresh the list so the removed row disappears. Not awaited: a stale
            // list must not make a successful removal look like it failed.
            void memberships?.revalidate?.();
          },
        }),
    };
  });

  return {
    status: 'ready',
    snapshot,
    send,
    rows,
    canManage,
    page: memberships?.page ?? 1,
    pageCount: memberships?.pageCount ?? 0,
    isLoading: !!memberships?.isLoading && (memberships?.data?.length ?? 0) === 0,
    onPageChange: (page: number) => {
      void memberships?.fetchPage?.(page);
    },
  };
}

import { useOrganization, useOrganizationList, useUser } from '@clerk/shared/react';

import { useMosaicEnvironment } from '../hooks/useMosaicEnvironment';
import { useMosaicRouter } from '../hooks/useMosaicRouter';
import type { Snapshot } from '../machine/types';
import { useMachine } from '../machine/useMachine';
import type { LeaveOrgContext, LeaveOrgEvent } from './leave-organization.machine';
import { leaveOrgMachine } from './leave-organization.machine';

type LeaveOrganizationController =
  | { status: 'loading' }
  | { status: 'hidden' }
  | {
      status: 'ready';
      snapshot: Snapshot<LeaveOrgContext>;
      send: (event: LeaveOrgEvent) => void;
      canSubmit: boolean;
    };

export function useLeaveOrganizationController(): LeaveOrganizationController {
  const { isLoaded, organization, membership } = useOrganization();
  const { user } = useUser();
  const { userMemberships } = useOrganizationList({ userMemberships: true });
  const router = useMosaicRouter();
  const afterLeaveUrl = useMosaicEnvironment()?.displayConfig.afterLeaveOrganizationUrl;

  const [snapshot, send, actor] = useMachine(leaveOrgMachine, {
    context: {
      organizationName: organization?.name ?? '',
      leaveOrganization: async () => {
        // Self-leave hits `/me/organization_memberships/{orgId}`. `membership.destroy()`
        // is the admin remove-member endpoint (needs publicUserData.userId, which the
        // current user's own membership lacks), so it 404s — mirror legacy and use
        // `user.leaveOrganization`.
        if (organization) {
          await user?.leaveOrganization(organization.id);
        }
        // Refresh org lists elsewhere (e.g. the switcher). Not awaited: a stale
        // list must not make a successful leave look like it failed.
        void userMemberships.revalidate?.();
        // Navigate away from the left org's profile, mirroring legacy
        // navigateAfterLeaveOrganization. Fire-and-forget for the same reason.
        if (afterLeaveUrl) {
          void router.navigate(afterLeaveUrl);
        }
      },
    },
  });

  // `membership === undefined` means Clerk is still hydrating it (e.g. SSR), so
  // keep it in 'loading'. Only an explicit `null` means there is no membership
  // to leave, which is genuinely 'hidden'.
  if (!isLoaded || membership === undefined) {
    return { status: 'loading' };
  }

  if (!organization || membership === null) {
    return { status: 'hidden' };
  }

  return {
    status: 'ready',
    snapshot,
    send,
    canSubmit: actor.can({ type: 'CONFIRM' }),
  };
}

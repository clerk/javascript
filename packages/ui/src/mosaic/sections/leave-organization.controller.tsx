import { useOrganization, useOrganizationList } from '@clerk/shared/react';

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
  const { userMemberships } = useOrganizationList({ userMemberships: true });

  const [snapshot, send, actor] = useMachine(leaveOrgMachine, {
    context: {
      organizationName: organization?.name ?? '',
      leaveOrganization: async () => {
        await membership?.destroy();
        // Refresh org lists elsewhere (e.g. the switcher). Not awaited: a stale
        // list must not make a successful leave look like it failed.
        void userMemberships.revalidate?.();
        // TODO(mosaic): navigate away from the left org's profile once the flow
        // has router context, mirroring legacy navigateAfterLeaveOrganization.
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

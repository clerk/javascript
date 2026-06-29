import { useOrganization, useOrganizationList } from '@clerk/shared/react';

import { useMachine } from '../machine/useMachine';
import { leaveOrgMachine } from './leave-organization-machine';

export function useLeaveOrganizationController() {
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

  if (!isLoaded || !organization || !membership) {
    return { status: 'loading' as const };
  }

  return {
    status: 'ready' as const,
    snapshot,
    send,
    canSubmit: actor.can({ type: 'CONFIRM' }),
  };
}

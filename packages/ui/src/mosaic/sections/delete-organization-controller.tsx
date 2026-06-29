import { useOrganization, useOrganizationList } from '@clerk/shared/react';

import { useMachine } from '../machine/useMachine';
import { deleteOrgMachine } from './delete-organization-machine';

export function useDeleteOrganizationController() {
  const { isLoaded, organization } = useOrganization();
  const { userMemberships } = useOrganizationList({ userMemberships: true });

  const [snapshot, send, actor] = useMachine(deleteOrgMachine, {
    context: {
      organizationName: organization?.name ?? '',
      destroyOrganization: async () => {
        await organization?.destroy();
        // Refresh org lists elsewhere (e.g. the switcher). Not awaited: a stale
        // list must not make a successful delete look like it failed.
        void userMemberships.revalidate?.();
        // TODO(mosaic): navigate away from the deleted org's profile once the flow
        // has router context, mirroring legacy navigateAfterLeaveOrganization.
      },
    },
  });

  if (!isLoaded || !organization) {
    return { status: 'loading' as const };
  }

  return {
    status: 'ready' as const,
    snapshot,
    send,
    canSubmit: actor.can({ type: 'CONFIRM' }),
  };
}

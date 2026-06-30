import { useOrganization, useOrganizationList, useSession } from '@clerk/shared/react';

import type { Snapshot } from '../machine/types';
import { useMachine } from '../machine/useMachine';
import type { DeleteOrgContext, DeleteOrgEvent } from './delete-organization-machine';
import { deleteOrgMachine } from './delete-organization-machine';

type DeleteOrganizationController =
  | { status: 'loading' }
  | { status: 'hidden' }
  | {
      status: 'ready';
      snapshot: Snapshot<DeleteOrgContext>;
      send: (event: DeleteOrgEvent) => void;
      canSubmit: boolean;
    };

export function useDeleteOrganizationController(): DeleteOrganizationController {
  const { isLoaded, organization } = useOrganization();
  const { session } = useSession();
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

  if (!isLoaded) {
    return { status: 'loading' };
  }

  const canDelete = session?.checkAuthorization({ permission: 'org:sys_profile:delete' }) ?? false;
  if (!organization || !canDelete || !organization.adminDeleteEnabled) {
    return { status: 'hidden' };
  }

  return {
    status: 'ready',
    snapshot,
    send,
    canSubmit: actor.can({ type: 'CONFIRM' }),
  };
}

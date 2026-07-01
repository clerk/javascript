import { useOrganization, useOrganizationList, useSession } from '@clerk/shared/react';

import { useMosaicEnvironment } from '../hooks/useMosaicEnvironment';
import { useMosaicRouter } from '../hooks/useMosaicRouter';
import type { Snapshot } from '../machine/types';
import { useMachine } from '../machine/useMachine';
import type {
  OrganizationProfileDeleteSectionContext,
  OrganizationProfileDeleteSectionEvent,
} from './organization-profile-delete-section.machine';
import { organizationProfileDeleteSectionMachine } from './organization-profile-delete-section.machine';

type OrganizationProfileDeleteSectionController =
  | { status: 'loading' }
  | { status: 'hidden' }
  | {
      status: 'ready';
      snapshot: Snapshot<OrganizationProfileDeleteSectionContext>;
      send: (event: OrganizationProfileDeleteSectionEvent) => void;
      canSubmit: boolean;
    };

export function useOrganizationProfileDeleteSectionController(): OrganizationProfileDeleteSectionController {
  const { isLoaded: isOrganizationLoaded, organization } = useOrganization();
  const { isLoaded: isSessionLoaded, session } = useSession();
  const { userMemberships } = useOrganizationList({ userMemberships: true });
  const router = useMosaicRouter();
  const afterLeaveUrl = useMosaicEnvironment()?.displayConfig.afterLeaveOrganizationUrl;

  const [snapshot, send, actor] = useMachine(organizationProfileDeleteSectionMachine, {
    context: {
      organizationName: organization?.name ?? '',
      destroyOrganization: async () => {
        await organization?.destroy();
        // Refresh org lists elsewhere (e.g. the switcher). Not awaited: a stale
        // list must not make a successful delete look like it failed.
        void userMemberships.revalidate?.();
        // Navigate away from the deleted org's profile, mirroring legacy
        // navigateAfterLeaveOrganization. Fire-and-forget for the same reason.
        if (afterLeaveUrl) {
          void router.navigate(afterLeaveUrl);
        }
      },
    },
  });

  // The permission check needs both the organization and the session resolved.
  // Treat either still loading as 'loading' so a not-yet-known session is never
  // collapsed into a definitive 'hidden'.
  if (!isOrganizationLoaded || !isSessionLoaded) {
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

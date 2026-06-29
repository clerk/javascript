import { useMachine } from '../machine/useMachine';
import { useOrganization } from '../mock/use-organization';
import { leaveOrgMachine } from './leave-organization-machine';

export function useLeaveOrganizationController() {
  const { isLoaded, organization, membership } = useOrganization();
  const [snapshot, send, actor] = useMachine(leaveOrgMachine, {
    context: {
      organizationName: organization?.name ?? '',
      leaveOrganization: () => membership?.destroy() ?? Promise.resolve(),
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

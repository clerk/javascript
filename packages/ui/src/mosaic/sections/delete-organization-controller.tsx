import { useMachine } from '../machine/useMachine';
import { useOrganization } from '../mock/use-organization';
import { deleteOrgMachine } from './delete-organization-machine';

export function useDeleteOrganizationController() {
  const { isLoaded, organization } = useOrganization();
  const [snapshot, send, actor] = useMachine(deleteOrgMachine, {
    context: {
      organizationName: organization?.name ?? '',
      destroyOrganization: () => organization?.destroy() ?? Promise.resolve(),
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

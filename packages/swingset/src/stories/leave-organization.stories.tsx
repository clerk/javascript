/** @jsxImportSource @emotion/react */
import { useMachine } from '@clerk/ui/mosaic/machine/useMachine';
import { leaveOrgMachine } from '@clerk/ui/mosaic/sections/leave-organization.machine';
import { LeaveOrganizationView } from '@clerk/ui/mosaic/sections/leave-organization.view';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Sections',
  title: 'LeaveOrganization',
  label: 'Leave Org',
  source: 'packages/ui/src/mosaic/sections/leave-organization.tsx',
};

export function Default() {
  const [snapshot, send, actor] = useMachine(leaveOrgMachine, {
    context: {
      organizationName: 'Acme Inc',
      leaveOrganization: () => new Promise<void>(resolve => setTimeout(resolve, 800)),
    },
  });

  return (
    <LeaveOrganizationView
      snapshot={snapshot}
      send={send}
      canSubmit={actor.can({ type: 'CONFIRM' })}
    />
  );
}

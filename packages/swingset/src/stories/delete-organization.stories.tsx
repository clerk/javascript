/** @jsxImportSource @emotion/react */
import { useMachine } from '@clerk/ui/mosaic/machine/useMachine';
import { deleteOrgMachine } from '@clerk/ui/mosaic/sections/delete-organization-machine';
import { DeleteOrganizationView } from '@clerk/ui/mosaic/sections/delete-organization-view';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Sections',
  title: 'DeleteOrganization',
  label: 'Delete Org',
  source: 'packages/ui/src/mosaic/sections/delete-organization.tsx',
};

export function Default() {
  const [snapshot, send, actor] = useMachine(deleteOrgMachine, {
    context: {
      organizationName: 'Acme Inc',
      destroyOrganization: () => new Promise<void>(resolve => setTimeout(resolve, 800)),
    },
  });

  return (
    <DeleteOrganizationView
      snapshot={snapshot}
      send={send}
      canSubmit={actor.can({ type: 'CONFIRM' })}
    />
  );
}

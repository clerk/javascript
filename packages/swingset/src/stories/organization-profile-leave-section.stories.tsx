/** @jsxImportSource @emotion/react */
import { useMachine } from '@clerk/ui/mosaic/machine/useMachine';
import { organizationProfileLeaveSectionMachine } from '@clerk/ui/mosaic/sections/organization-profile-leave-section.machine';
import { OrganizationProfileLeaveSectionView } from '@clerk/ui/mosaic/sections/organization-profile-leave-section.view';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Organization',
  title: 'OrganizationProfileLeaveSection',
  source: 'packages/ui/src/mosaic/sections/organization-profile-leave-section.tsx',
};

export function Default() {
  const [snapshot, send, actor] = useMachine(organizationProfileLeaveSectionMachine, {
    context: {
      organizationName: 'Acme Inc',
      leaveOrganization: () => new Promise<void>(resolve => setTimeout(resolve, 800)),
    },
  });

  return (
    <OrganizationProfileLeaveSectionView
      snapshot={snapshot}
      send={send}
      canSubmit={actor.can({ type: 'CONFIRM' })}
    />
  );
}

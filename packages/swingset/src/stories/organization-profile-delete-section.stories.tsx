/** @jsxImportSource @emotion/react */
import { useMachine } from '@clerk/ui/mosaic/machine/useMachine';
import { organizationProfileDeleteSectionMachine } from '@clerk/ui/mosaic/organization/organization-profile-delete-section.machine';
import { OrganizationProfileDeleteSectionView } from '@clerk/ui/mosaic/organization/organization-profile-delete-section.view';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Organization',
  title: 'OrganizationProfileDeleteSection',
  source: 'packages/ui/src/mosaic/organization/organization-profile-delete-section.tsx',
};

export function Default() {
  const [snapshot, send, actor] = useMachine(organizationProfileDeleteSectionMachine, {
    context: {
      organizationName: 'Acme Inc',
      destroyOrganization: () => new Promise<void>(resolve => setTimeout(resolve, 800)),
    },
  });

  return (
    <OrganizationProfileDeleteSectionView
      snapshot={snapshot}
      send={send}
      canSubmit={actor.can({ type: 'CONFIRM' })}
    />
  );
}

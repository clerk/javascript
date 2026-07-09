/** @jsxImportSource @emotion/react */
import { useMachine } from '@clerk/ui/mosaic/machine/useMachine';
import { OrganizationProfileProfileSectionView } from '@clerk/ui/mosaic/organization/organization-profile-profile-section.view';
import { organizationProfileProfileSectionDetailsMachine } from '@clerk/ui/mosaic/organization/organization-profile-profile-section-details.machine';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Organization',
  title: 'OrganizationProfileProfileSection',
  source: 'packages/ui/src/mosaic/organization/organization-profile-profile-section.tsx',
};

export function Default() {
  const [snapshot, send, actor] = useMachine(organizationProfileProfileSectionDetailsMachine, {
    context: {
      committedName: 'Acme Inc',
      committedSlug: 'acme',
      slugEnabled: true,
      updateOrganization: () => new Promise<void>(resolve => setTimeout(resolve, 800)),
    },
  });

  return (
    <OrganizationProfileProfileSectionView
      snapshot={snapshot}
      send={send}
      canSubmit={actor.can({ type: 'SUBMIT' })}
    />
  );
}

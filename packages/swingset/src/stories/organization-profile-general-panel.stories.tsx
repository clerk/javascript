import { OrganizationProfileGeneralPanelView } from '@clerk/ui/mosaic/organization-profile/organization-profile-general-panel.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './organization-profile-general-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  title: 'OrganizationProfileGeneralPanel',
  label: 'General panel',
  navigation: { category: 'Panels' },
  source: 'packages/ui/src/mosaic/organization-profile/organization-profile-general-panel.view.tsx',
};

export function Default() {
  const [name, setName] = useState('Clerk');

  return (
    <OrganizationProfileGeneralPanelView
      name={name}
      slug='clerkorganization-177654156132154'
      onCopySlug={() => undefined}
      onDeleteOrganization={() => undefined}
      onLeaveOrganization={() => undefined}
      onNameChange={setName}
      onUploadLogo={() => undefined}
    />
  );
}

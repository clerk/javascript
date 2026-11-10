import { UserProfileView } from '@clerk/mosaic/features/user-profile/user-profile.view';

import type { StoryMeta } from '@/lib/types';

import { useOrganizationProfileFixture } from './fixtures/organization-profile';
import { useUserProfileFixture } from './fixtures/user-profile';

export { default as __source } from './profile.stories?raw';

export const meta: StoryMeta = {
  group: 'Profile',
  status: 'wip',
  title: 'Profile',
  layout: 'wide',
  source: 'packages/mosaic/src/features/profile/profile.tsx',
};

export function Default() {
  const { activePage, setActivePage, pages } = useUserProfileFixture();
  const organization = useOrganizationProfileFixture();
  return (
    <UserProfileView
      activePage={activePage}
      pages={pages}
      organization={{ pages: organization.pages }}
      onPageChange={setActivePage}
      elevation='flush'
    />
  );
}

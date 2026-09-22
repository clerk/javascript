import { OrganizationProfileRequestsTabView } from '@clerk/mosaic/features/organization-profile/organization-profile-requests-tab.view';

import type { StoryMeta } from '@/lib/types';

import { useOrganizationMembersFixture } from './fixtures/organization-profile';

export { default as __source } from './organization-profile-requests-tab.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  status: 'wip',
  substatus: 'needs wire-up',
  title: 'OrganizationProfileRequestsTab',
  label: 'Requests',
  navigation: { category: 'Sections' },
  layout: 'wide',
  source: 'packages/mosaic/src/features/organization-profile/organization-profile-requests-tab.view.tsx',
};

export function Default() {
  const {
    requests = [],
    roles,
    onChangeRequestRole,
    onAcceptRequest,
    onDeclineRequest,
  } = useOrganizationMembersFixture();
  return (
    <OrganizationProfileRequestsTabView
      requests={requests}
      roles={roles}
      search=''
      roleFilter={null}
      overlay={null}
      onChangeRole={onChangeRequestRole}
      onAccept={onAcceptRequest}
      onDecline={onDeclineRequest}
    />
  );
}

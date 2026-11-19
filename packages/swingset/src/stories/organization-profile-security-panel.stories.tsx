import type { StoryMeta } from '@/lib/types';

import {
  SecurityPanelExample,
  SecurityPanelNoSectionsExample,
  SSOBypassAllowlistExample,
} from './fixtures/organization-profile-security-panel';

export { default as __source } from './organization-profile-security-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  status: 'wip',
  title: 'OrganizationProfileSecurityPanel',
  label: 'Security panel',
  navigation: { category: 'Panels' },
  source:
    'packages/mosaic/src/features/organization-profile/organization-profile-security-panel/organization-profile-security-panel.tsx',
};

export function Default() {
  return <SecurityPanelExample />;
}

export function Loading() {
  return <SecurityPanelExample isLoading />;
}

export function NoSections() {
  return <SecurityPanelNoSectionsExample />;
}

export function AllowListLoadError() {
  return <SecurityPanelExample isError />;
}

export function AllowList() {
  return <SSOBypassAllowlistExample />;
}

export function RemoveFails() {
  return <SSOBypassAllowlistExample removeFails />;
}

export function EmptyAllowList() {
  return <SSOBypassAllowlistExample initialUserIds={[]} />;
}

export function AllowListLoading() {
  return <SSOBypassAllowlistExample isLoading />;
}

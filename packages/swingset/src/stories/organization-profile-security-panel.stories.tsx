import type { StoryMeta } from '@/lib/types';

import { SecurityPanelExample, SSOBypassAllowlistExample } from './fixtures/organization-profile-security-panel';
import { SSOConnectionExample } from './fixtures/organization-profile-security-sso';

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
  return (
    <SecurityPanelExample
      isLoading
      sso={{ isLoading: true }}
    />
  );
}

export function NoSSOConnections() {
  return <SecurityPanelExample sso={{ initialIds: [] }} />;
}

export function SSOLoadError() {
  return <SecurityPanelExample sso={{ isError: true }} />;
}

export function ManageSAMLConnection() {
  return <SSOConnectionExample id='ent_okta' />;
}

export function ManageOIDCConnection() {
  return <SSOConnectionExample id='ent_oidc' />;
}

export function AllowListLoadError() {
  return <SecurityPanelExample sectionError />;
}

export function AllowList() {
  return <SSOBypassAllowlistExample />;
}

export function EmptyAllowList() {
  return <SSOBypassAllowlistExample initialUserIds={[]} />;
}

export function AllowListLoading() {
  return <SSOBypassAllowlistExample isLoading />;
}

export function AllowListPageError() {
  return <SSOBypassAllowlistExample isError />;
}

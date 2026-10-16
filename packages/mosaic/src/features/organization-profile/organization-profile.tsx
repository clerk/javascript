'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';

import { useOrganizationProfileModel } from './organization-profile.model';
import type { OrganizationProfileOptions } from './organization-profile.provider';
import { OrganizationProfileProvider } from './organization-profile.provider';
import type { OrganizationProfileViewProps } from './organization-profile.view';
import { OrganizationProfileView } from './organization-profile.view';
import { OrganizationProfileApiKeysPanel } from './organization-profile-api-keys-panel';
import { OrganizationProfileGeneralPanel } from './organization-profile-general-panel';
import { OrganizationProfileMembersPanel } from './organization-profile-members-panel';

/** Everything `<OrganizationProfile />` takes: your own pages and their order, the page it opens on, and where leaving the organization lands. */
export interface OrganizationProfileProps
  extends
    Pick<OrganizationProfileViewProps, 'customPages' | 'pageOrder'>,
    Pick<OrganizationProfileOptions, 'afterLeaveOrganizationUrl'> {
  /**
   * The page the profile opens on: a built-in page's id, or a custom page's `path`. Unlike
   * `pageOrder`, it leaves the navigation order alone. A page the navigation does not list opens
   * the first page instead.
   *
   * @default the first page in the navigation
   */
  defaultPage?: OrganizationProfileViewProps['activePage'];
  /**
   * Rendered while Clerk is loading. Nothing renders once the answer is that there is no active
   * organization.
   */
  fallback?: ReactNode;
}

/**
 * The active organization's profile: General, Members when the user may read or manage
 * memberships, and API keys when the instance enables them and the user may use them, with your own
 * pages alongside. It reads the organization from Clerk, so it takes no data. It renders `fallback`
 * until Clerk answers, and nothing at all when there is no active organization or nobody is signed in.
 *
 * @example
 * ```tsx
 * <OrganizationProfile />
 * ```
 *
 * @example
 * `fallback` holds the space while Clerk is still answering. Nothing stands in once the answer is
 * that there is no active organization.
 * ```tsx
 * <OrganizationProfile fallback={<ProfileSkeleton />} />
 * ```
 *
 * @example
 * `defaultPage` picks the page the profile opens on without moving it in the navigation.
 * ```tsx
 * <OrganizationProfile defaultPage='members' />
 * ```
 *
 * @example
 * `customPages` adds your own pages; `pageOrder` places them among the built-in ones.
 * ```tsx
 * <OrganizationProfile
 *   customPages={[{ path: 'audit', label: 'Audit log', icon: <ListIcon />, content: <AuditPage /> }]}
 *   pageOrder={['general', 'members', 'audit']}
 * />
 * ```
 *
 * @example
 * `afterLeaveOrganizationUrl` is where the user lands after leaving or deleting the organization.
 * ```tsx
 * <OrganizationProfile afterLeaveOrganizationUrl='/organizations' />
 * ```
 */
export function OrganizationProfile({
  customPages,
  pageOrder,
  defaultPage,
  afterLeaveOrganizationUrl,
  fallback,
}: OrganizationProfileProps) {
  const model = useOrganizationProfileModel();
  const [activePage, setActivePage] = useState<OrganizationProfileViewProps['activePage']>(
    defaultPage ?? pageOrder?.[0] ?? 'general',
  );

  if (model.status === 'loading') {
    return fallback ?? null;
  }
  if (model.status === 'hidden') {
    return null;
  }

  return (
    <OrganizationProfileProvider afterLeaveOrganizationUrl={afterLeaveOrganizationUrl}>
      <OrganizationProfileView
        elevation='flush'
        activePage={activePage}
        onPageChange={setActivePage}
        customPages={customPages}
        pageOrder={pageOrder}
        pages={{
          general: <OrganizationProfileGeneralPanel />,
          members: model.pages.includes('members') ? <OrganizationProfileMembersPanel /> : undefined,
          apiKeys: model.pages.includes('apiKeys') ? <OrganizationProfileApiKeysPanel /> : undefined,
        }}
      />
    </OrganizationProfileProvider>
  );
}

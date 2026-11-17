'use client';

import type { ReactNode } from 'react';

import type { APIKeysPageProps } from '../api-keys/api-keys-table';
import { Profile } from '../profile/profile';
import type { OrganizationProfileOptions } from './organization-profile.provider';
import type { OrganizationProfileViewProps } from './organization-profile.view';

/** Everything `<OrganizationProfile />` takes: your own pages and their order, the page it opens on, and where leaving the organization lands. */
export interface OrganizationProfileProps
  extends
    Pick<OrganizationProfileViewProps, 'customPages' | 'pageOrder'>,
    Pick<OrganizationProfileOptions, 'afterLeaveOrganizationUrl'> {
  /**
   * The base the profile's pages are nested under. Two profiles on one page need different bases.
   *
   * @default '/organization'
   */
  path?: string;
  /**
   * Rendered while Clerk is loading. Nothing renders once the answer is that there is no active
   * organization.
   */
  fallback?: ReactNode;
  /**
   * Options for the API keys page: `hide` leaves it out of the navigation, `perPage` sets how many
   * keys a page lists, and `showDescription` adds an optional description when creating a key.
   */
  apiKeysProps?: APIKeysPageProps;
}

/**
 * The active organization's profile, the same as `<Profile mode='organization' />`: General, Members when the user may read or manage
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
export function OrganizationProfile(props: OrganizationProfileProps): ReactNode {
  return (
    <Profile
      {...props}
      mode='organization'
    />
  );
}

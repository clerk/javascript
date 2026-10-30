'use client';

import type { ReactNode } from 'react';

import type { APIKeysPageProps } from '../api-keys/api-keys-table';
import { useProfilePagesController } from '../profile-pages/profile-pages.controller';
import { useMosaicProfile } from '../profile-pages/use-mosaic-profile';
import { organizationProfilePageIds } from './organization-profile.layout';
import { useOrganizationProfileModel } from './organization-profile.model';
import type { OrganizationProfileOptions } from './organization-profile.provider';
import { OrganizationProfileProvider } from './organization-profile.provider';
import type { OrganizationProfilePageId, OrganizationProfilePages } from './organization-profile.types';
import type { OrganizationProfileViewProps } from './organization-profile.view';
import { OrganizationProfileView } from './organization-profile.view';
import { OrganizationProfileApiKeysPanel } from './organization-profile-api-keys-panel';
import { OrganizationProfileGeneralPanel } from './organization-profile-general-panel';
import { OrganizationProfileMembersPanel } from './organization-profile-members-panel/organization-profile-members-panel';

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
  /**
   * Options for the API keys page: `hide` leaves it out of the navigation, `perPage` sets how many
   * keys a page lists, and `showDescription` adds an optional description when creating a key.
   */
  apiKeysProps?: APIKeysPageProps;
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
export function OrganizationProfile(props: OrganizationProfileProps) {
  const { organizationProfileProps } = useMosaicProfile();
  const {
    customPages = organizationProfileProps?.customPages,
    pageOrder = organizationProfileProps?.pageOrder,
    defaultPage,
    afterLeaveOrganizationUrl = organizationProfileProps?.afterLeaveOrganizationUrl,
    fallback,
    apiKeysProps = organizationProfileProps?.apiKeysProps,
  } = props;
  const model = useOrganizationProfileModel();
  const pages = model.status === 'ready' ? organizationProfilePanels(model.pages, apiKeysProps) : undefined;
  const navigation = useProfilePagesController(
    defaultPage ?? pageOrder?.[0] ?? 'general',
    pages && organizationProfilePageIds({ pages, customPages, pageOrder }),
  );

  if (model.status === 'loading') {
    return fallback ?? null;
  }
  if (!pages) {
    return null;
  }

  return (
    <OrganizationProfileProvider afterLeaveOrganizationUrl={afterLeaveOrganizationUrl}>
      <OrganizationProfileView
        elevation='flush'
        {...navigation}
        customPages={customPages}
        pageOrder={pageOrder}
        pages={pages}
      />
    </OrganizationProfileProvider>
  );
}

/**
 * The organization's built-in panels, for the pages the instance has turned on. `apiKeysProps.hide`
 * leaves the API keys panel out; the rest of `apiKeysProps` goes to it.
 */
export function organizationProfilePanels(
  available: readonly OrganizationProfilePageId[],
  { hide: hideAPIKeys = false, ...apiKeysProps }: APIKeysPageProps = {},
): OrganizationProfilePages {
  return {
    general: <OrganizationProfileGeneralPanel />,
    members: available.includes('members') ? <OrganizationProfileMembersPanel /> : undefined,
    apiKeys:
      available.includes('apiKeys') && !hideAPIKeys ? <OrganizationProfileApiKeysPanel {...apiKeysProps} /> : undefined,
  };
}

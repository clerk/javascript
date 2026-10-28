'use client';

import type { ReactNode } from 'react';

import { SearchTarget } from '../../components/profile';
import type { APIKeysPageProps } from '../api-keys/api-keys-table';
import type { OrganizationProfileProps } from '../organization-profile/organization-profile';
import { organizationProfilePanels } from '../organization-profile/organization-profile';
import { useOrganizationProfileModel } from '../organization-profile/organization-profile.model';
import { OrganizationProfileProvider } from '../organization-profile/organization-profile.provider';
import { useProfilePagesController } from '../profile-pages/profile-pages.controller';
import { useUserProfilePages } from '../switcher/switcher.pages';
import type { SwitcherMode } from '../switcher/switcher.types';
import { userProfilePageIds } from './user-profile.layout';
import type { UserProfileOptions } from './user-profile.provider';
import { UserProfileProvider } from './user-profile.provider';
import type { UserProfileViewProps } from './user-profile.view';
import { UserProfileView } from './user-profile.view';
import { UserProfileApiKeysPanel } from './user-profile-api-keys-panel';
import { UserProfileProfilePanel } from './user-profile-profile-panel';
import { UserProfileSecurityPanel } from './user-profile-security-panel';
import { useUserProfileUserModel } from './user-profile-user.model';

/**
 * Which profiles the surface carries. `combined` adds the active organization's pages after the
 * account's; `user` shows the account's alone, even when an organization is active.
 */
export type UserProfileMode = Exclude<SwitcherMode, 'organization'>;

/** Everything `<UserProfile />` takes: your own pages and their order, the page it opens on, and the OAuth scopes it asks for. */
export interface UserProfileProps
  extends Pick<UserProfileViewProps, 'customPages' | 'pageOrder'>, Pick<UserProfileOptions, 'additionalOAuthScopes'> {
  /**
   * The page the profile opens on: a built-in page's id, or a custom page's `path`. Unlike
   * `pageOrder`, it leaves the navigation order alone. A page the navigation does not list opens
   * the first page instead.
   *
   * @default the first page in the navigation
   */
  defaultPage?: UserProfileViewProps['activePage'];
  /**
   * Rendered while Clerk is loading. Nothing renders once the answer is that nobody is signed in.
   */
  fallback?: ReactNode;
  /**
   * Options for the API keys page: `hide` leaves it out of the navigation, `perPage` sets how many
   * keys a page lists, and `showDescription` adds an optional description when creating a key.
   */
  apiKeysProps?: APIKeysPageProps;
  /**
   * Which profiles the surface carries: the account's and the active organization's, or the
   * account's alone.
   *
   * @default 'combined'
   */
  mode?: UserProfileMode;
  /**
   * Options for the organization's pages in `combined` mode: your own pages and their order, the API
   * keys page, and where leaving the organization lands. `pageOrder` names the organization's pages
   * without the `organization/` prefix, as in `['members', 'general']`.
   */
  organizationProfileProps?: Pick<
    OrganizationProfileProps,
    'customPages' | 'pageOrder' | 'apiKeysProps' | 'afterLeaveOrganizationUrl'
  >;
}

/**
 * The signed-in user's profile: Account, Security, and API keys when the instance enables them,
 * with your own pages alongside, and the active organization's pages after them. It reads the user from Clerk, so it takes no data. It renders
 * `fallback` until Clerk answers, and nothing at all when nobody is signed in.
 *
 * @example
 * ```tsx
 * <UserProfile />
 * ```
 *
 * @example
 * `fallback` holds the space while Clerk is still answering. Nothing stands in once the answer is
 * that nobody is signed in.
 * ```tsx
 * <UserProfile fallback={<ProfileSkeleton />} />
 * ```
 *
 * @example
 * `defaultPage` picks the page the profile opens on without moving it in the navigation. An
 * organization page's id is prefixed with `organization/`.
 * ```tsx
 * <UserProfile defaultPage='security' />
 * ```
 *
 * @example
 * `mode='user'` leaves the active organization's pages out.
 * ```tsx
 * <UserProfile mode='user' />
 * ```
 *
 * @example
 * `organizationProfileProps` adds your own pages to the organization's group.
 * ```tsx
 * <UserProfile
 *   organizationProfileProps={{
 *     customPages: [{ path: 'audit', label: 'Audit log', icon: <ListIcon />, content: <AuditPage /> }],
 *   }}
 * />
 * ```
 *
 * @example
 * `customPages` adds your own pages; `pageOrder` places them among the built-in ones.
 * ```tsx
 * <UserProfile
 *   customPages={[{ path: 'usage', label: 'Usage', icon: <ChartIcon />, content: <UsagePage /> }]}
 *   pageOrder={['account', 'usage', 'security']}
 * />
 * ```
 *
 * @example
 * `additionalOAuthScopes` asks for more access from a provider. A connected account missing any of
 * the scopes offers Reconnect to grant them.
 * ```tsx
 * <UserProfile additionalOAuthScopes={{ google: ['https://www.googleapis.com/auth/calendar.readonly'] }} />
 * ```
 */
export function UserProfile(props: UserProfileProps) {
  return (
    <UserProfileSurface
      {...props}
      presentation='mounted'
    />
  );
}

export function UserProfileSurface({
  presentation,
  mode = 'combined',
  organizationProfileProps,
  customPages,
  pageOrder,
  defaultPage,
  additionalOAuthScopes,
  fallback,
  apiKeysProps: { hide: hideAPIKeys = false, ...apiKeysProps } = {},
}: UserProfileProps & { presentation: NonNullable<UserProfileOptions['mode']> }) {
  const model = useUserProfileUserModel();
  const builtInPages = useUserProfilePages();

  if (model.status === 'loading') {
    return fallback ?? null;
  }
  if (model.status === 'hidden') {
    return null;
  }

  const viewProps: AccountViewProps = {
    elevation: 'flush',
    initialPage: defaultPage ?? pageOrder?.[0] ?? 'account',
    customPages,
    pageOrder,
    pages: {
      account: <UserProfileProfilePanel />,
      security: <UserProfileSecurityPanel />,
      apiKeys:
        builtInPages.includes('apiKeys') && !hideAPIKeys ? <UserProfileApiKeysPanel {...apiKeysProps} /> : undefined,
    },
  };

  return (
    <UserProfileProvider
      additionalOAuthScopes={additionalOAuthScopes}
      mode={presentation}
    >
      {mode === 'user' ? (
        <AccountUserProfileView {...viewProps} />
      ) : (
        <CombinedUserProfileView
          {...viewProps}
          organizationProfileProps={organizationProfileProps}
        />
      )}
    </UserProfileProvider>
  );
}

type AccountViewProps = Omit<UserProfileViewProps, 'activePage' | 'onPageChange' | 'organization'> & {
  initialPage: UserProfileViewProps['activePage'];
};

function AccountUserProfileView({ initialPage, ...viewProps }: AccountViewProps) {
  const navigation = useProfilePagesController(initialPage, userProfilePageIds(viewProps));

  return (
    <UserProfileView
      {...viewProps}
      {...navigation}
    />
  );
}

function CombinedUserProfileView({
  initialPage,
  organizationProfileProps: { customPages, pageOrder, apiKeysProps, afterLeaveOrganizationUrl } = {},
  ...viewProps
}: AccountViewProps & Pick<UserProfileProps, 'organizationProfileProps'>) {
  const model = useOrganizationProfileModel();
  const organization =
    model.status === 'ready'
      ? { pages: organizationProfilePanels(model.pages, apiKeysProps), customPages, pageOrder }
      : undefined;
  const navigation = useProfilePagesController(
    initialPage,
    model.status === 'loading' ? undefined : userProfilePageIds({ ...viewProps, organization }),
  );

  return (
    <OrganizationProfileProvider afterLeaveOrganizationUrl={afterLeaveOrganizationUrl}>
      <UserProfileView
        {...viewProps}
        {...navigation}
        organization={organization}
      />
    </OrganizationProfileProvider>
  );
}

UserProfile.SearchTarget = SearchTarget;

'use client';

import type { ReactNode } from 'react';

import type { APIKeysPageProps } from '../api-keys/api-keys-table';
import type { OrganizationProfileProps } from '../organization-profile/organization-profile';
import { organizationProfilePanels } from '../organization-profile/organization-profile';
import { useOrganizationProfileModel } from '../organization-profile/organization-profile.model';
import { OrganizationProfileProvider } from '../organization-profile/organization-profile.provider';
import { useProfilePagesController } from '../profile-pages/profile-pages.controller';
import { useMosaicProfile } from '../profile-pages/use-mosaic-profile';
import { pagesOnly, useUserProfilePages } from '../switcher/switcher.pages';
import { userProfilePageIds } from './user-profile.layout';
import type { UserProfileOptions } from './user-profile.provider';
import { UserProfileProvider } from './user-profile.provider';
import type { UserProfileViewProps } from './user-profile.view';
import { UserProfileView } from './user-profile.view';
import { UserProfileApiKeysPanel } from './user-profile-api-keys-panel';
import { UserProfileProfilePanel } from './user-profile-profile-panel';
import { UserProfileSecurityPanel } from './user-profile-security-panel';
import { useUserProfileUserModel } from './user-profile-user.model';

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
   * Whether the surface adds the active organization's pages after the account's. `false` shows the
   * account's alone, even when an organization is active.
   *
   * @default `MosaicProvider`'s `profile.combined`, which is `true` unless set
   */
  combined?: boolean;
  /**
   * Options for the organization's pages when `combined`: your own pages and their order, the API
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
 * `combined={false}` leaves the active organization's pages out.
 * ```tsx
 * <UserProfile combined={false} />
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
  const { combined, userProfileProps, organizationProfileProps } = useMosaicProfile();
  const {
    combined: ownCombined = combined,
    customPages = pagesOnly(userProfileProps?.customPages),
    pageOrder = userProfileProps?.pageOrder,
    additionalOAuthScopes = userProfileProps?.additionalOAuthScopes,
    apiKeysProps = userProfileProps?.apiKeysProps,
    organizationProfileProps: ownOrganizationProfileProps = {
      customPages: pagesOnly(organizationProfileProps?.customPages),
      pageOrder: organizationProfileProps?.pageOrder,
    },
    ...rest
  } = props;

  return (
    <UserProfileSurface
      {...rest}
      combined={ownCombined}
      customPages={customPages}
      pageOrder={pageOrder}
      additionalOAuthScopes={additionalOAuthScopes}
      apiKeysProps={apiKeysProps}
      organizationProfileProps={ownOrganizationProfileProps}
      presentation='mounted'
    />
  );
}

export function UserProfileSurface({
  presentation,
  combined = true,
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
      {combined ? (
        <CombinedUserProfileView
          {...viewProps}
          organizationProfileProps={organizationProfileProps}
        />
      ) : (
        <AccountUserProfileView {...viewProps} />
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

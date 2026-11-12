'use client';

import type { ReactNode } from 'react';

import type { MosaicRoutingMode } from '../../routing/use-mosaic-location';
import type { APIKeysPageProps } from '../api-keys/api-keys-table';
import type { OrganizationProfileProps } from '../organization-profile/organization-profile';
import { organizationProfilePageIds } from '../organization-profile/organization-profile.layout';
import { useOrganizationProfileModel } from '../organization-profile/organization-profile.model';
import { OrganizationProfileProvider } from '../organization-profile/organization-profile.provider';
import type {
  OrganizationProfilePageId,
  OrganizationProfilePages,
} from '../organization-profile/organization-profile.types';
import { OrganizationProfileView } from '../organization-profile/organization-profile.view';
import { OrganizationProfileApiKeysPanel } from '../organization-profile/organization-profile-api-keys-panel';
import { OrganizationProfileGeneralPanel } from '../organization-profile/organization-profile-general-panel';
import { OrganizationProfileMembersPanel } from '../organization-profile/organization-profile-members-panel/organization-profile-members-panel';
import { OrganizationProfileSecurityPanel } from '../organization-profile/organization-profile-security-panel/organization-profile-security-panel';
import { useProfilePagesController } from '../profile-pages/profile-pages.controller';
import { useMosaicProfile } from '../profile-pages/use-mosaic-profile';
import { useUserProfilePages } from '../switcher/switcher.pages';
import type { UserProfileProps } from '../user-profile/user-profile';
import { ORGANIZATION_PAGE_PREFIX, userProfilePageIds } from '../user-profile/user-profile.layout';
import type { UserProfileOptions } from '../user-profile/user-profile.provider';
import { UserProfileProvider } from '../user-profile/user-profile.provider';
import type { UserProfileViewProps } from '../user-profile/user-profile.view';
import { UserProfileView } from '../user-profile/user-profile.view';
import { UserProfileApiKeysPanel } from '../user-profile/user-profile-api-keys-panel';
import { UserProfileProfilePanel } from '../user-profile/user-profile-profile-panel';
import { UserProfileSecurityPanel } from '../user-profile/user-profile-security-panel';
import { useUserProfileUserModel } from '../user-profile/user-profile-user.model';

/** Everything `<Profile />` takes in `combined` mode. */
export interface CombinedProfileProps extends UserProfileProps {
  /**
   * Options for the organization's pages: your own pages and their order, the API keys page, and
   * where leaving the organization lands. `pageOrder` names the organization's pages without the
   * `organization/` prefix, as in `['members', 'general']`.
   */
  organizationProfileProps?: Pick<
    OrganizationProfileProps,
    'customPages' | 'pageOrder' | 'apiKeysProps' | 'afterLeaveOrganizationUrl'
  >;
}

/**
 * Everything `<Profile />` takes. Each mode takes its own options: `combined` the account's with the
 * organization's in `organizationProfileProps`, `user` the account's, and `organization` the
 * organization's. A mode chosen at runtime takes any mode's options, and the ones its mode has no use for do nothing.
 */
export type ProfileProps =
  | ({ mode?: 'combined' } & CombinedProfileProps)
  | ({ mode: 'user' } & UserProfileProps)
  | ({ mode: 'organization' } & OrganizationProfileProps);

/**
 * The signed-in user's profile. `combined` lists the account's pages and then the active
 * organization's, `user` the account's alone, and `organization` the active organization's alone.
 * Without a `mode`, it follows `MosaicProvider`'s `profile.combined`: `false` shows the account's
 * pages alone. It reads from Clerk, so it takes no data. It renders `fallback` until Clerk answers,
 * and nothing at all when there is nothing to show.
 *
 * @example
 * ```tsx
 * <Profile />
 * ```
 *
 * @example
 * `mode` narrows the profile. `<UserProfile />` and `<OrganizationProfile />` are the same as
 * `mode='user'` and `mode='organization'`.
 * ```tsx
 * <Profile mode='user' />
 * <Profile mode='organization' afterLeaveOrganizationUrl='/organizations' />
 * ```
 *
 * @example
 * `organizationProfileProps` adds your own pages to the organization's group.
 * ```tsx
 * <Profile
 *   organizationProfileProps={{
 *     customPages: [{ path: 'audit', label: 'Audit log', icon: <ListIcon />, content: <AuditPage /> }],
 *   }}
 * />
 * ```
 */
export function Profile(props: ProfileProps): ReactNode {
  const provider = useMosaicProfile();

  if (props.mode === 'organization') {
    return (
      <OrganizationProfileSurface
        key={props.routing ?? provider.organizationProfileProps?.routing}
        {...withOrganizationDefaults(props, provider.organizationProfileProps)}
        path={props.path ?? provider.organizationProfileProps?.path}
        routing={props.routing ?? provider.organizationProfileProps?.routing}
      />
    );
  }

  const { mode = provider.combined === false ? 'user' : 'combined', ...ownProps } = props;
  const userProps = withUserDefaults(ownProps, provider.userProfileProps);

  if (mode === 'user') {
    return (
      <UserProfileSurface
        {...userProps}
        presentation='mounted'
        combined={false}
      />
    );
  }

  return (
    <UserProfileSurface
      {...userProps}
      organizationProfileProps={withOrganizationDefaults(
        ('organizationProfileProps' in ownProps ? ownProps.organizationProfileProps : undefined) ?? {},
        provider.organizationProfileProps,
      )}
      presentation='mounted'
      combined
    />
  );
}

function withUserDefaults(
  props: UserProfileProps,
  defaults: Pick<
    UserProfileProps,
    'customPages' | 'pageOrder' | 'additionalOAuthScopes' | 'apiKeysProps' | 'path' | 'routing'
  > = {},
): UserProfileProps {
  const {
    customPages = defaults.customPages,
    pageOrder = defaults.pageOrder,
    additionalOAuthScopes = defaults.additionalOAuthScopes,
    apiKeysProps = defaults.apiKeysProps,
    path = defaults.path,
    routing = defaults.routing,
    fallback,
  } = props;
  return { customPages, pageOrder, additionalOAuthScopes, apiKeysProps, path, routing, fallback };
}

function withOrganizationDefaults<Props extends NonNullable<CombinedProfileProps['organizationProfileProps']>>(
  props: Props,
  defaults: NonNullable<CombinedProfileProps['organizationProfileProps']> = {},
): Props {
  const {
    customPages = defaults.customPages,
    pageOrder = defaults.pageOrder,
    apiKeysProps = defaults.apiKeysProps,
    afterLeaveOrganizationUrl = defaults.afterLeaveOrganizationUrl,
  } = props;
  return { ...props, customPages, pageOrder, apiKeysProps, afterLeaveOrganizationUrl };
}

export function UserProfileSurface({
  presentation,
  combined,
  organizationProfileProps,
  customPages,
  pageOrder,
  path = '/user',
  routing = 'virtual',
  additionalOAuthScopes,
  fallback,
  apiKeysProps: { hide: hideAPIKeys = false, ...apiKeysProps } = {},
}: CombinedProfileProps & { presentation: NonNullable<UserProfileOptions['mode']>; combined: boolean }) {
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
    path,
    routing,
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
      combined={combined}
    >
      {combined ? (
        <CombinedUserProfileView
          key={routing}
          {...viewProps}
          organizationProfileProps={organizationProfileProps}
          fallback={fallback}
        />
      ) : (
        <AccountUserProfileView
          key={routing}
          {...viewProps}
        />
      )}
    </UserProfileProvider>
  );
}

type AccountViewProps = Omit<UserProfileViewProps, 'activePage' | 'onPageChange' | 'organization'> & {
  path: string;
  routing: MosaicRoutingMode;
};

function AccountUserProfileView({ path, routing, ...viewProps }: AccountViewProps) {
  const { activePage, onPageChange } = useProfilePagesController(userProfilePageIds(viewProps), {
    routing,
    path,
  });

  if (activePage === undefined) {
    return null;
  }

  return (
    <UserProfileView
      {...viewProps}
      activePage={activePage}
      onPageChange={onPageChange}
    />
  );
}

function CombinedUserProfileView({
  path,
  routing,
  fallback,
  organizationProfileProps: { customPages, pageOrder, apiKeysProps, afterLeaveOrganizationUrl } = {},
  ...viewProps
}: AccountViewProps & Pick<CombinedProfileProps, 'organizationProfileProps' | 'fallback'>) {
  const model = useOrganizationProfileModel();
  const organization =
    model.status === 'ready'
      ? { pages: organizationProfilePanels(model.pages, apiKeysProps), customPages, pageOrder }
      : undefined;
  const pageIds = model.status === 'loading' ? undefined : userProfilePageIds({ ...viewProps, organization });
  const { activePage, onPageChange } = useProfilePagesController(pageIds, {
    routing,
    path,
    notFound: parts =>
      `${parts[0]}/` === ORGANIZATION_PAGE_PREFIX
        ? pageIds?.find(id => id.startsWith(ORGANIZATION_PAGE_PREFIX))
        : undefined,
  });

  if (activePage === undefined) {
    return fallback ?? null;
  }

  return (
    <OrganizationProfileProvider afterLeaveOrganizationUrl={afterLeaveOrganizationUrl}>
      <UserProfileView
        {...viewProps}
        activePage={activePage}
        onPageChange={onPageChange}
        organization={organization}
      />
    </OrganizationProfileProvider>
  );
}

export function OrganizationProfileSurface({
  customPages,
  pageOrder,
  path = '/organization',
  routing = 'virtual',
  afterLeaveOrganizationUrl,
  fallback,
  apiKeysProps,
}: OrganizationProfileProps) {
  const model = useOrganizationProfileModel();
  const pages = model.status === 'ready' ? organizationProfilePanels(model.pages, apiKeysProps) : undefined;
  const { activePage, onPageChange } = useProfilePagesController(
    pages && organizationProfilePageIds({ pages, customPages, pageOrder }),
    { routing, path },
  );

  if (model.status === 'loading') {
    return fallback ?? null;
  }
  if (!pages || activePage === undefined) {
    return null;
  }

  return (
    <OrganizationProfileProvider afterLeaveOrganizationUrl={afterLeaveOrganizationUrl}>
      <OrganizationProfileView
        elevation='flush'
        activePage={activePage}
        onPageChange={onPageChange}
        customPages={customPages}
        pageOrder={pageOrder}
        pages={pages}
      />
    </OrganizationProfileProvider>
  );
}

function organizationProfilePanels(
  available: readonly OrganizationProfilePageId[],
  { hide: hideAPIKeys = false, ...apiKeysProps }: APIKeysPageProps = {},
): OrganizationProfilePages {
  return {
    general: <OrganizationProfileGeneralPanel />,
    members: available.includes('members') ? <OrganizationProfileMembersPanel /> : undefined,
    security: available.includes('security') ? <OrganizationProfileSecurityPanel /> : undefined,
    apiKeys:
      available.includes('apiKeys') && !hideAPIKeys ? <OrganizationProfileApiKeysPanel {...apiKeysProps} /> : undefined,
  };
}

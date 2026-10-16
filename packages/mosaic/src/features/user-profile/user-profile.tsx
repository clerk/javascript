'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';

import { useUserProfilePages } from '../switcher/switcher.pages';
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
}

/**
 * The signed-in user's profile: Account, Security, and API keys when the instance enables them,
 * with your own pages alongside. It reads the user from Clerk, so it takes no data. It renders
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
 * `defaultPage` picks the page the profile opens on without moving it in the navigation.
 * ```tsx
 * <UserProfile defaultPage='security' />
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
export function UserProfile({
  customPages,
  pageOrder,
  defaultPage,
  additionalOAuthScopes,
  fallback,
}: UserProfileProps) {
  const model = useUserProfileUserModel();
  const builtInPages = useUserProfilePages();
  const [activePage, setActivePage] = useState<UserProfileViewProps['activePage']>(
    defaultPage ?? pageOrder?.[0] ?? 'account',
  );

  if (model.status === 'loading') {
    return fallback ?? null;
  }
  if (model.status === 'hidden') {
    return null;
  }

  return (
    <UserProfileProvider
      additionalOAuthScopes={additionalOAuthScopes}
      mode='mounted'
    >
      <UserProfileView
        elevation='flush'
        activePage={activePage}
        onPageChange={setActivePage}
        customPages={customPages}
        pageOrder={pageOrder}
        pages={{
          account: <UserProfileProfilePanel />,
          security: <UserProfileSecurityPanel />,
          apiKeys: builtInPages.includes('apiKeys') ? <UserProfileApiKeysPanel /> : undefined,
        }}
      />
    </UserProfileProvider>
  );
}

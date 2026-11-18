'use client';

import type { ReactNode } from 'react';

import type { APIKeysPageProps } from '../api-keys/api-keys-table';
import { Profile } from '../profile/profile';
import type { UserProfileOptions } from './user-profile.provider';
import type { UserProfileViewProps } from './user-profile.view';

/** Everything `<UserProfile />` takes: your own pages and their order, the page it opens on, and the OAuth scopes it asks for. */
export interface UserProfileProps
  extends Pick<UserProfileViewProps, 'customPages' | 'pageOrder'>, Pick<UserProfileOptions, 'additionalOAuthScopes'> {
  /**
   * The base the profile's pages are nested under. Two profiles on one page need different bases.
   *
   * @default '/user'
   */
  path?: string;
  /**
   * Rendered while Clerk is loading. Nothing renders once the answer is that nobody is signed in.
   */
  fallback?: ReactNode;
  /**
   * Options for the API keys page: `hide` leaves it out of the navigation, `perPage` sets how many
   * keys a page lists, and `showDescription` adds an optional description when creating a key.
   */
  apiKeysProps?: APIKeysPageProps;
}

/**
 * The signed-in user's profile: Account, Security, and API keys when the instance enables them,
 * with your own pages alongside. It is `<Profile mode='user' />`, so it never lists the active
 * organization's pages. It reads the user from Clerk, so it takes no data. It renders
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
export function UserProfile(props: UserProfileProps): ReactNode {
  return (
    <Profile
      {...props}
      mode='user'
    />
  );
}

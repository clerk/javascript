'use client';

import type { ReactElement, ReactNode } from 'react';

import { useUserAvatarModel } from './user-avatar.model';
import type { UserAvatarAppearanceProps } from './user-avatar.view';
import { UserAvatarView } from './user-avatar.view';

/** Everything `<UserAvatar />` takes: its shape and size, and what stands in while Clerk loads. */
export interface UserAvatarProps extends UserAvatarAppearanceProps {
  /**
   * Fallback while loading.
   *
   * Note that the component renders nothing when the user is signed out, so using this on
   * pages that are reachable while both signed-out and signed-in can result in Fallback->Nothing.
   */
  fallback?: ReactNode;
}

/**
 * The signed-in user's profile image. It reads the user from Clerk, so it takes no data. It renders
 * `fallback` until Clerk answers, and nothing at all when nobody is signed in. Assistive technology
 * reads it as an image named for the user.
 *
 * @example
 * ```tsx
 * import { UserAvatar } from '@clerk/mosaic';
 *
 * <UserAvatar />
 * ```
 *
 * @example
 * `shape` and `size` take the same values as `Avatar`.
 * ```tsx
 * <UserAvatar shape='square' size='lg' />
 * ```
 *
 * @example
 * `fallback` holds the space while Clerk is still answering. Nothing stands in once the answer is
 * that nobody is signed in.
 * ```tsx
 * <UserAvatar fallback={<AvatarSkeleton />} />
 * ```
 */
export function UserAvatar({ fallback, ...appearance }: UserAvatarProps = {}): ReactElement | null {
  const model = useUserAvatarModel();

  if (model.status === 'loading') {
    return <>{fallback}</>;
  }

  if (model.status === 'hidden') {
    return null;
  }

  const { status: _status, ...data } = model;

  return (
    <UserAvatarView
      {...data}
      {...appearance}
    />
  );
}

import type { ReactElement } from 'react';

import type { EmbeddedNavigationProps } from './EmbeddedNavigation.types';

/**
 * Authentication mode that determines which flows are available to the user.
 *
 * - `'signInOrUp'` - Allows users to choose between signing in or creating a new account (default)
 * - `'signIn'` - Restricts to sign-in flows only
 * - `'signUp'` - Restricts to sign-up flows only
 */
export type AuthViewMode = 'signIn' | 'signUp' | 'signInOrUp';

/**
 * Props for the AuthView component.
 *
 * AuthView renders a native authentication UI inline (fills parent container).
 * Use `useAuth()`, `useUser()`, or `useSession()` to react to authentication
 * state changes.
 */
export interface AuthViewProps extends EmbeddedNavigationProps {
  /**
   * Replaces the dashboard-configured logo with custom React Native content.
   *
   * The native authentication UI does not apply sizing, spacing, or accessibility
   * attributes to this content. The provided element must define its own layout
   * and accessibility behavior.
   */
  logo?: ReactElement;

  /**
   * Authentication mode that determines which flows are available.
   *
   * - `'signInOrUp'` - Users can choose between signing in or creating an account
   * - `'signIn'` - Only sign-in flows are available
   * - `'signUp'` - Only sign-up flows are available
   *
   * @default 'signInOrUp'
   */
  mode?: AuthViewMode;

  /**
   * Whether the authentication view can be dismissed by the user.
   *
   * When `true`, a dismiss button appears in the navigation bar.
   *
   * When `false`, the user must complete authentication to close the view.
   * Use this for flows where authentication is required to proceed.
   *
   * @default true
   */
  isDismissible?: boolean;

  /**
   * Maximum height of the Clerk application logo, in density-independent pixels.
   *
   * @default 44
   */
  logoMaxHeight?: number;

  /**
   * Turns on [Restore Credentials](https://developer.android.com/identity/sign-in/restore-credentials)
   * so users stay signed in when they move to a new Android device. Android only and opt-in;
   * ignored on iOS.
   *
   * When `true`, a signed-out `AuthView` first tries to sign in silently with a restore credential
   * that Android device setup transferred from the user's old device, and falls back to the usual
   * sign-in UI if there is none. After a sign-in or sign-up, it creates a restore credential in the
   * background, at most once per user on each device.
   *
   * Requires passkeys to be enabled for your Clerk instance, and a version of clerk-android that
   * includes [clerk/clerk-android#1097](https://github.com/clerk/clerk-android/pull/1097).
   *
   * @default false
   */
  enableRestoreCredentials?: boolean;

  /**
   * Called when the native authentication view requests dismissal.
   *
   * This fires when the user dismisses the view, or when the native auth flow
   * finishes and the app-owned presentation should close.
   */
  onDismiss?: () => void;
}

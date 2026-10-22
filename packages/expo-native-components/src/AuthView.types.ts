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
   * When `true`, on the first launch after the app is installed or restored onto a device, a
   * signed-out `AuthView` tries to sign in silently with the restore credential that Android device
   * setup transferred from the user's old device, and falls back to the usual sign-in UI if there is
   * none. Later launches don't try again, so a user whose session ended is not signed back in
   * silently.
   *
   * After a sign-in or sign-up, `AuthView` creates a restore credential for the signed-in user in
   * the background, replacing the one this device created for that user before. A device holds one
   * restore credential, which belongs to the user who most recently signed in. Restore credentials
   * are passkeys named "Android restore key".
   *
   * When a signed-in session on the device ends, whether from JavaScript or native code, the
   * device's restore credential is deleted.
   *
   * Requires passkeys to be enabled as a first factor for your Clerk instance.
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

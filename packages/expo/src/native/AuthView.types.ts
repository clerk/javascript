import type { StyleProp, ViewStyle } from 'react-native';

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
 * AuthView presents a comprehensive native authentication UI that handles
 * sign-in and sign-up flows with support for multiple authentication methods.
 */
export interface AuthViewProps {
  /**
   * How the auth view is presented.
   *
   * - `'modal'` - Presents a full-screen native modal (default)
   * - `'inline'` - Renders directly within the React Native view hierarchy
   *
   * @default 'modal'
   */
  presentation?: 'modal' | 'inline';

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
   * When `true`, a dismiss button appears in the navigation bar and the modal
   * can be dismissed by swiping down or tapping outside (on iOS).
   *
   * When `false`, the user must complete authentication to close the view.
   * Use this for flows where authentication is required to proceed.
   *
   * @default true
   */
  isDismissable?: boolean;

  /**
   * Callback fired when authentication completes successfully.
   *
   * This is called after:
   * 1. The user successfully signs in or signs up
   * 2. The native session is synced with the JavaScript SDK
   *
   * After this callback, all `@clerk/expo` hooks (`useUser()`, `useAuth()`,
   * `useOrganization()`, etc.) will reflect the authenticated state.
   */
  onSuccess?: () => void;

  /**
   * Callback fired when an error occurs during authentication.
   *
   * @param error - The error that occurred
   */
  onError?: (error: Error) => void;

  /**
   * Callback fired when the modal is dismissed without completing authentication.
   *
   * Only applies to `presentation="modal"`. Use this to update your UI state
   * (e.g., navigate back or show a landing screen).
   */
  onDismiss?: () => void;

  /**
   * Style applied to the container view (inline mode only).
   */
  style?: StyleProp<ViewStyle>;
}

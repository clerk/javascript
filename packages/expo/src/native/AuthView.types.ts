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
 * Use `useAuth()`, `useUser()`, or `useSession()` in a `useEffect` to react
 * to authentication state changes.
 */
export interface AuthViewProps {
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
   * @default false
   */
  isDismissable?: boolean;
}

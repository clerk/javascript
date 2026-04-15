import type { LastAuthenticationStrategy } from './json';
import type { ClerkResource } from './resource';
import type { SessionResource, SignedInSessionResource } from './session';
import type { SignInResource } from './signIn';
import type { SignUpResource } from './signUp';
import type { ClientJSONSnapshot } from './snapshots';

/**
 * The `Client` object keeps track of the authenticated sessions in the current device. The device can be a browser, a native application, or any other medium that is usually the requesting part in a request/response architecture.
 *
 * The `Client` object also holds information about any sign-in or sign-up attempts that might be in progress, tracking the sign-in or sign-up progress.
 */
export interface ClientResource extends ClerkResource {
  /**
   * A list of sessions that have been created on this client.
   */
  sessions: SessionResource[];
  /**
   * A list of sessions on this client where the user has completed the full sign-in flow. Sessions can be in one of the following states:
   * <ul>
   *  <li>`"active"`: The user has completed the full sign-in flow and all pending tasks.</li>
   *  <li>`"pending"`: The user has completed the sign-in flow but still needs to complete one or more required steps (**pending tasks**).</li>
   * </ul>
   */
  signedInSessions: SignedInSessionResource[];
  /**
   * The current sign up attempt, or `null` if there is none.
   */
  signUp: SignUpResource;
  /**
   * The current sign in attempt, or `null` if there is none.
   */
  signIn: SignInResource;
  /**
   * Returns `true` if this client hasn't been saved (created) yet in the Frontend API. Returns `false` otherwise.
   */
  isNew: () => boolean;
  /**
   * Creates a new client for the current instance along with its cookie.
   */
  create: () => Promise<ClientResource>;
  /**
   * Deletes the client. All sessions will be reset.
   */
  destroy: () => Promise<void>;
  /**
   * Removes all sessions created on the client.
   */
  removeSessions: () => Promise<ClientResource>;
  /**
   * Clears any locally cached session data for the current client.
   */
  clearCache: () => void;
  /**
   * Resets the current sign-in attempt. Clears the in-progress sign-in state on the client.
   */
  resetSignIn: () => void;
  /**
   * Resets the current sign-up attempt. Clears the in-progress sign-up state on the client.
   */
  resetSignUp: () => void;
  /**
   * Returns `true` if the client cookie is due to expire in 8 days or less. Returns `false` otherwise.
   */
  isEligibleForTouch: () => boolean;
  /**
   * Builds a URL that refreshes the current client's authentication state and then redirects the user to the specified URL.
   *
   * @param params - The URL to redirect the user to.
   */
  buildTouchUrl: (params: { redirectUrl: URL }) => string;
  /**
   * The ID of the last active [`Session`](https://clerk.com/docs/reference/objects/session) on this client.
   */
  lastActiveSessionId: string | null;
  /**
   * Last authentication strategy used by this client; `null` when unknown or feature disabled.
   */
  lastAuthenticationStrategy: LastAuthenticationStrategy | null;
  /**
   * Indicates whether CAPTCHA checks are skipped for this client.
   */
  captchaBypass: boolean;
  /**
   * The date and time when the client's authentication cookie will expire.
   */
  cookieExpiresAt: Date | null;
  /**
   * The date and time when the client was created.
   */
  createdAt: Date | null;
  /**
   * The date and time when the client was last updated.
   */
  updatedAt: Date | null;
  /**
   * Sends a CAPTCHA token to the client.
   * @internal
   */
  __internal_sendCaptchaToken: (params: unknown) => Promise<ClientResource>;
  /**
   * Converts the client to a snapshot.
   * @internal
   */
  __internal_toSnapshot: () => ClientJSONSnapshot;
}

/**
 * Configuration parameters for Google One Tap Sign-In.
 */
export type ConfigureParams = {
  /**
   * The web client ID from Google Cloud Console.
   * This is required for Google Sign-In to work.
   * On iOS, this is used as the serverClientID for token audience.
   */
  webClientId: string;

  /**
   * The iOS client ID from Google Cloud Console.
   * This is only used on iOS for the OAuth flow.
   * If not provided, webClientId will be used.
   * @platform iOS
   */
  iosClientId?: string;

  /**
   * Optional hosted domain to restrict sign-in to a specific domain.
   */
  hostedDomain?: string;

  /**
   * Whether to enable auto-select for returning users.
   * When true, if only one credential is available, it will be automatically selected.
   * @default false
   */
  autoSelectEnabled?: boolean;
};

/**
 * Parameters for the signIn method.
 */
export type SignInParams = {
  /**
   * A cryptographically random string used to mitigate replay attacks.
   * The nonce will be included in the ID token.
   */
  nonce?: string;

  /**
   * Whether to filter credentials to only show accounts that have been
   * previously authorized for this app.
   * @default true
   */
  filterByAuthorizedAccounts?: boolean;
};

/**
 * Parameters for the createAccount method.
 */
export type CreateAccountParams = {
  /**
   * A cryptographically random string used to mitigate replay attacks.
   * The nonce will be included in the ID token.
   */
  nonce?: string;
};

/**
 * Parameters for the presentExplicitSignIn method.
 */
export type ExplicitSignInParams = {
  /**
   * A cryptographically random string used to mitigate replay attacks.
   * The nonce will be included in the ID token.
   */
  nonce?: string;
};

/**
 * User information returned from Google Sign-In.
 */
export type GoogleUser = {
  /**
   * The user's unique Google identifier (OIDC "sub" claim).
   * This is distinct from the user's email address.
   */
  id: string;

  /**
   * The user's email address.
   */
  email: string;

  /**
   * The user's full display name.
   */
  name: string | null;

  /**
   * The user's given (first) name.
   */
  givenName: string | null;

  /**
   * The user's family (last) name.
   */
  familyName: string | null;

  /**
   * URL to the user's profile picture.
   */
  photo: string | null;
};

/**
 * Successful sign-in response.
 */
export type OneTapSuccessResponse = {
  type: 'success';
  data: {
    /**
     * The Google ID token containing user information and nonce.
     */
    idToken: string;

    /**
     * The user's information.
     */
    user: GoogleUser;
  };
};

/**
 * Response when the user cancels the sign-in flow.
 */
export type CancelledResponse = {
  type: 'cancelled';
  data: null;
};

/**
 * Response when no saved credential is found.
 */
export type NoSavedCredentialFound = {
  type: 'noSavedCredentialFound';
  data: null;
};

/**
 * Union type for all possible One Tap responses.
 */
export type OneTapResponse = OneTapSuccessResponse | CancelledResponse | NoSavedCredentialFound;

/**
 * Error codes that can be thrown by the Google Sign-In module.
 *
 * - `SIGN_IN_CANCELLED`: User cancelled the sign-in flow
 * - `NO_SAVED_CREDENTIAL_FOUND`: No saved credentials available for One Tap
 * - `NOT_CONFIGURED`: Module not configured before use
 * - `GOOGLE_SIGN_IN_ERROR`: Generic Google Sign-In error
 * - `E_ACTIVITY_UNAVAILABLE`: Android activity unavailable (GoogleSignInActivityUnavailableException)
 */
export type GoogleSignInErrorCode =
  | 'SIGN_IN_CANCELLED'
  | 'NO_SAVED_CREDENTIAL_FOUND'
  | 'NOT_CONFIGURED'
  | 'GOOGLE_SIGN_IN_ERROR'
  | 'E_ACTIVITY_UNAVAILABLE';

/**
 * Error thrown by the Google Sign-In module.
 */
export interface GoogleSignInError extends Error {
  code: GoogleSignInErrorCode;
}

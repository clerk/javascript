import type { ClerkResourceJSON } from './json';

/**
 * @internal
 */
export type OAuthConsentScopeJSON = {
  scope: string;
  description: string | null;
  requires_consent: boolean;
};

/**
 * @internal
 */
export type OAuthDeviceVerificationInfoJSON = {
  oauth_application_name: string;
  oauth_application_logo_url: string | null;
  client_id: string;
  scopes: OAuthConsentScopeJSON[];
  status: OAuthDeviceVerificationStatus;
  expires_at: number;
};

/**
 * @internal
 */
export type OAuthDeviceVerificationResultJSON = {
  object: 'oauth_device_verification';
  status: Extract<OAuthDeviceVerificationStatus, 'approved' | 'denied'>;
};

/**
 * @internal
 */
export interface OAuthConsentInfoJSON extends ClerkResourceJSON {
  object: 'oauth_consent_info';
  oauth_application_name: string;
  oauth_application_logo_url: string;
  oauth_application_url: string;
  client_id: string;
  state: string;
  redirect_domain: string | null;
  scopes: OAuthConsentScopeJSON[];
}

/**
 * A single OAuth scope with its description and whether it requires consent.
 *
 * @interface
 */
export type OAuthConsentScope = {
  /**
   * The name of the scope, as defined by the OAuth application.
   */
  scope: string;
  /**
   * The description of the scope, which can be shown to users on the consent screen. This may be `null` if no description is available.
   */
  description: string | null;
  /**
   * Whether or not this scope requires explicit user consent. If `false`, the scope is considered "safe" and can be granted without showing the consent screen to the user.
   */
  requiresConsent: boolean;
};

/**
 * An interface representing OAuth consent information, including application details and requested scopes.
 *
 * @interface
 */
export type OAuthConsentInfo = {
  /**
   * The display name of the OAuth application requesting access.
   */
  oauthApplicationName: string;
  /**
   * The URL of the OAuth application's logo image.
   */
  oauthApplicationLogoUrl: string;
  /**
   * The homepage URL of the OAuth application.
   */
  oauthApplicationUrl: string;
  /**
   * The OAuth `client_id` identifying the application.
   */
  clientId: string;
  /**
   * The `state` parameter from the original authorize request.
   */
  state: string;
  /**
   * The PSL-resolved registrable domain of the redirect URI for display on the consent screen.
   * Null when no redirect URI was provided, when it is not registered for the application,
   * or when it points to an IP address or localhost.
   */
  redirectDomain: string | null;
  /**
   * A list of scopes the application is requesting, with descriptions and consent requirements.
   */
  scopes: OAuthConsentScope[];
};

export type OAuthDeviceVerificationStatus = 'pending' | 'approved' | 'denied' | 'consumed';

/**
 * A scope requested by an OAuth device authorization.
 */
export type OAuthDeviceVerificationScope = OAuthConsentScope;

/**
 * Information about an OAuth device authorization awaiting verification.
 */
export type OAuthDeviceVerificationInfo = {
  oauthApplicationName: string;
  oauthApplicationLogoUrl: string | null;
  clientId: string;
  scopes: OAuthDeviceVerificationScope[];
  status: OAuthDeviceVerificationStatus;
  /** Expiration time as Unix milliseconds. */
  expiresAt: number;
};

/**
 * The result of approving or denying an OAuth device authorization.
 */
export type OAuthDeviceVerificationResult = {
  object: 'oauth_device_verification';
  status: Extract<OAuthDeviceVerificationStatus, 'approved' | 'denied'>;
};

export type GetOAuthConsentInfoParams = {
  /** The OAuth `client_id` from the authorize request. The hook is disabled when this value is empty or omitted. */
  oauthClientId: string;
  /** A space-delimited scope string from the authorize request. */
  scope?: string;
  /** The redirect URI from the authorize request. When provided, the backend returns a PSL-resolved `redirectDomain`. */
  redirectUri?: string;
};

export type LookupOAuthDeviceVerificationParams = {
  userCode: string;
};

export type SubmitOAuthDeviceVerificationParams = {
  userCode: string;
  approved: boolean;
  organizationId?: string;
};

/**
 * Namespace exposed on `Clerk` for OAuth application / consent helpers.
 */
export interface OAuthApplicationNamespace {
  /**
   * Loads consent metadata for the given OAuth client for the signed-in user.
   */
  getConsentInfo: (params: GetOAuthConsentInfoParams) => Promise<OAuthConsentInfo>;

  /**
   * Looks up an OAuth device authorization by its human-readable user code.
   */
  lookupDeviceVerification: (params: LookupOAuthDeviceVerificationParams) => Promise<OAuthDeviceVerificationInfo>;

  /**
   * Approves or denies an OAuth device authorization for the signed-in user.
   */
  submitDeviceVerification: (params: SubmitOAuthDeviceVerificationParams) => Promise<OAuthDeviceVerificationResult>;

  /**
   * Returns the URL to use as the `action` attribute of the consent form.
   * Includes `_clerk_session_id` and, in development, the dev browser JWT.
   * Custom-flow developers building their own consent UI use this alongside
   * the `useOAuthConsent` hook.
   */
  buildConsentActionUrl: (params: { clientId: string }) => string;
}

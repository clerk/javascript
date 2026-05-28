/**
 * Public types for @clerk/cli-auth.
 * This file is the CONTRACT — Codex agents building the implementation
 * and the demo consumer both import from here. Keep signatures stable.
 */

export type StorageKind = 'keychain' | 'file' | 'memory';

export interface CredentialStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

export type OAuthScope =
  | 'profile'
  | 'email'
  | 'openid'
  | 'offline_access'
  | 'user:org:read'
  | 'public_metadata'
  | (string & {});

export interface ClerkCliAuthConfig {
  /** OAuth Application client_id from Clerk Dashboard (public client, PKCE). */
  clientId: string;
  /** Frontend API base URL, e.g. https://clerk.myapp.com (no trailing slash). */
  issuer: string;
  /** OAuth scopes to request. Default: ["profile", "email", "openid", "offline_access"]. */
  scopes?: OAuthScope[];
  /** Credential storage strategy. Default: "keychain" (with file fallback). */
  storage?: StorageKind | CredentialStore;
  /** Keychain service name (macOS/Linux/Windows credential manager). Default: "clerk-cli-auth". */
  keychainService?: string;
  /** Environment label to namespace stored tokens. Default: "default". */
  environment?: string;
  /** Override the port the ephemeral callback server binds to. Default: 0 (random). */
  callbackPort?: number;
  /** How long `login()` waits for the user to complete browser sign-in and redirect back to the localhost callback. Default: 120000 (2min). */
  loginTimeoutMs?: number;
  /** Per-HTTP-request timeout in ms for token exchange, refresh, revoke, userinfo, and API key verification. Default: 30000 (30s). */
  requestTimeoutMs?: number;
  /** Injected opener for the browser step (for testing). Default: auto-detect. */
  openBrowser?: (url: string) => Promise<void>;
  /** Enables non-OAuth credential auth (API keys, machine tokens) alongside OAuth. */
  apiKeys?: {
    /**
     * Backend endpoint that returns the verified `Identity` for a credential. Called with
     * `Authorization: Bearer <token>`. The server is responsible for verifying the credential
     * (e.g. via `clerk.apiKeys.verify()` from `@clerk/nextjs/server`) and responding with an
     * `Identity` payload — verification stays server-side, never in the CLI.
     */
    identityEndpoint: string;
    /** Env var to read a credential from (e.g. 'MYAPP_API_KEY'). */
    envVar: string;
  };
}

export interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt?: number;
  scope?: string;
  tokenType?: string;
}

/**
 * Verified identity payload returned by `/oauth/userinfo` or your `identityEndpoint`.
 * `sub` is the only guaranteed field — it holds the Clerk subject id (`user_*`, `org_*`,
 * `mch_*`, or `scim_*`). Every other field is optional and depends on the credential type
 * and scopes (user-shaped fields like `email` only show up for user-scoped subjects).
 */
export interface Identity {
  sub: string;
  /** Clerk user id. Returned by identity endpoints; OAuth userinfo puts it in `sub` instead. */
  user_id?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  preferred_username?: string;
  username?: string;
  public_metadata?: Record<string, unknown>;
  unsafe_metadata?: Record<string, unknown>;
  /** Org context. Present for org-scoped API keys, or OAuth sessions where the user picked an org at consent. */
  org_id?: string;
  org_slug?: string;
  org_name?: string;
  org_role?: string;
  org_permissions?: string[];
  [key: string]: unknown;
}

export interface LoginResult {
  tokens: TokenSet;
  user: Identity;
}

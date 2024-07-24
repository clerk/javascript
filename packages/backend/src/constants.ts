export const API_URL = 'https://api.clerk.com';
export const API_VERSION = 'v1';

export const USER_AGENT = `${PACKAGE_NAME}@${PACKAGE_VERSION}`;
export const MAX_CACHE_LAST_UPDATED_AT_SECONDS = 5 * 60;
export const JWKS_CACHE_TTL_MS = 1000 * 60 * 60;

const Attributes = {
  AuthToken: '__clerkAuthToken',
  AuthSignature: '__clerkAuthSignature',
  AuthStatus: '__clerkAuthStatus',
  AuthReason: '__clerkAuthReason',
  AuthMessage: '__clerkAuthMessage',
  ClerkUrl: '__clerkUrl',
} as const;

const Cookies = {
  Session: '__session',
  ClientUat: '__client_uat',
  Handshake: '__clerk_handshake',
  DevBrowser: '__clerk_db_jwt',
  EphemeralPublishableKey: '__clerk_ephemeral_publishable_key',
  EphemeralSecretKey: '__clerk_ephemeral_secret_key',
} as const;

const QueryParameters = {
  ClerkSynced: '__clerk_synced',
  ClerkRedirectUrl: '__clerk_redirect_url',
  // use the reference to Cookies to indicate that it's the same value
  DevBrowser: Cookies.DevBrowser,
  Handshake: Cookies.Handshake,
  HandshakeHelp: '__clerk_help',
  LegacyDevBrowser: '__dev_session',
  EphemeralPublishableKey: '__clerk_ephemeral_publishable_key',
  EphemeralSecretKey: '__clerk_ephemeral_secret_key',
} as const;

const Headers = {
  AuthToken: 'x-clerk-auth-token',
  AuthSignature: 'x-clerk-auth-signature',
  AuthStatus: 'x-clerk-auth-status',
  AuthReason: 'x-clerk-auth-reason',
  AuthMessage: 'x-clerk-auth-message',
  ClerkUrl: 'x-clerk-clerk-url',
  EnableDebug: 'x-clerk-debug',
  ClerkRequestData: 'x-clerk-request-data',
  ClerkRedirectTo: 'x-clerk-redirect-to',
  CloudFrontForwardedProto: 'cloudfront-forwarded-proto',
  Authorization: 'authorization',
  ForwardedPort: 'x-forwarded-port',
  ForwardedProto: 'x-forwarded-proto',
  ForwardedHost: 'x-forwarded-host',
  Accept: 'accept',
  Referrer: 'referer',
  UserAgent: 'user-agent',
  Origin: 'origin',
  Host: 'host',
  ContentType: 'content-type',
  SecFetchDest: 'sec-fetch-dest',
  Location: 'location',
} as const;

const ContentTypes = {
  Json: 'application/json',
} as const;

/**
 * @internal
 */
export const constants = {
  Attributes,
  Cookies,
  Headers,
  ContentTypes,
  QueryParameters,
} as const;

export type Constants = typeof constants;

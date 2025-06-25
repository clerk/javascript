export const API_URL = 'https://api.clerk.com';
export const API_VERSION = 'v1';

export const USER_AGENT = `${PACKAGE_NAME}@${PACKAGE_VERSION}`;
export const MAX_CACHE_LAST_UPDATED_AT_SECONDS = 5 * 60;
export const SUPPORTED_BAPI_VERSION = '2025-04-10';
export const SUPPORTED_HANDSHAKE_FORMAT = 'nonce';

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
  Refresh: '__refresh',
  ClientUat: '__client_uat',
  Handshake: '__clerk_handshake',
  DevBrowser: '__clerk_db_jwt',
  RedirectCount: '__clerk_redirect_count',
  HandshakeFormat: '__clerk_handshake_format',
  HandshakeNonce: '__clerk_handshake_nonce',
} as const;

const QueryParameters = {
  AuthToken: Attributes.AuthToken,
  ClientUat: Cookies.ClientUat,
  DevBrowser: Cookies.DevBrowser,
  Handshake: Cookies.Handshake,
  HandshakeHelp: '__clerk_help',
  LegacyDevBrowser: '__dev_session',
  HandshakeReason: '__clerk_hs_reason',
  HandshakeFormat: Cookies.HandshakeFormat,
  HandshakeNonce: Cookies.HandshakeNonce,
} as const;

const Headers = {
  Accept: 'accept',
  AuthMessage: 'x-clerk-auth-message',
  Authorization: 'authorization',
  AuthReason: 'x-clerk-auth-reason',
  AuthSignature: 'x-clerk-auth-signature',
  AuthStatus: 'x-clerk-auth-status',
  AuthToken: 'x-clerk-auth-token',
  CacheControl: 'cache-control',
  ClerkRedirectTo: 'x-clerk-redirect-to',
  ClerkRequestData: 'x-clerk-request-data',
  ClerkUrl: 'x-clerk-clerk-url',
  CloudFrontForwardedProto: 'cloudfront-forwarded-proto',
  ContentType: 'content-type',
  ContentSecurityPolicy: 'content-security-policy',
  ContentSecurityPolicyReportOnly: 'content-security-policy-report-only',
  EnableDebug: 'x-clerk-debug',
  ForwardedHost: 'x-forwarded-host',
  ForwardedPort: 'x-forwarded-port',
  ForwardedProto: 'x-forwarded-proto',
  Host: 'host',
  Location: 'location',
  Nonce: 'x-nonce',
  Origin: 'origin',
  Referrer: 'referer',
  SecFetchDest: 'sec-fetch-dest',
  UserAgent: 'user-agent',
  ReportingEndpoints: 'reporting-endpoints',
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

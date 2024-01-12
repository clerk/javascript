export const API_URL = 'https://api.clerk.dev';
export const API_VERSION = 'v1';

export const USER_AGENT = `${PACKAGE_NAME}@${PACKAGE_VERSION}`;
export const MAX_CACHE_LAST_UPDATED_AT_SECONDS = 5 * 60;

const Attributes = {
  AuthToken: '__clerkAuthToken',
  AuthStatus: '__clerkAuthStatus',
  AuthReason: '__clerkAuthReason',
  AuthMessage: '__clerkAuthMessage',
} as const;

const Cookies = {
  Session: '__session',
  ClientUat: '__client_uat',
} as const;

const Headers = {
  AuthToken: 'x-clerk-auth-token',
  AuthStatus: 'x-clerk-auth-status',
  AuthReason: 'x-clerk-auth-reason',
  AuthMessage: 'x-clerk-auth-message',
  EnableDebug: 'x-clerk-debug',
  ClerkRedirectTo: 'x-clerk-redirect-to',
  CloudFrontForwardedProto: 'cloudfront-forwarded-proto',
  Authorization: 'authorization',
  ForwardedPort: 'x-forwarded-port',
  ForwardedProto: 'x-forwarded-proto',
  ForwardedHost: 'x-forwarded-host',
  Referrer: 'referer',
  UserAgent: 'user-agent',
  Origin: 'origin',
  Host: 'host',
  ContentType: 'content-type',
} as const;

const SearchParams = {
  AuthStatus: Headers.AuthStatus,
  AuthToken: Headers.AuthToken,
} as const;

const ContentTypes = {
  Json: 'application/json',
} as const;

export const constants = {
  Attributes,
  Cookies,
  Headers,
  SearchParams,
  ContentTypes,
} as const;

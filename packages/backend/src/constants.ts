export const API_URL = 'https://api.clerk.com';
export const API_VERSION = 'v1';

// TODO: Get information from package.json or define them from ESBuild
export const USER_AGENT = `@clerk/backend`;
export const MAX_CACHE_LAST_UPDATED_AT_SECONDS = 5 * 60;

const Attributes = {
  AuthStatus: '__clerkAuthStatus',
  AuthReason: '__clerkAuthReason',
  AuthMessage: '__clerkAuthMessage',
} as const;

const Cookies = {
  Session: '__session',
  ClientUat: '__client_uat',
} as const;

const Headers = {
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

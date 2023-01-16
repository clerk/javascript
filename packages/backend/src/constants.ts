export const API_URL = 'https://api.clerk.dev';
export const API_VERSION = 'v1';

// TODO: Get information from package.json or define them from ESBuild
export const USER_AGENT = `@clerk/backend`;

const Attributes = {
  AuthStatus: '__clerkAuthStatus',
} as const;

const Cookies = {
  Session: '__session',
  ClientUat: '__client_uat',
} as const;

const Headers = {
  AuthStatus: 'x-clerk-auth-status',
  AuthReason: 'x-clerk-auth-reason',
  AuthMessage: 'x-clerk-auth-message',
  Authorization: 'authorization',
  ForwardedPort: 'x-forwarded-port',
  ForwardedHost: 'x-forwarded-host',
  Referrer: 'referer',
  UserAgent: 'user-agent',
  Origin: 'origin',
  Host: 'host',
} as const;

const SearchParams = {
  AuthStatus: Headers.AuthStatus,
} as const;

export const constants = {
  Attributes,
  Cookies,
  Headers,
  SearchParams,
} as const;

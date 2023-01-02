export const Attributes = {
  AuthStatus: '__clerkAuthStatus',
} as const;

export const Cookies = {
  Session: '__session',
  ClientUat: '__client_uat',
} as const;

export const Headers = {
  AuthStatus: 'x-clerk-auth-status',
  AuthReason: 'x-clerk-auth-reasons',
  AuthMessage: 'x-clerk-auth-message',
  NextRewrite: 'x-middleware-rewrite',
  NextResume: 'x-middleware-next',
  NextRedirect: 'Location',
  Authorization: 'authorization',
  ForwardedPort: 'x-forwarded-port',
  ForwardedHost: 'x-forwarded-host',
  Referrer: 'referer',
  UserAgent: 'user-agent',
} as const;

export const SearchParams = {
  AuthStatus: Headers.AuthStatus,
} as const;

export const constants = {
  Attributes,
  Cookies,
  Headers,
  SearchParams,
} as const;

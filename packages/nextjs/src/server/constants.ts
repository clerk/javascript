export const Attributes = {
  AuthStatus: '__clerkAuthStatus',
} as const;

export const Cookies = {
  Session: '__session',
} as const;

export const Headers = {
  AuthStatus: 'x-clerk-auth-status',
  AuthReason: 'x-clerk-auth-reasons',
  AuthMessage: 'x-clerk-auth-message',
  NextRewrite: 'x-middleware-rewrite',
  NextResume: 'x-middleware-next',
  NextRedirect: 'Location',
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

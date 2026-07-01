export { createClerkBridge } from './main/create-clerk-bridge';
export { deepLinkRedirectStrategy, httpRedirectStrategy } from './main/oauth-redirect';
export type { HttpRedirectStrategyOptions } from './main/oauth-redirect';
export { setupPasskeysMain } from './main/passkey-handlers';
export type {
  ClerkBridge,
  CreateClerkBridgeOptions,
  ExposeClerkBridgeOptions,
  OAuthOptions,
  OAuthRedirectStrategy,
  TokenStorage,
} from './shared/types';

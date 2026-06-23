import type { ClerkUIConstructor } from '@clerk/shared/ui';

import type { OAuthTransport, PasskeyBridge, TokenCache } from './shared/types';

declare global {
  const PACKAGE_NAME: string;
  const PACKAGE_VERSION: string;
  const __DEV__: boolean;

  interface Window {
    __clerk_internal_electron?: {
      tokenCache: TokenCache;
      oauthTransport: OAuthTransport;
    };
    __internal_ClerkUICtor?: ClerkUIConstructor;
    __clerk_internal_electron_passkeys?: PasskeyBridge;
  }
}

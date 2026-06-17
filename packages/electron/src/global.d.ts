import type { ClerkUIConstructor } from '@clerk/shared/ui';

import type { OAuthTransport, TokenCache } from './shared/types';

declare const PACKAGE_NAME: string;
declare const PACKAGE_VERSION: string;
declare const __DEV__: boolean;

declare global {
  interface Window {
    __clerk_internal_electron?: {
      tokenCache: TokenCache;
      oauthTransport: OAuthTransport;
    };
    __internal_ClerkUICtor?: ClerkUIConstructor;
  }
}

import type { TokenCache } from './shared/types';

declare global {
  const PACKAGE_NAME: string;
  const PACKAGE_VERSION: string;
  const __DEV__: boolean;

  interface Window {
    __clerk_internal_electron?: {
      tokenCache: TokenCache;
    };
  }
}

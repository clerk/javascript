import type { TokenCache } from './shared/types';

declare const PACKAGE_NAME: string;
declare const PACKAGE_VERSION: string;
declare const __DEV__: boolean;

declare global {
  interface Window {
    __clerk_internal_electron?: {
      tokenCache: TokenCache;
    };
  }
}

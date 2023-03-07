import type { ClerkOptions } from './clerk';

/**
 * DomainOrProxyUrl supports the following cases
 * 1) none of them are set
 * 2) only proxyUrl is set
 * 3) isSatellite and proxy is set
 * 4) isSatellite and domain is set
 */
export type DomainOrProxyUrl =
  | {
      isSatellite?: never;
      proxyUrl?: never | string;
      domain?: never;
    }
  | {
      isSatellite: ClerkOptions['isSatellite'];
      proxyUrl?: never;
      domain: string;
    }
  | {
      isSatellite: ClerkOptions['isSatellite'];
      proxyUrl: string;
      domain?: never;
    };

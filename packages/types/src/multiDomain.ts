import type { Clerk as ClerkInterface, ClerkOptions } from './clerk';

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
      domain: ClerkInterface['domain'];
    }
  | {
      isSatellite: ClerkOptions['isSatellite'];
      proxyUrl: string;
      domain?: never;
    };

export type MultiDomainAndOrProxyPrimitives =
  | {
      isSatellite?: never;
      proxyUrl?: never | string;
      domain?: never;
    }
  | {
      isSatellite: boolean;
      proxyUrl?: never;
      domain: string;
    }
  | {
      isSatellite: boolean;
      proxyUrl: string;
      domain?: never;
    };

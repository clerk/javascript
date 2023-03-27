import type { ClerkOptions } from './clerk';

type DOMAIN = string | ((url: URL) => string);

/**
 * DomainOrProxyUrl supports the following cases
 * 1) none of them are set
 * 2) only proxyUrl is set
 * 3) isSatellite and proxy is set
 * 4) isSatellite and domain is set
 */
export type MultiDomainAndOrProxy =
  | {
      isSatellite?: never;
      proxyUrl?: never | string;
      domain?: never;
    }
  | {
      isSatellite: Exclude<ClerkOptions['isSatellite'], undefined>;
      proxyUrl?: never;
      domain: DOMAIN;
    }
  | {
      isSatellite: Exclude<ClerkOptions['isSatellite'], undefined>;
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

export type DomainOrProxyUrl =
  | {
      proxyUrl?: never;
      domain?: DOMAIN;
    }
  | {
      proxyUrl?: string;
      domain?: never;
    };

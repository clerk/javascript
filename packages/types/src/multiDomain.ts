import type { ClerkOptions } from './clerk';

type StringOrURLFnToString = string | ((url: URL) => string);

/**
 * You can configure proxy and satellite domains in a few ways:
 *
 * 1) none of them are set
 * 2) only `proxyUrl` is set
 * 3) `isSatellite` and `proxyUrl` are set
 * 4) `isSatellite` and `domain` are set
 */
export type MultiDomainAndOrProxy =
  | {
      isSatellite?: never;
      proxyUrl?: never | StringOrURLFnToString;
      domain?: never;
    }
  | {
      isSatellite: Exclude<ClerkOptions['isSatellite'], undefined>;
      proxyUrl?: never;
      domain: StringOrURLFnToString;
    }
  | {
      isSatellite: Exclude<ClerkOptions['isSatellite'], undefined>;
      proxyUrl: StringOrURLFnToString;
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
      domain?: StringOrURLFnToString;
    }
  | {
      proxyUrl?: StringOrURLFnToString;
      domain?: never;
    };

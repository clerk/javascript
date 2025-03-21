import type { ClerkOptions } from './clerk';

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
      /**
       * Whether the application is a satellite application.
       */
      isSatellite?: never;
      /**
       * The URL that Clerk will proxy requests to. Required for applications that run behind a reverse proxy. Can be either a relative path (`/__clerk`) or a full URL (`https://<your-domain>/__clerk`).
       */
      proxyUrl?: never | string | ((url: URL) => string);
      /**
       * **Required if your application is a satellite application**. Sets the domain of the satellite application.
       */
      domain?: never;
    }
  | {
      isSatellite: Exclude<ClerkOptions['isSatellite'], undefined>;
      proxyUrl?: never;
      domain: string | ((url: URL) => string);
    }
  | {
      isSatellite: Exclude<ClerkOptions['isSatellite'], undefined>;
      proxyUrl: string | ((url: URL) => string);
      domain?: never;
    };

export type MultiDomainAndOrProxyPrimitives =
  | {
      /**
       * Whether the application is a satellite application.
       */
      isSatellite?: never;
      /**
       * The URL that Clerk will proxy requests to. Required for applications that run behind a reverse proxy. Can be either a relative path (`/__clerk`) or a full URL (`https://<your-domain>/__clerk`).
       */
      proxyUrl?: never | string;
      /**
       * **Required if your application is a satellite application**. Sets the domain of the satellite application.
       */
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
      /**
       * The URL that Clerk will proxy requests to. Required for applications that run behind a reverse proxy. Can be either a relative path (`/__clerk`) or a full URL (`https://<your-domain>/__clerk`).
       */
      proxyUrl?: never;
      /**
       * **Required if your application is a satellite application**. Sets the domain of the satellite application.
       */
      domain?: string | ((url: URL) => string);
    }
  | {
      proxyUrl?: string | ((url: URL) => string);
      domain?: never;
    };

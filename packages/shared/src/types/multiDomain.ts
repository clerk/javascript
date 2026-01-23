export type MultiDomainConfig = {
  isSatellite: boolean | ((url: URL) => boolean);
  autoSync?: boolean;
  domain?: string | ((url: URL) => string);
  proxyUrl?: string | ((url: URL) => string);
};

export type MultiDomainConfigPrimitives = {
  isSatellite: boolean;
  autoSync?: boolean;
  domain?: string;
  proxyUrl?: string;
};

export type MultiDomainAndOrProxy = {
  proxyUrl?: string | ((url: URL) => string);
  multiDomain?: MultiDomainConfig;
};

export type MultiDomainAndOrProxyPrimitives = {
  proxyUrl?: string;
  multiDomain?: MultiDomainConfigPrimitives;
};

export type DomainOrProxyUrl = {
  /**
   * **Required for applications that run behind a reverse proxy**. The URL that Clerk will proxy requests to. Can be either a relative path (`/__clerk`) or a full URL (`https://<your-domain>/__clerk`).
   */
  proxyUrl?: string | ((url: URL) => string);
  /**
   * **Required if your application is a satellite application**. Sets the domain of the satellite application.
   */
  domain?: string | ((url: URL) => string);
};

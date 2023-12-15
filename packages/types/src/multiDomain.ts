import type { ClerkOptions } from './clerk';

type StringOrURLFnToString = string | ((url: URL) => string);

export type MultiDomainAndOrProxy = {
  isSatellite?: ClerkOptions['isSatellite'];
  proxyUrl?: StringOrURLFnToString;
  domain?: StringOrURLFnToString;
};

export type MultiDomainAndOrProxyPrimitives = {
  isSatellite?: boolean;
  proxyUrl?: string;
  domain?: string;
};

export type DomainOrProxyUrl = {
  proxyUrl?: StringOrURLFnToString;
  domain?: StringOrURLFnToString;
};

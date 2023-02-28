export type DomainOrProxyUrl =
  | {
      proxyUrl?: never;
      domain: string;
    }
  | {
      proxyUrl: string;
      domain?: never;
    };

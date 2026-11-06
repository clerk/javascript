export type MosaicFetchInit = Omit<RequestInit, 'body'> & {
  path: string;
  search?: ConstructorParameters<typeof URLSearchParams>[0];
  body?: BodyInit | Record<string, unknown>;
  rotatingTokenNonce?: string;
  pathPrefix?: string;
};

export type MosaicFetchOptions = {
  forceUpdateClient?: boolean;
  skipUpdateClient?: boolean;
  fetchMaxTries?: number;
};

export type MosaicFetch = <T>(init: MosaicFetchInit, options?: MosaicFetchOptions) => Promise<T | null>;

export type MosaicRuntime = {
  fetch: MosaicFetch;
};

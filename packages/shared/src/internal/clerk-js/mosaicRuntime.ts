export type MosaicRequestInit = Omit<RequestInit, 'body'> & {
  path: string;
  search?: ConstructorParameters<typeof URLSearchParams>[0];
  body?: BodyInit | Record<string, unknown>;
  rotatingTokenNonce?: string;
  pathPrefix?: string;
};

export type MosaicRequestOptions = {
  forceUpdateClient?: boolean;
  skipUpdateClient?: boolean;
  fetchMaxTries?: number;
};

export type MosaicRequest = <T>(init: MosaicRequestInit, options?: MosaicRequestOptions) => Promise<T | null>;

export type MosaicRuntime = {
  request: MosaicRequest;
};

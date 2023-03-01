import type { CreateBackendApiOptions } from './api';
import { createBackendApiClient } from './api';
import type { CreateAuthenticateRequestOptions } from './tokens';
import { createAuthenticateRequest } from './tokens';
import { assertValidSecretKey } from './util/assertValidSecretKey';

export * from './api/resources';
export * from './tokens';
export * from './tokens/jwt';
export * from './tokens/verify';
export { constants } from './constants';

export type ClerkOptions = CreateBackendApiOptions &
  Partial<
    Pick<
      CreateAuthenticateRequestOptions['options'],
      'jwtKey' | 'proxyUrl' | 'secretKey' | 'publishableKey' | 'domain' | 'isSatellite'
    >
  >;

export function Clerk(options: ClerkOptions) {
  const opts = { ...options };
  assertValidSecretKey(opts.secretKey || opts.apiKey);
  const apiClient = createBackendApiClient(opts);
  const requestState = createAuthenticateRequest({ options: opts, apiClient });

  return {
    ...apiClient,
    ...requestState,
    /**
     * @deprecated This prop has been deprecated and will be removed in the next major release.
     */
    __unstable_options: opts,
  };
}

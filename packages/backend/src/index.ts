import { type CreateBackendApiOptions, createBackendApiClient } from './api';
import { type CreateAuthenticateRequestOptions, createAuthenticateRequest } from './tokens';

export * from './api/resources';
export * from './tokens';
export * from './tokens/jwt';
export * from './tokens/verify';
export { constants } from './constants';

export type ClerkOptions = CreateBackendApiOptions &
  Partial<Pick<CreateAuthenticateRequestOptions['options'], 'jwtKey'>>;

export function Clerk(options: ClerkOptions) {
  const opts = { ...options };
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

import { type CreateBackendApiOptions, createBackendApiClient } from './api';
import { type CreateAuthenticateRequestOptions, createAuthenticateRequest } from './tokens';

export * from './api/resources';
export * from './tokens';
export * from './tokens/jwt';
export * from './tokens/verify';
export { constants } from './constants';

export type ClerkOptions = CreateBackendApiOptions &
  Partial<Pick<CreateAuthenticateRequestOptions['mutableOptions'], 'jwtKey'>>;

export function Clerk(options: ClerkOptions) {
  const mutableOptions = { ...options };
  const apiClient = createBackendApiClient(mutableOptions);
  const requestState = createAuthenticateRequest({ mutableOptions, apiClient });

  return {
    ...apiClient,
    ...requestState,
    /**
     * @deprecated This prop has been deprecated and will be removed in the next major release.
     */
    __unstable_mutableOptions: mutableOptions,
  };
}

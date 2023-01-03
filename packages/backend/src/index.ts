import { type CreateBackendApiOptions, createBackendApiClient } from './api';
import { type CreateAuthenticateRequestOptions, createAuthenticateRequest } from './tokens';

export * from './api/resources';
export * from './tokens';
export * from './tokens/jwt';
export * from './tokens/verify';
export { constants } from './constants';

export type ClerkOptions = CreateBackendApiOptions & Pick<CreateAuthenticateRequestOptions, 'jwtKey'>;

export function Clerk(options: ClerkOptions) {
  const apiClient = createBackendApiClient(options);
  const requestState = createAuthenticateRequest({ ...options, apiClient });

  return { ...apiClient, ...requestState };
}

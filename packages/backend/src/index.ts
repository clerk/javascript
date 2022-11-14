import { type CreateBackendApiOptions, createBackendApiClient } from './api';
import { type CreateAuthStateOptions, createAuthState } from './tokens';

export * from './tokens/jwt';
export * from './tokens/verify';

export type ClerkOptions = CreateBackendApiOptions & Pick<CreateAuthStateOptions, 'jwtKey'>;

export default function Clerk(options: ClerkOptions) {
  const apiClient = createBackendApiClient(options);
  const authState = createAuthState({ ...options, apiClient });

  return {
    ...apiClient,
    ...authState,
  };
}

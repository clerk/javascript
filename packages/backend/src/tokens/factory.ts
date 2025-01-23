import type { ApiClient } from '../api';
import { mergePreDefinedOptions } from '../util/mergePreDefinedOptions';
import type { MachineAuthenticatedState, MachineUnauthenticatedState, RequestState } from './authStatus';
import { authenticateRequest as authenticateRequestOriginal, debugRequestState } from './request';
import type { AuthenticateRequestOptions } from './types';

type RunTimeOptions = Omit<AuthenticateRequestOptions, 'apiUrl' | 'apiVersion'>;
type BuildTimeOptions = Partial<
  Pick<
    AuthenticateRequestOptions,
    | 'apiUrl'
    | 'apiVersion'
    | 'audience'
    | 'domain'
    | 'isSatellite'
    | 'jwtKey'
    | 'proxyUrl'
    | 'publishableKey'
    | 'secretKey'
  >
>;

const defaultOptions = {
  secretKey: '',
  jwtKey: '',
  apiUrl: undefined,
  apiVersion: undefined,
  proxyUrl: '',
  publishableKey: '',
  isSatellite: false,
  domain: '',
  audience: '',
} satisfies BuildTimeOptions;

/**
 * @internal
 */
export type CreateAuthenticateRequestOptions = {
  options: BuildTimeOptions;
  apiClient: ApiClient;
};

// This generic allows the types to show up in autocomplete
// We also need to redefine the types here because they don't show up outside the factory and should match the function signature from request.ts
type EntityTypes = 'machine' | 'user' | 'any';

type EntityTypeToState<T extends EntityTypes> = T extends 'machine'
  ? MachineUnauthenticatedState | MachineAuthenticatedState
  : T extends 'user'
    ? RequestState
    : T extends 'any'
      ? RequestState | MachineAuthenticatedState | MachineUnauthenticatedState
      : RequestState;

export function createAuthenticateRequest(params: CreateAuthenticateRequestOptions) {
  const buildTimeOptions = mergePreDefinedOptions(defaultOptions, params.options);
  const apiClient = params.apiClient;

  // No options case
  function authenticateRequest(request: Request): Promise<RequestState>;
  // With entity case
  function authenticateRequest<T extends EntityTypes>(
    request: Request,
    options: RunTimeOptions & { entity: T },
  ): Promise<EntityTypeToState<T>>;
  // With options but no entity case
  function authenticateRequest(request: Request, options: RunTimeOptions): Promise<RequestState>;

  // Implementation
  function authenticateRequest(
    request: Request,
    options: RunTimeOptions = {},
  ): Promise<RequestState | MachineAuthenticatedState | MachineUnauthenticatedState> {
    const { apiUrl, apiVersion } = buildTimeOptions;
    const runTimeOptions = mergePreDefinedOptions(buildTimeOptions, options);
    return authenticateRequestOriginal(request, {
      ...options,
      ...runTimeOptions,
      // We should add all the omitted props from options here (eg apiUrl / apiVersion)
      // to avoid runtime options override them.
      apiUrl,
      apiVersion,
      apiClient,
    });
  }

  return {
    authenticateRequest,
    debugRequestState,
  };
}

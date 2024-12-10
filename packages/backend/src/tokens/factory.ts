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

/**
 * @internal
 */
export function createAuthenticateRequest(params: CreateAuthenticateRequestOptions) {
  const buildTimeOptions = mergePreDefinedOptions(defaultOptions, params.options);
  const apiClient = params.apiClient;

  // These overloads should match the function signature from request.ts
  function authenticateRequest(
    request: Request,
    options: AuthenticateRequestOptions & { entity: 'machine' },
  ): Promise<MachineUnauthenticatedState | MachineAuthenticatedState>;
  function authenticateRequest(
    request: Request,
    options: AuthenticateRequestOptions & { entity: 'user' },
  ): Promise<RequestState>;
  function authenticateRequest(request: Request, options?: AuthenticateRequestOptions): Promise<RequestState>;
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

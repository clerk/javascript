import type { ApiClient } from '../api';
import { mergePreDefinedOptions } from '../util/mergePreDefinedOptions';
import type { AuthenticateRequest } from './request';
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
    | 'machineSecretKey'
  >
>;

const defaultOptions = {
  secretKey: '',
  machineSecretKey: '',
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

  const authenticateRequest: AuthenticateRequest = (request: Request, options: RunTimeOptions = {}) => {
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
  };

  return {
    authenticateRequest,
    debugRequestState,
  };
}

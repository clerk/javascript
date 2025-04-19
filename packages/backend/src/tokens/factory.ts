import type { ApiClient } from '../api';
import type { RequestState } from '../tokens/authStatus';
import { mergePreDefinedOptions } from '../util/mergePreDefinedOptions';
import { authenticateRequest as authenticateRequestOriginal, debugRequestState } from './request';
import type { AuthenticateRequestOptions, TokenType, UniqueTokenArray } from './types';

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

  // No options case
  function authenticateRequest(request: Request): Promise<RequestState>;

  // Single token type case
  function authenticateRequest<T extends TokenType>(
    request: Request,
    options: RunTimeOptions & { acceptsToken: T },
  ): Promise<RequestState<T>>;

  // Any token type case
  function authenticateRequest(
    request: Request,
    options: RunTimeOptions & { acceptsToken: 'any' },
  ): Promise<RequestState<'session_token' | 'api_key' | 'oauth_token' | 'machine_token'>>;

  // List of token types case
  function authenticateRequest<T extends UniqueTokenArray>(
    request: Request,
    options: RunTimeOptions & { acceptsToken: T },
  ): Promise<RequestState<T[number]>>;

  // Implementation
  function authenticateRequest(request: Request, options: RunTimeOptions = {}): Promise<RequestState> {
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

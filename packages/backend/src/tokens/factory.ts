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
  function authenticateRequest(request: Request): Promise<RequestState<'session_token'>>;
  // With options but no acceptsToken case
  function authenticateRequest(
    request: Request,
    options: Omit<RunTimeOptions, 'acceptsToken'>,
  ): Promise<RequestState<'session_token'>>;
  // Single or any token type case
  function authenticateRequest<T extends TokenType | 'any'>(
    request: Request,
    options: RunTimeOptions & { acceptsToken: T },
  ): Promise<RequestState<T extends 'any' ? TokenType : T>>;
  // List of unique token types case
  function authenticateRequest<T extends UniqueTokenArray>(
    request: Request,
    options: RunTimeOptions & { acceptsToken: T },
  ): Promise<RequestState<T[number]>>;

  // Implementation
  function authenticateRequest(request: Request, options: RunTimeOptions = {}): Promise<RequestState<TokenType>> {
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

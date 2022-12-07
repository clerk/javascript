import { type ApiClient } from '../api';
import { API_URL, API_VERSION } from '../constants';
import {
  type LoadInterstitialOptions,
  buildPublicInterstitialUrl,
  loadInterstitialFromBAPI,
  loadInterstitialFromLocal,
} from './interstitial';
import {
  type AuthenticateRequestOptions,
  authenticateRequest as authenticateRequestOriginal,
  RequestState,
} from './request';

export type CreateAuthenticateRequestOptions = Partial<
  Pick<AuthenticateRequestOptions, 'apiKey' | 'apiUrl' | 'apiVersion' | 'frontendApi' | 'jwtKey'>
> & {
  apiClient: ApiClient;
};

export function createAuthenticateRequest(options: CreateAuthenticateRequestOptions) {
  const {
    apiKey: buildtimeApiKey = '',
    apiUrl = API_URL,
    apiVersion = API_VERSION,
    apiClient,
    frontendApi: buildtimeFrontendApi = '',
  } = options;

  const authenticateRequest = ({
    apiKey: runtimeApiKey,
    frontendApi: runtimeFrontendApi,
    ...rest
  }: Omit<AuthenticateRequestOptions, 'apiUrl' | 'apiVersion'>) =>
    authenticateRequestOriginal({
      ...rest,
      apiKey: runtimeApiKey || buildtimeApiKey,
      apiUrl,
      apiVersion,
      frontendApi: runtimeFrontendApi || buildtimeFrontendApi,
    });

  const localInterstitial = loadInterstitialFromLocal;

  const remotePublicInterstitial = ({ frontendApi: runtimeFrontendApi, ...rest }: LoadInterstitialOptions) =>
    loadInterstitialFromBAPI({ ...rest, apiUrl, frontendApi: runtimeFrontendApi || buildtimeFrontendApi });

  const remotePublicInterstitialUrl = buildPublicInterstitialUrl;

  // TODO: Replace this function with remotePublicInterstitial
  const remotePrivateInterstitial = () => apiClient.interstitial.getInterstitial();

  const debugRequestState = ({ frontendApi, isSignedIn, isInterstitial, reason, message }: RequestState) => ({
    frontendApi,
    isSignedIn,
    isInterstitial,
    reason,
    message,
  });

  return {
    authenticateRequest,
    localInterstitial,
    remotePublicInterstitial,
    remotePrivateInterstitial,
    remotePublicInterstitialUrl,
    debugRequestState,
  };
}

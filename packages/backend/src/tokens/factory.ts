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
  debugRequestState,
} from './request';

export type CreateAuthenticateRequestOptions = {
  options: Partial<
    Pick<AuthenticateRequestOptions, 'apiKey' | 'apiUrl' | 'apiVersion' | 'frontendApi' | 'publishableKey' | 'jwtKey'>
  >;
  apiClient: ApiClient;
};

export function createAuthenticateRequest(params: CreateAuthenticateRequestOptions) {
  const { apiClient } = params;
  const {
    apiKey: buildtimeApiKey = '',
    apiUrl = API_URL,
    apiVersion = API_VERSION,
    frontendApi: buildtimeFrontendApi = '',
    publishableKey: buildtimePublishableKey = '',
  } = params.options;

  const authenticateRequest = ({
    apiKey: runtimeApiKey,
    frontendApi: runtimeFrontendApi,
    publishableKey: runtimePublishableKey,
    ...rest
  }: Omit<AuthenticateRequestOptions, 'apiUrl' | 'apiVersion'>) =>
    authenticateRequestOriginal({
      ...rest,
      apiKey: runtimeApiKey || buildtimeApiKey,
      apiUrl,
      apiVersion,
      frontendApi: runtimeFrontendApi || buildtimeFrontendApi,
      publishableKey: runtimePublishableKey || buildtimePublishableKey,
    });

  const localInterstitial = loadInterstitialFromLocal;

  const remotePublicInterstitial = ({
    frontendApi: runtimeFrontendApi,
    publishableKey: runtimePublishableKey,
    ...rest
  }: LoadInterstitialOptions) =>
    loadInterstitialFromBAPI({
      ...rest,
      apiUrl,
      frontendApi: runtimeFrontendApi || buildtimeFrontendApi,
      publishableKey: runtimePublishableKey || buildtimePublishableKey,
    });

  const remotePublicInterstitialUrl = buildPublicInterstitialUrl;

  // TODO: Replace this function with remotePublicInterstitial
  const remotePrivateInterstitial = () => apiClient.interstitial.getInterstitial();

  return {
    authenticateRequest,
    localInterstitial,
    remotePublicInterstitial,
    remotePrivateInterstitial,
    remotePublicInterstitialUrl,
    debugRequestState,
  };
}

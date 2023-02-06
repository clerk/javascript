import type { ApiClient } from '../api';
import { API_URL, API_VERSION } from '../constants';
import type { LoadInterstitialOptions } from './interstitial';
import { buildPublicInterstitialUrl, loadInterstitialFromBAPI, loadInterstitialFromLocal } from './interstitial';
import type { AuthenticateRequestOptions } from './request';
import { authenticateRequest as authenticateRequestOriginal, debugRequestState } from './request';

export type CreateAuthenticateRequestOptions = {
  options: Partial<
    Pick<
      AuthenticateRequestOptions,
      'apiKey' | 'secretKey' | 'apiUrl' | 'apiVersion' | 'frontendApi' | 'publishableKey' | 'jwtKey' | 'proxyUrl'
    >
  >;
  apiClient: ApiClient;
};

export function createAuthenticateRequest(params: CreateAuthenticateRequestOptions) {
  const { apiClient } = params;
  const {
    apiKey: buildtimeApiKey = '',
    secretKey: buildtimeSecretKey = '',
    jwtKey: buildtimeJwtKey = '',
    apiUrl = API_URL,
    apiVersion = API_VERSION,
    frontendApi: buildtimeFrontendApi = '',
    proxyUrl: buildProxyUrl = '',
    publishableKey: buildtimePublishableKey = '',
  } = params.options;

  const authenticateRequest = ({
    apiKey: runtimeApiKey,
    secretKey: runtimeSecretKey,
    frontendApi: runtimeFrontendApi,
    proxyUrl: runtimeProxyUrl,
    publishableKey: runtimePublishableKey,
    jwtKey: runtimeJwtKey,
    ...rest
  }: Omit<AuthenticateRequestOptions, 'apiUrl' | 'apiVersion'>) => {
    return authenticateRequestOriginal({
      ...rest,
      apiKey: runtimeApiKey || buildtimeApiKey,
      secretKey: runtimeSecretKey || buildtimeSecretKey,
      apiUrl,
      apiVersion,
      frontendApi: runtimeFrontendApi || buildtimeFrontendApi,
      proxyUrl: runtimeProxyUrl || buildProxyUrl,
      publishableKey: runtimePublishableKey || buildtimePublishableKey,
      jwtKey: runtimeJwtKey || buildtimeJwtKey,
    });
  };

  const localInterstitial = loadInterstitialFromLocal;

  const remotePublicInterstitial = ({
    frontendApi: runtimeFrontendApi,
    publishableKey: runtimePublishableKey,
    proxyUrl: runtimeProxyUrl,
    ...rest
  }: LoadInterstitialOptions) => {
    return loadInterstitialFromBAPI({
      ...rest,
      apiUrl,
      frontendApi: runtimeFrontendApi || buildtimeFrontendApi,
      proxyUrl: runtimeProxyUrl || buildProxyUrl,
      publishableKey: runtimePublishableKey || buildtimePublishableKey,
    });
  };

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

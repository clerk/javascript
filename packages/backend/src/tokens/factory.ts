import { ApiClient } from '../api';
import { API_URL, API_VERSION } from '../constants';
import {
  buildPublicInterstitialUrl,
  loadInterstitialFromBAPI,
  loadInterstitialFromLocal,
  LoadInterstitialOptions,
} from './interstitial';
import {
  authenticateRequest as authenticateRequestOriginal,
  AuthenticateRequestOptions,
  debugRequestState,
} from './request';

export type CreateAuthenticateRequestOptions = {
  options: Partial<
    Pick<
      AuthenticateRequestOptions,
      'apiKey' | 'secretKey' | 'apiUrl' | 'apiVersion' | 'frontendApi' | 'publishableKey' | 'jwtKey'
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
    publishableKey: buildtimePublishableKey = '',
  } = params.options;

  const authenticateRequest = ({
    apiKey: runtimeApiKey,
    secretKey: runtimeSecretKey,
    frontendApi: runtimeFrontendApi,
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
      publishableKey: runtimePublishableKey || buildtimePublishableKey,
      jwtKey: runtimeJwtKey || buildtimeJwtKey,
    });
  };

  const localInterstitial = loadInterstitialFromLocal;

  const remotePublicInterstitial = ({
    frontendApi: runtimeFrontendApi,
    publishableKey: runtimePublishableKey,
    ...rest
  }: LoadInterstitialOptions) => {
    return loadInterstitialFromBAPI({
      ...rest,
      apiUrl,
      frontendApi: runtimeFrontendApi || buildtimeFrontendApi,
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

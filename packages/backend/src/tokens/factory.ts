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
      | 'audience'
      | 'apiKey'
      | 'secretKey'
      | 'apiUrl'
      | 'apiVersion'
      | 'frontendApi'
      | 'publishableKey'
      | 'jwtKey'
      | 'proxyUrl'
      | 'domain'
      | 'isSatellite'
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
    isSatellite: buildtimeIsSatellite = false,
    domain: buildtimeDomain = '',
    audience: buildtimeAudience = '',
  } = params.options;

  const authenticateRequest = ({
    apiKey: runtimeApiKey,
    secretKey: runtimeSecretKey,
    audience: runtimeAudience,
    frontendApi: runtimeFrontendApi,
    proxyUrl: runtimeProxyUrl,
    publishableKey: runtimePublishableKey,
    jwtKey: runtimeJwtKey,
    isSatellite: runtimeIsSatellite,
    domain: runtimeDomain,
    searchParams,
    ...rest
  }: Omit<AuthenticateRequestOptions, 'apiUrl' | 'apiVersion'>) => {
    return authenticateRequestOriginal({
      ...rest,
      apiKey: runtimeApiKey || buildtimeApiKey,
      secretKey: runtimeSecretKey || buildtimeSecretKey,
      audience: runtimeAudience || buildtimeAudience,
      apiUrl,
      apiVersion,
      frontendApi: runtimeFrontendApi || buildtimeFrontendApi,
      proxyUrl: runtimeProxyUrl || buildProxyUrl,
      publishableKey: runtimePublishableKey || buildtimePublishableKey,
      isSatellite: runtimeIsSatellite || buildtimeIsSatellite,
      domain: runtimeDomain || buildtimeDomain,
      jwtKey: runtimeJwtKey || buildtimeJwtKey,
      searchParams,
    });
  };

  const localInterstitial = ({
    frontendApi: runtimeFrontendApi,
    publishableKey: runtimePublishableKey,
    proxyUrl: runtimeProxyUrl,
    isSatellite: runtimeIsSatellite,
    domain: runtimeDomain,
    ...rest
  }: Omit<LoadInterstitialOptions, 'apiUrl'>) =>
    loadInterstitialFromLocal({
      ...rest,
      frontendApi: runtimeFrontendApi || buildtimeFrontendApi,
      proxyUrl: runtimeProxyUrl || buildProxyUrl,
      publishableKey: runtimePublishableKey || buildtimePublishableKey,
      isSatellite: runtimeIsSatellite || buildtimeIsSatellite,
      domain: runtimeDomain || buildtimeDomain,
    });

  const remotePublicInterstitial = ({
    frontendApi: runtimeFrontendApi,
    publishableKey: runtimePublishableKey,
    proxyUrl: runtimeProxyUrl,
    isSatellite: runtimeIsSatellite,
    domain: runtimeDomain,
    ...rest
  }: LoadInterstitialOptions) => {
    return loadInterstitialFromBAPI({
      ...rest,
      apiUrl,
      frontendApi: runtimeFrontendApi || buildtimeFrontendApi,
      publishableKey: runtimePublishableKey || buildtimePublishableKey,
      proxyUrl: (runtimeProxyUrl || buildProxyUrl) as any,
      isSatellite: runtimeIsSatellite || buildtimeIsSatellite,
      domain: (runtimeDomain || buildtimeDomain) as any,
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

import type { ApiClient } from '../api';
import { API_URL, API_VERSION } from '../constants';
import type { LoadInterstitialOptions } from './interstitial';
import { loadInterstitialFromLocal } from './interstitial';
import type { AuthenticateRequestOptions } from './request';
import { authenticateRequest as authenticateRequestOriginal, debugRequestState } from './request';

export type CreateAuthenticateRequestOptions = {
  options: Partial<
    Pick<
      AuthenticateRequestOptions,
      | 'audience'
      | 'secretKey'
      | 'apiUrl'
      | 'apiVersion'
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
    secretKey: buildtimeSecretKey = '',
    jwtKey: buildtimeJwtKey = '',
    apiUrl = API_URL,
    apiVersion = API_VERSION,
    proxyUrl: buildProxyUrl = '',
    publishableKey: buildtimePublishableKey = '',
    isSatellite: buildtimeIsSatellite = false,
    domain: buildtimeDomain = '',
    audience: buildtimeAudience = '',
  } = params.options;

  const authenticateRequest = ({
    secretKey: runtimeSecretKey,
    audience: runtimeAudience,
    proxyUrl: runtimeProxyUrl,
    publishableKey: runtimePublishableKey,
    jwtKey: runtimeJwtKey,
    isSatellite: runtimeIsSatellite,
    domain: runtimeDomain,
    ...rest
  }: Omit<AuthenticateRequestOptions, 'apiUrl' | 'apiVersion'>) => {
    return authenticateRequestOriginal({
      ...rest,
      secretKey: runtimeSecretKey || buildtimeSecretKey,
      audience: runtimeAudience || buildtimeAudience,
      apiUrl,
      apiVersion,
      proxyUrl: runtimeProxyUrl || buildProxyUrl,
      publishableKey: runtimePublishableKey || buildtimePublishableKey,
      isSatellite: runtimeIsSatellite || buildtimeIsSatellite,
      domain: runtimeDomain || buildtimeDomain,
      jwtKey: runtimeJwtKey || buildtimeJwtKey,
    });
  };

  const localInterstitial = ({
    publishableKey: runtimePublishableKey,
    proxyUrl: runtimeProxyUrl,
    isSatellite: runtimeIsSatellite,
    domain: runtimeDomain,
    ...rest
  }: Omit<LoadInterstitialOptions, 'apiUrl'>) =>
    loadInterstitialFromLocal({
      ...rest,
      proxyUrl: runtimeProxyUrl || buildProxyUrl,
      publishableKey: runtimePublishableKey || buildtimePublishableKey,
      isSatellite: runtimeIsSatellite || buildtimeIsSatellite,
      domain: runtimeDomain || buildtimeDomain,
    });

  // TODO: Replace this function with remotePublicInterstitial
  const remotePrivateInterstitial = () => apiClient.interstitial.getInterstitial();

  return {
    authenticateRequest,
    localInterstitial,
    remotePrivateInterstitial,
    debugRequestState,
  };
}

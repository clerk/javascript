import type { ApiClient } from '../api';
import { API_URL, API_VERSION } from '../constants';
import type { LoadInterstitialOptions } from './interstitial';
import { buildPublicInterstitialUrl, loadInterstitialFromBAPI, loadInterstitialFromLocal } from './interstitial';
import type { AuthenticateRequestOptions, AuthenticateRequestOptionsWithExperimental } from './request';
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
    // @ts-expect-error
    isSatellite: buildtimeIsSatellite = false,
    // @ts-expect-error
    domain: buildtimeDomain = '',
    // @ts-expect-error
    hasJustSynced: buildtimeHasJustSynced = false,
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
    const {
      isSatellite: runtimeIsSatellite,
      domain: runtimeDomain,
      hasJustSynced: runtimeHasJustSynced,
    } = rest as Partial<AuthenticateRequestOptionsWithExperimental>;

    return authenticateRequestOriginal({
      ...rest,
      apiKey: runtimeApiKey || buildtimeApiKey,
      secretKey: runtimeSecretKey || buildtimeSecretKey,
      apiUrl,
      apiVersion,
      frontendApi: runtimeFrontendApi || buildtimeFrontendApi,
      proxyUrl: runtimeProxyUrl || buildProxyUrl,
      publishableKey: runtimePublishableKey || buildtimePublishableKey,
      // @ts-expect-error
      isSatellite: runtimeIsSatellite || buildtimeIsSatellite,
      domain: runtimeDomain || buildtimeDomain,
      jwtKey: runtimeJwtKey || buildtimeJwtKey,
      hasJustSynced: runtimeHasJustSynced || buildtimeHasJustSynced,
    });
  };

  const localInterstitial = loadInterstitialFromLocal;

  const remotePublicInterstitial = ({
    frontendApi: runtimeFrontendApi,
    publishableKey: runtimePublishableKey,
    // @ts-expect-error
    proxyUrl: runtimeProxyUrl,
    // @ts-expect-error
    isSatellite: runtimeIsSatellite,
    // @ts-expect-error
    domain: runtimeDomain,
    ...rest
  }: Omit<LoadInterstitialOptions, 'isSatellite' | 'domain' | 'proxyUrl'>) => {
    return loadInterstitialFromBAPI({
      ...rest,
      apiUrl,
      frontendApi: runtimeFrontendApi || buildtimeFrontendApi,
      publishableKey: runtimePublishableKey || buildtimePublishableKey,
      // @ts-expect-error
      proxyUrl: runtimeProxyUrl || buildProxyUrl,
      isSatellite: runtimeIsSatellite || buildtimeIsSatellite,
      domain: runtimeDomain || buildtimeDomain,
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

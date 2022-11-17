import { type ApiClient } from '../api';
import { API_URL, API_VERSION } from '../constants';
import { type AuthStateOptions, AuthState, getAuthState } from './authState';
import { type LoadInterstitialOptions, loadInterstitialFromBAPI, loadInterstitialFromLocal } from './interstitial';
import { toSSRResource } from './utils';

export type CreateAuthStateOptions = Partial<
  Pick<AuthStateOptions, 'apiKey' | 'apiUrl' | 'apiVersion' | 'frontendApi' | 'jwtKey'>
> & {
  apiClient: ApiClient;
};

export function createAuthState(options: CreateAuthStateOptions) {
  const {
    apiKey: buildtimeApiKey = '',
    apiUrl = API_URL,
    apiVersion = API_VERSION,
    apiClient,
    frontendApi: buildtimeFrontendApi = '',
  } = options;

  const authState = ({
    apiKey: runtimeApiKey,
    frontendApi: runtimeFrontendApi,
    ...rest
  }: Omit<AuthStateOptions, 'apiUrl' | 'apiVersion'>) =>
    getAuthState({
      ...rest,
      apiKey: runtimeApiKey || buildtimeApiKey,
      apiUrl,
      apiVersion,
      frontendApi: runtimeFrontendApi || buildtimeFrontendApi,
    });

  const localInterstitial = loadInterstitialFromLocal;

  const remotePublicInterstitial = ({ frontendApi: runtimeFrontendApi, ...rest }: LoadInterstitialOptions) =>
    loadInterstitialFromBAPI({ ...rest, apiUrl, frontendApi: runtimeFrontendApi || buildtimeFrontendApi });

  // TODO: Replace this function with remotePublicInterstitial
  const remotePrivateInterstitial = () => apiClient.interstitial.getInterstitial();

  const debugAuthState = ({ frontendApi, isSignedIn, isInterstitial, reason, message }: AuthState) => ({
    frontendApi,
    isSignedIn,
    isInterstitial,
    reason,
    message,
  });

  return {
    authState,
    localInterstitial,
    remotePublicInterstitial,
    remotePrivateInterstitial,
    toSSRResource,
    debugAuthState,
  };
}

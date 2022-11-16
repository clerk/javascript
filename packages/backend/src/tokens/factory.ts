import { type ApiClient } from '../api';
import { API_URL, API_VERSION } from '../constants';
import { type AuthStateOptions, getAuthState } from './authState';
import { type LoadInterstitialOptions, loadInterstitialFromBAPI, loadInterstitialFromLocal } from './interstitial';
import { sanitizeResource } from './sanitizer';

export type CreateAuthStateOptions = Partial<Pick<AuthStateOptions, 'apiKey' | 'apiUrl' | 'apiVersion' | 'jwtKey'>> & {
  apiClient: ApiClient;
};

export function createAuthState(options: CreateAuthStateOptions) {
  const { apiKey, apiUrl = API_URL, apiVersion = API_VERSION, apiClient } = options;

  if (!apiKey) {
    throw Error(
      'Missing Clerk API Key. Go to https://dashboard.clerk.dev and get your Clerk API Key for your instance.',
    );
  }

  const authState = (options: Omit<AuthStateOptions, 'apiKey' | 'apiUrl' | 'apiVersion'>) =>
    getAuthState({
      ...options,
      apiKey,
      apiUrl,
      apiVersion,
    });

  const localInterstitial = loadInterstitialFromLocal;

  const remotePublicInterstitial = (options: LoadInterstitialOptions) =>
    loadInterstitialFromBAPI({ ...options, apiUrl });

  const remotePrivateInterstitial = () => apiClient.interstitial.getInterstitial();

  return {
    authState,
    localInterstitial,
    remotePublicInterstitial,
    remotePrivateInterstitial,
    sanitizeResource,
  };
}

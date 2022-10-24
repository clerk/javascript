import { createBackendApiClient } from './api';
import { createSessionVerifier } from './tokens';

export const apiClient = createBackendApiClient();

export const sessionVerifier = createSessionVerifier({
  interstitial: () => apiClient.interstitial.getInterstitial(),
});

export * from './api';
export * from './tokens';

// TODO: Revise the following
export { createGetToken, signedOutGetToken, createSignedOutState } from './util/createGetToken';

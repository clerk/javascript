import { createBackendApiClient } from './api';
import { createSessionVerifier } from './sessionVerifier';

export const apiClient = createBackendApiClient();

export const sessionVerifier = createSessionVerifier({
  interstitial: () => apiClient.interstitial.getInterstitial(),
});

export * from './api';
export * from './sessionVerifier';

// TODO: Revise the following
export { createGetToken, signedOutGetToken, createSignedOutState } from './util/createGetToken';

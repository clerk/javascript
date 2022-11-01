import { getAuthState } from './authState';
// import { DEFAULT_API_KEY } from '../constants';

export type SessionVerifierOptions = {
  // interstitial: any;
};

export function createSessionVerifier(options?: SessionVerifierOptions) {
  // function getAuthStateWithInterstitial(...args) {
  //   return getAuthState({
  //     // interstitial: options?.interstitial,
  //     ...args,
  //   });
  // }
  console.log(options);

  return {
    getAuthState,
  };
}

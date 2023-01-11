import type { SignedInAuthObject, SignedOutAuthObject } from './authObjects';
import { TokenVerificationErrorReason } from './errors';

export enum AuthStatus {
  SignedIn = 'signed-in',
  SignedOut = 'signed-out',
  Interstitial = 'interstitial',
}

export type SignedInState = {
  status: AuthStatus.SignedIn;
  reason: null;
  message: null;
  frontendApi: string;
  publishableKey: string;
  isSignedIn: true;
  isInterstitial: false;
  toAuth: () => SignedInAuthObject;
};

export type SignedOutState = {
  status: AuthStatus.SignedOut;
  message: string;
  reason: AuthReason;
  frontendApi: string;
  publishableKey: string;
  isSignedIn: false;
  isInterstitial: false;
  toAuth: () => SignedOutAuthObject;
};

export type InterstitialState = Omit<SignedOutState, 'isInterstitial' | 'status' | 'toAuth'> & {
  status: AuthStatus.Interstitial;
  isSignedIn: false;
  isInterstitial: true;
  reason: AuthReason;
  toAuth: () => null;
};

export enum AuthErrorReason {
  HeaderMissingNonBrowser = 'header-missing-non-browser',
  HeaderMissingCORS = 'header-missing-cors',
  CookieUATMissing = 'uat-missing',
  CrossOriginReferrer = 'cross-origin-referrer',
  CookieAndUATMissing = 'cookie-and-uat-missing',
  StandardSignedIn = 'standard-signed-in',
  StandardSignedOut = 'standard-signed-out',
  CookieMissing = 'cookie-missing',
  CookieOutDated = 'cookie-outdated',
  UnexpectedError = 'unexpected-error',
  Unknown = 'unknown',
}

export type AuthReason = AuthErrorReason | TokenVerificationErrorReason;

export type RequestState = SignedInState | SignedOutState | InterstitialState;

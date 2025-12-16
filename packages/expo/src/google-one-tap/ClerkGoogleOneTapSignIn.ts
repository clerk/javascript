import { requireNativeModule } from 'expo-modules-core';

import type {
  CancelledResponse,
  ConfigureParams,
  CreateAccountParams,
  ExplicitSignInParams,
  NoSavedCredentialFound,
  OneTapResponse,
  OneTapSuccessResponse,
  SignInParams,
} from './types';

// Type for the native module methods
interface ClerkGoogleSignInNativeModule {
  configure(params: ConfigureParams): void;
  signIn(params: SignInParams): Promise<OneTapResponse>;
  createAccount(params: CreateAccountParams): Promise<OneTapResponse>;
  presentExplicitSignIn(params: ExplicitSignInParams): Promise<OneTapResponse>;
  signOut(): Promise<void>;
}

// Lazy-load the native module to avoid crashes when not available
let _nativeModule: ClerkGoogleSignInNativeModule | null = null;

function getNativeModule(): ClerkGoogleSignInNativeModule {
  if (!_nativeModule) {
    _nativeModule = requireNativeModule<ClerkGoogleSignInNativeModule>('ClerkGoogleSignIn');
  }
  return _nativeModule;
}

/**
 * Check if a response indicates the user cancelled the sign-in flow.
 */
export function isCancelledResponse(response: OneTapResponse): response is CancelledResponse {
  return response.type === 'cancelled';
}

/**
 * Check if a response indicates no saved credential was found.
 */
export function isNoSavedCredentialFoundResponse(response: OneTapResponse): response is NoSavedCredentialFound {
  return response.type === 'noSavedCredentialFound';
}

/**
 * Check if a response is a successful sign-in.
 */
export function isSuccessResponse(response: OneTapResponse): response is OneTapSuccessResponse {
  return response.type === 'success';
}

/**
 * Check if an error has a code property (Google Sign-In error).
 */
export function isErrorWithCode(error: unknown): error is { code: string; message: string } {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  );
}

/**
 * Internal Google One Tap Sign-In module.
 *
 * This module provides native Google Sign-In functionality using Google's
 * Credential Manager API with full nonce support for replay attack protection.
 *
 * @internal This is an internal module. Use the `useSignInWithGoogle` hook instead.
 * @platform Android, iOS
 */
export const ClerkGoogleOneTapSignIn = {
  /**
   * Configure Google Sign-In. Must be called before any sign-in methods.
   *
   * @param params - Configuration parameters
   * @param params.webClientId - The web client ID from Google Cloud Console (required)
   * @param params.hostedDomain - Optional domain restriction
   * @param params.autoSelectEnabled - Auto-select for single credential (default: false)
   */
  configure(params: ConfigureParams): void {
    getNativeModule().configure(params);
  },

  /**
   * Attempt to sign in with saved credentials (One Tap).
   *
   * This method will show the One Tap UI if there are saved credentials,
   * or return a "noSavedCredentialFound" response if there are none.
   *
   * @param params - Sign-in parameters
   * @param params.nonce - Cryptographic nonce for replay protection
   * @param params.filterByAuthorizedAccounts - Only show previously authorized accounts (default: true)
   *
   * @returns Promise resolving to OneTapResponse
   */
  async signIn(params?: SignInParams): Promise<OneTapResponse> {
    try {
      return await getNativeModule().signIn(params ?? {});
    } catch (error) {
      if (isErrorWithCode(error)) {
        if (error.code === 'SIGN_IN_CANCELLED') {
          return { type: 'cancelled', data: null };
        }
        if (error.code === 'NO_SAVED_CREDENTIAL_FOUND') {
          return { type: 'noSavedCredentialFound', data: null };
        }
      }
      throw error;
    }
  },

  /**
   * Create a new account (shows all Google accounts).
   *
   * This method shows the account picker with all available Google accounts,
   * not just previously authorized ones.
   *
   * @param params - Create account parameters
   * @param params.nonce - Cryptographic nonce for replay protection
   *
   * @returns Promise resolving to OneTapResponse
   */
  async createAccount(params?: CreateAccountParams): Promise<OneTapResponse> {
    try {
      return await getNativeModule().createAccount(params ?? {});
    } catch (error) {
      if (isErrorWithCode(error)) {
        if (error.code === 'SIGN_IN_CANCELLED') {
          return { type: 'cancelled', data: null };
        }
        if (error.code === 'NO_SAVED_CREDENTIAL_FOUND') {
          return { type: 'noSavedCredentialFound', data: null };
        }
      }
      throw error;
    }
  },

  /**
   * Present explicit sign-in UI (Google Sign-In button flow).
   *
   * This shows the full Google Sign-In UI, similar to clicking a
   * "Sign in with Google" button.
   *
   * @param params - Explicit sign-in parameters
   * @param params.nonce - Cryptographic nonce for replay protection
   *
   * @returns Promise resolving to OneTapResponse
   */
  async presentExplicitSignIn(params?: ExplicitSignInParams): Promise<OneTapResponse> {
    try {
      return await getNativeModule().presentExplicitSignIn(params ?? {});
    } catch (error) {
      if (isErrorWithCode(error)) {
        if (error.code === 'SIGN_IN_CANCELLED') {
          return { type: 'cancelled', data: null };
        }
      }
      throw error;
    }
  },

  /**
   * Sign out and clear credential state.
   *
   * This disables automatic sign-in until the user signs in again.
   */
  async signOut(): Promise<void> {
    await getNativeModule().signOut();
  },
};

export type {
  ConfigureParams,
  SignInParams,
  CreateAccountParams,
  ExplicitSignInParams,
  OneTapResponse,
  OneTapSuccessResponse,
  CancelledResponse,
  NoSavedCredentialFound,
  GoogleUser,
} from './types';

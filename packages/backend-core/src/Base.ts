import type { ClerkJWTClaims } from '@clerk/types';
import type { CryptoKey as PeculiarCryptoKey } from '@peculiar/webcrypto';

import {
  AuthErrorReason,
  AuthState,
  AuthStateParams,
  AuthStatus,
  BuildAuthenticatedStateOptions,
  JWT,
  TokenVerificationErrorReason,
  VerifySessionTokenOptions,
} from './types';
import { parse } from './util/base64url';
import { isDevelopmentOrStaging, isProduction } from './util/clerkApiKey';
import { mapErrorReasonResponse, TokenVerificationError } from './util/errors';
import { checkClaims, isExpired } from './util/jwt';
import { checkCrossOrigin } from './util/request';

export const API_KEY = process.env.CLERK_API_KEY || '';

type ImportKeyFunction = (...args: any[]) => Promise<CryptoKey | PeculiarCryptoKey>;
type LoadCryptoKeyFunction = (token: string) => Promise<CryptoKey>;
type DecodeBase64Function = (base64Encoded: string) => string;
type VerifySignatureFunction = (...args: any[]) => Promise<boolean>;

export class Base {
  importKeyFunction: ImportKeyFunction;
  verifySignatureFunction: VerifySignatureFunction;
  decodeBase64Function: DecodeBase64Function;
  loadCryptoKeyFunction?: LoadCryptoKeyFunction;

  /**
   * Creates an instance of a Clerk Base.
   * @param {ImportKeyFunction} importKeyFunction Function to import a PEM. Should have a similar result to crypto.subtle.importKey
   * @param {LoadCryptoKeyFunction} loadCryptoKeyFunction Function load a PK CryptoKey from the host environment. Used for JWK clients etc.
   * @param {VerifySignatureFunction} verifySignatureFunction Function to verify a CryptoKey or a similar structure later on. Should have a similar result to crypto.subtle.verify
   * @param {DecodeBase64Function} decodeBase64Function Function to decode a Base64 string. Similar to atob
   */
  constructor(
    importKeyFunction: ImportKeyFunction,
    verifySignatureFunction: VerifySignatureFunction,
    decodeBase64Function: DecodeBase64Function,
    loadCryptoKeyFunction?: LoadCryptoKeyFunction,
  ) {
    this.importKeyFunction = importKeyFunction;
    this.verifySignatureFunction = verifySignatureFunction;
    this.decodeBase64Function = decodeBase64Function;
    this.loadCryptoKeyFunction = loadCryptoKeyFunction;
  }

  /**
   *
   * Verify the session token retrieved using the public key.
   *
   * The public key will be supplied in the form of CryptoKey or will be loaded from the CLERK_JWT_KEY environment variable.
   *
   * @param {string} token
   * @param {VerifySessionTokenOptions} verifySessionTokenOptions
   * @return {Promise<ClerkJWTClaims>} claims
   * @throws {TokenVerificationError|Error}
   */
  verifySessionToken = async (
    token: string,
    { authorizedParties, jwtKey }: VerifySessionTokenOptions = {},
  ): Promise<ClerkJWTClaims> => {
    /**
     * Priority of JWT key search
     * 1. Use supplied key
     * 2. Use load function
     * 3. Try to load from env
     */

    let availableKey: CryptoKey;
    if (!jwtKey && this.loadCryptoKeyFunction) {
      try {
        availableKey = await this.loadCryptoKeyFunction(token);
      } catch (_) {
        throw new TokenVerificationError(TokenVerificationErrorReason.PublicKeyFetchError);
      }
    } else {
      availableKey = await this.loadCryptoKey(jwtKey || process.env.CLERK_JWT_KEY);
    }

    const claims = await this.verifyJwt(availableKey, token);
    checkClaims(claims, authorizedParties);
    return claims;
  };

  /**
   *
   * @param {string} token Clerk JWT verification token
   * Modify the RSA public key from the Clerk PEM supplied and return a contructed CryptoKey.
   * You will find that at your application dashboard (https://dashboard.clerk.dev) under Settings ->  API keys
   *
   */
  loadCryptoKey = async (key?: string): Promise<CryptoKey> => {
    if (!key) {
      throw new TokenVerificationError(TokenVerificationErrorReason.JWTKeyMissing);
    }

    // Next.js in development mode currently cannot parse PEM, but it can
    // parse JWKs. This is a simple way to convert our PEM keys to JWKs
    // until the bug is resolved.

    const RSA_PREFIX = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA';
    const RSA_SUFFIX = 'IDAQAB';

    // JWK https://datatracker.ietf.org/doc/html/rfc7517
    const jwk = {
      kty: 'RSA',
      n: key
        .slice(RSA_PREFIX.length, RSA_SUFFIX.length * -1)
        .replace(/\+/g, '-')
        .replace(/\//g, '_'),
      e: 'AQAB',
    };

    // Algorithm https://developer.mozilla.org/en-US/docs/Web/api/RsaHashedImportParams
    const algorithm = {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    };

    // Based on https://developer.mozilla.org/en-US/docs/Web/api/SubtleCrypto/importKey#subjectpublickeyinfo_import
    try {
      return this.importKeyFunction(jwk, algorithm);
    } catch (_) {
      throw new TokenVerificationError(TokenVerificationErrorReason.ImportKeyError);
    }
  };

  decodeJwt = (token: string): JWT => {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      throw new TokenVerificationError(TokenVerificationErrorReason.MalformedToken);
    }

    const [rawHeader, rawPayload, rawSignature] = tokenParts;
    const header = JSON.parse(this.decodeBase64Function(rawHeader));
    const payload = JSON.parse(this.decodeBase64Function(rawPayload));
    const signature = this.decodeBase64Function(rawSignature.replace(/_/g, '/').replace(/-/g, '+'));
    return {
      header,
      payload,
      signature,
    };
  };

  verifyJwtSignature = async (key: CryptoKey, token: string) => {
    const [rawHeader, rawPayload, rawSignature] = token.split('.');
    const encoder = new TextEncoder();
    const data = encoder.encode([rawHeader, rawPayload].join('.'));
    const signature = parse(rawSignature);

    const isVerified = await this.verifySignatureFunction('RSASSA-PKCS1-v1_5', key, signature, data);
    if (!isVerified) {
      throw new TokenVerificationError(TokenVerificationErrorReason.VerificationFailed);
    }
  };

  verifyJwt = async (key: CryptoKey, token: string): Promise<ClerkJWTClaims> => {
    const { payload } = this.decodeJwt(token);

    await this.verifyJwtSignature(key, token);
    isExpired(payload);

    return payload;
  };

  /**
   *
   * Retrieve the authentication state for a request by using client specific information.
   *
   * @throws {Error} Token expired, Wrong azp, Malformed token. All of these cases should result in signed out state.
   *
   * @param {AuthStateParams}
   * @returns {Promise<AuthState>}
   */
  getAuthState = async ({
    cookieToken,
    clientUat,
    headerToken,
    origin,
    host,
    forwardedHost,
    forwardedPort,
    forwardedProto,
    referrer,
    userAgent,
    authorizedParties,
    fetchInterstitial,
    jwtKey,
  }: AuthStateParams): Promise<AuthState> => {
    if (headerToken) {
      return this.buildAuthenticatedState(headerToken, {
        jwtKey,
        authorizedParties,
        fetchInterstitial,
        tokenType: 'header',
      });
    }

    const isDevelopmentKey = isDevelopmentOrStaging(API_KEY);
    const isProductionKey = isProduction(API_KEY);

    // In development or staging environments only, based on the request's
    // User Agent, detect non-browser requests (e.g. scripts). If there
    // is no Authorization header, consider the user as signed out and
    // prevent interstitial rendering
    if (isDevelopmentKey && !userAgent?.startsWith('Mozilla/')) {
      return { status: AuthStatus.SignedOut, errorReason: AuthErrorReason.HeaderMissingNonBrowser };
    }

    // In cross-origin requests the use of Authorization header is mandatory
    if (
      origin &&
      checkCrossOrigin({
        originURL: new URL(origin),
        host,
        forwardedHost,
        forwardedPort,
        forwardedProto,
      })
    ) {
      return { status: AuthStatus.SignedOut, errorReason: AuthErrorReason.HeaderMissingCORS };
    }

    // First load of development. Could be logged in on Clerk-hosted UI.
    if (isDevelopmentKey && !clientUat) {
      return {
        status: AuthStatus.Interstitial,
        interstitial: await fetchInterstitial(),
        errorReason: AuthErrorReason.UATMissing,
      };
    }

    // Potentially arriving after a sign-in or sign-out on Clerk-hosted UI.
    if (
      isDevelopmentKey &&
      referrer &&
      checkCrossOrigin({
        originURL: new URL(referrer),
        host,
        forwardedHost,
        forwardedPort,
        forwardedProto,
      })
    ) {
      return {
        status: AuthStatus.Interstitial,
        interstitial: await fetchInterstitial(),
        errorReason: AuthErrorReason.CrossOriginReferrer,
      };
    }

    // Probably first load for production
    if (isProductionKey && !clientUat && !cookieToken) {
      return { status: AuthStatus.SignedOut, errorReason: AuthErrorReason.CookieAndUATMissing };
    }

    // Signed out on a different subdomain but Clerk.js has not run to remove the cookie yet.
    // TBD: Can enable if we do not want the __session cookie to be inspected.
    // if (clientUat === '0' && cookieToken) {
    //   return {
    //     status: AuthStatus.Interstitial,
    //     interstitial: await fetchInterstitial(),
    //   };
    // }

    if (clientUat === '0') {
      return { status: AuthStatus.SignedOut, errorReason: AuthErrorReason.StandardOut };
    }

    if (isProductionKey && clientUat && !cookieToken) {
      return {
        status: AuthStatus.Interstitial,
        interstitial: await fetchInterstitial(),
        errorReason: AuthErrorReason.CookieMissing,
      };
    }

    const authenticatedState = await this.buildAuthenticatedState(cookieToken as string, {
      jwtKey,
      authorizedParties,
      fetchInterstitial,
      tokenType: 'cookie',
    });

    if (authenticatedState.sessionClaims && authenticatedState.sessionClaims.iat >= Number(clientUat)) {
      return authenticatedState;
    } else if (authenticatedState.sessionClaims && authenticatedState.sessionClaims.iat < Number(clientUat)) {
      return {
        status: AuthStatus.Interstitial,
        interstitial: await fetchInterstitial(),
        errorReason: AuthErrorReason.CookieOutDated,
      };
    } else if (!authenticatedState.sessionClaims) {
      return authenticatedState;
    }

    return {
      status: AuthStatus.Interstitial,
      interstitial: await fetchInterstitial(),
      errorReason: AuthErrorReason.Unknown,
    };
  };

  buildAuthenticatedState = async (
    token: string,
    { authorizedParties, jwtKey, fetchInterstitial, tokenType }: BuildAuthenticatedStateOptions,
  ): Promise<AuthState> => {
    try {
      const sessionClaims = await this.verifySessionToken(token, {
        authorizedParties,
        jwtKey,
      });

      return {
        status: AuthStatus.SignedIn,
        session: {
          id: sessionClaims.sid,
          userId: sessionClaims.sub,
        },
        sessionClaims,
      };
    } catch (err) {
      if (err instanceof TokenVerificationError) {
        const { errorReason, shouldSignout } = mapErrorReasonResponse(err.reason, tokenType);
        if (shouldSignout) {
          return { status: AuthStatus.SignedOut, errorReason };
        }
        return {
          status: AuthStatus.Interstitial,
          interstitial: await fetchInterstitial(),
          errorReason,
        };
      }
      return { status: AuthStatus.SignedOut, errorReason: AuthErrorReason.InternalError };
    }
  };
}

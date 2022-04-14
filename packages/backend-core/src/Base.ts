import type { CryptoKey as PeculiarCryptoKey } from '@peculiar/webcrypto';

import {
  AuthErrorReason,
  AuthState,
  AuthStateParams,
  AuthStatus,
  BuildAuthenticatedStateOptions,
  JWT,
  JWTPayload,
  TokenType,
  TokenVerificationErrorReason,
  VerifySessionTokenOptions,
} from './types';
import { parse } from './util/base64url';
import { mapErrorReasonResponse, TokenVerificationError } from './util/errors';
import {
  crossOriginRequestWithoutCors,
  hasClientUatButCookieIsMissingInProd,
  isNormalSignedOutState,
  nonBrowserRequestInDevRule,
  potentialFirstLoadInDevWhenUATMissing,
  potentialFirstRequestOnProductionEnvironment,
  potentialRequestAfterSignInOrOurFromClerkHostedUiInDev,
  runInterstitialRules,
} from './util/interstitialRules';
import { checkClaims, isExpired } from './util/jwt';

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

  /*
   * Verify the session token retrieved using the public key.
   * The public key will be supplied in the form of CryptoKey or will be loaded from the CLERK_JWT_KEY environment variable.
   */
  verifySessionToken = async (
    token: string,
    { authorizedParties, jwtKey }: VerifySessionTokenOptions = {},
  ): Promise<JWTPayload> => {
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
   * @param jwt Clerk JWT verification token
   * Modify the RSA public key from the Clerk PEM supplied and return a contructed CryptoKey.
   * You will find that at your application dashboard (https://dashboard.clerk.dev) under Settings ->  API keys
   *
   */
  loadCryptoKey = async (jwt?: string): Promise<CryptoKey> => {
    if (!jwt) {
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
      n: jwt
        .slice(RSA_PREFIX.length, RSA_SUFFIX.length * -1)
        .replace(/\+/g, '-')
        .replace(/\//g, '_'),
      e: 'AQAB',
    };

    // Algorithm https://developer.mozilla.org/en-US/docs/Web/API/RsaHashedImportParams
    const algorithm = {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    };

    // Based on https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey#subjectpublickeyinfo_import
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

  verifyJwt = async (key: CryptoKey, token: string): Promise<JWTPayload> => {
    const { payload } = this.decodeJwt(token);

    await this.verifyJwtSignature(key, token);
    isExpired(payload);

    return payload;
  };

  /**
   * Retrieve the authentication state for a request by using client specific information.
   *
   * @throws Token expired, Wrong azp, Malformed token. All of these cases should result in signed out state.
   */
  getAuthState = async (params: AuthStateParams): Promise<AuthState> => {
    return params.headerToken
      ? this.handleRequestWithTokenInHeader(params)
      : this.handleRequestWithTokenInCookie(params);
  };

  private handleRequestWithTokenInHeader = async (params: AuthStateParams) => {
    try {
      return await this.buildAuthenticatedState(params.headerToken as string, params);
    } catch (err) {
      return this.handleVerifySessionError(err, 'header');
    }
  };

  private handleRequestWithTokenInCookie = async (params: AuthStateParams) => {
    const signedOutOrInterstitial = runInterstitialRules(params, API_KEY, [
      nonBrowserRequestInDevRule,
      crossOriginRequestWithoutCors,
      potentialFirstLoadInDevWhenUATMissing,
      potentialRequestAfterSignInOrOurFromClerkHostedUiInDev,
      potentialFirstRequestOnProductionEnvironment,
      isNormalSignedOutState,
      hasClientUatButCookieIsMissingInProd,
    ]);

    if (signedOutOrInterstitial) {
      return signedOutOrInterstitial;
    }

    try {
      const authenticatedState = await this.buildAuthenticatedState(params.cookieToken as string, params);
      if (!params.clientUat || this.cookieTokenIsOutdated(authenticatedState.sessionClaims, params.clientUat)) {
        return { status: AuthStatus.Interstitial, errorReason: AuthErrorReason.CookieOutDated };
      }
      return authenticatedState;
    } catch (err) {
      return this.handleVerifySessionError(err, 'cookie');
    }
  };

  private cookieTokenIsOutdated(jwt: JWTPayload, clientUat: string) {
    return jwt.iat < Number.parseInt(clientUat);
  }

  private handleVerifySessionError = (err: unknown, type: TokenType) => {
    if (err instanceof TokenVerificationError) {
      const { errorReason, shouldSignout } = mapErrorReasonResponse(err.reason, type);
      return { status: shouldSignout ? AuthStatus.SignedOut : AuthStatus.Interstitial, errorReason };
    }
    return { status: AuthStatus.SignedOut, errorReason: AuthErrorReason.InternalError };
  };

  private buildAuthenticatedState = async (token: string, options: BuildAuthenticatedStateOptions) => {
    const sessionClaims = await this.verifySessionToken(token, options);
    const session = { id: sessionClaims.sid, userId: sessionClaims.sub };
    return { status: AuthStatus.SignedIn, session, sessionClaims };
  };
}

import type { CryptoKey as PeculiarCryptoKey } from '@peculiar/webcrypto';
import { isExpired, checkClaims } from './util/jwt';
import { isDevelopmentOrStaging, isProduction } from './util/clerkApiKey';
import { checkCrossOrigin } from './util/request';
import { JWTPayload, JWT } from './util/types';
import { parse } from './util/base64url';

export const API_KEY = process.env.CLERK_API_KEY || '';

type ImportKeyFunction = (
  ...args: any[]
) => Promise<CryptoKey | PeculiarCryptoKey>;
type DecodeBase64Function = (base64Encoded: string) => string;
type VerifySignatureFunction = (...args: any[]) => Promise<boolean>;

export enum AuthStatus {
  SignedIn = 'Signed in',
  SignedOut = 'Signed out',
  Interstitial = 'Interstitial',
}

export type Session = {
  id?: string;
  userId?: string;
};

type AuthState = {
  status: AuthStatus;
  session?: Session;
  interstitial?: string;
};

type AuthStateParams = {
  cookieToken: string;
  clientUat: string;
  headerToken: string | null;
  origin: string | null;
  host: string | null;
  forwardedHost: string | null;
  forwardedPort: string | null;
  referrer: string | null;
  fetchInterstitial: () => Promise<string>;
};

export class Base {
  importKeyFunction: ImportKeyFunction;
  verifySignatureFunction: VerifySignatureFunction;
  decodeBase64Function: DecodeBase64Function;
  /**
   * Creates an instance of a Clerk Base.
   * @param {ImportKeyFunction} importKeyFunction Function to import a PEM. Should have a similar result to crypto.subtle.importKey
   * @param {VerifySignatureFunction} verifySignatureFunction Function to verify a CryptoKey or a similar structure later on. Should have a similar result to crypto.subtle.verify
   * @param {DecodeBase64Function} decodeBase64Function Function to decode a Base64 string. Similar to atob
   */
  constructor(
    importKeyFunction: ImportKeyFunction,
    verifySignatureFunction: VerifySignatureFunction,
    decodeBase64Function: DecodeBase64Function
  ) {
    this.importKeyFunction = importKeyFunction;
    this.verifySignatureFunction = verifySignatureFunction;
    this.decodeBase64Function = decodeBase64Function;
  }

  /**
   *
   * Verify the session token retrieved using the public key.
   *
   * The public key will be supplied in the form of CryptoKey or will be loaded from the CLERK_JWT_KEY environment variable.
   *
   * @param {string} token
   * @param {CryptoKey | null} [key]
   * @return {Promise<JWTPayload>} claims
   */
  verifySessionToken = async (
    token: string,
    key?: CryptoKey | null
  ): Promise<JWTPayload> => {
    const availableKey = key || (await this.loadPublicKey());
    const claims = await this.verifyJwt(availableKey, token);
    checkClaims(claims);
    return claims;
  };

  /**
   *
   * Construct the RSA public key from the PEM retrieved from the CLERK_JWT_KEY environment variable.
   * You will find that at your application dashboard (https://dashboard.clerk.dev) under Settings ->  API keys
   *
   */
  loadPublicKey = async (): Promise<CryptoKey> => {
    const key = process.env.CLERK_JWT_KEY;
    if (!key) {
      throw new Error('Missing jwt key');
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

    // Algorithm https://developer.mozilla.org/en-US/docs/Web/API/RsaHashedImportParams
    const algorithm = {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    };

    // Based on https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey#subjectpublickeyinfo_import
    return this.importKeyFunction(jwk, algorithm);
  };

  decodeJwt = (token: string): JWT => {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      throw new Error('Malformed token');
    }

    const [rawHeader, rawPayload, rawSignature] = tokenParts;
    const header = JSON.parse(this.decodeBase64Function(rawHeader));
    const payload = JSON.parse(this.decodeBase64Function(rawPayload));
    const signature = this.decodeBase64Function(
      rawSignature.replace(/_/g, '/').replace(/-/g, '+')
    );
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

    const isVerified = await this.verifySignatureFunction(
      'RSASSA-PKCS1-v1_5',
      key,
      signature,
      data
    );
    if (!isVerified) {
      throw new Error('Failed to verify token');
    }
  };

  verifyJwt = async (key: CryptoKey, token: string): Promise<JWTPayload> => {
    const { payload } = this.decodeJwt(token);

    await this.verifyJwtSignature(key, token);
    isExpired(payload);

    return payload;
  };

  getAuthState = async ({
    cookieToken,
    clientUat,
    headerToken,
    origin,
    host,
    forwardedHost,
    forwardedPort,
    referrer,
    fetchInterstitial,
  }: AuthStateParams): Promise<AuthState> => {
    const isCrossOrigin = checkCrossOrigin(
      origin,
      host,
      forwardedHost,
      forwardedPort
    );
    if (headerToken && !this.decodeJwt(headerToken)) {
      return { status: AuthStatus.SignedOut };
    }

    if (!headerToken && isCrossOrigin) {
      return { status: AuthStatus.SignedOut };
    }

    let sessionClaims;
    if (headerToken) {
      sessionClaims = await this.verifySessionToken(headerToken);
      if (sessionClaims) {
        return {
          status: AuthStatus.SignedIn,
          session: {
            id: sessionClaims.sid as string,
            userId: sessionClaims.sub as string,
          },
        };
      }

      return { status: AuthStatus.SignedOut };
    }

    if (isDevelopmentOrStaging(API_KEY) && (!referrer || isCrossOrigin)) {
      return {
        status: AuthStatus.Interstitial,
        interstitial: await fetchInterstitial(),
      };
    }

    if (isProduction(API_KEY) && !clientUat) {
      return { status: AuthStatus.SignedOut };
    }

    if (clientUat === '0') {
      return { status: AuthStatus.SignedOut };
    }

    sessionClaims = await this.verifySessionToken(cookieToken);

    if (
      cookieToken &&
      clientUat &&
      sessionClaims?.iat &&
      sessionClaims.iat >= Number(clientUat)
    ) {
      return {
        status: AuthStatus.SignedIn,
        session: {
          id: sessionClaims.sid as string,
          userId: sessionClaims.sub as string,
        },
      };
    }

    return {
      status: AuthStatus.Interstitial,
      interstitial: await fetchInterstitial(),
    };
  };
}

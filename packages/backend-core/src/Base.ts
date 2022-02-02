import type { CryptoKey as PeculiarCryptoKey } from '@peculiar/webcrypto';
import { JWTExpiredError } from './api/utils/Errors';

import { parse } from './util/base64url';
import { isDevelopmentOrStaging, isProduction } from './util/clerkApiKey';
import { checkClaims, isExpired } from './util/jwt';
import { checkCrossOrigin } from './util/request';
import { JWT, JWTPayload } from './util/types';

export const API_KEY = process.env.CLERK_API_KEY || '';

type ImportKeyFunction = (
  ...args: any[]
) => Promise<CryptoKey | PeculiarCryptoKey>;
type LoadCryptoKeyFunction = (token: string) => Promise<CryptoKey>;
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

export type VerifySessionTokenOptions = {
  authorizedParties?: string[];
}

const verifySessionTokenDefaultOptions: VerifySessionTokenOptions = {
  authorizedParties: [],
}

type AuthState = {
  status: AuthStatus;
  session?: Session;
  interstitial?: string;
  sessionClaims?: JWTPayload;
};

type AuthStateParams = {
  /* Client token cookie value */
  cookieToken?: string;
  /* Client uat cookie value */
  clientUat?: string;
  /* Client token header value */
  headerToken?: string | null;
  /* Request origin header value */
  origin?: string | null;
  /* Request host header value */
  host: string;
  /* Request forwarded host value */
  forwardedHost?: string | null;
  /* Request forwarded port value */
  forwardedPort?: string | null;
  /* Request referrer */
  referrer?: string | null;
  /* Request user-agent value */
  userAgent?: string | null;
  /* A list of authorized parties to validate against the session token azp claim */
  authorizedParties?: string[];
  /* HTTP utility for fetching a text/html string */
  fetchInterstitial: () => Promise<string>;
};

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
    loadCryptoKeyFunction?: LoadCryptoKeyFunction
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
   * @return {Promise<JWTPayload>} claims
   * @throws {JWTExpiredError|Error}
   */
  verifySessionToken = async (token: string, { authorizedParties }: VerifySessionTokenOptions = verifySessionTokenDefaultOptions): Promise<JWTPayload> => {
    // Try to load the PK from supplied function and
    // if there is no custom load function
    // try to load from the environment.
    const availableKey = this.loadCryptoKeyFunction
      ? await this.loadCryptoKeyFunction(token)
      : await this.loadCryptoKeyFromEnv();

    const claims = await this.verifyJwt(availableKey, token);
    checkClaims(claims, authorizedParties);
    return claims;
  };

  /**
   *
   * Modify the RSA public key from the PEM retrieved from the CLERK_JWT_KEY environment variable
   * and return a contructed CryptoKey.
   * You will find that at your application dashboard (https://dashboard.clerk.dev) under Settings ->  API keys
   *
   */
  loadCryptoKeyFromEnv = async (): Promise<CryptoKey> => {
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
    referrer,
    userAgent,
    authorizedParties,
    fetchInterstitial,
  }: AuthStateParams): Promise<AuthState> => {
    const isCrossOrigin = checkCrossOrigin(
      origin,
      host,
      forwardedHost,
      forwardedPort
    );

    let sessionClaims;
    if (headerToken) {
      try {
        sessionClaims = await this.verifySessionToken(headerToken, { authorizedParties });
        return {
          status: AuthStatus.SignedIn,
          session: {
            id: sessionClaims.sid as string,
            userId: sessionClaims.sub as string,
          },
          sessionClaims,
        };
      } catch (err) {
        if (err instanceof JWTExpiredError) {
          return {
            status: AuthStatus.Interstitial,
            interstitial: await fetchInterstitial(),
          };
        } else {
          return { status: AuthStatus.SignedOut };
        }
      }
    }

    // In development or staging environments only, based on the request's
    // User Agent, detect non-browser requests (e.g. scripts). If there
    // is no Authorization header, consider the user as signed out and
    // prevent interstitial rendering
    if (isDevelopmentOrStaging(API_KEY) && !userAgent?.startsWith('Mozilla/')) {
      return { status: AuthStatus.SignedOut };
    }

    // In cross-origin requests the use of Authorization header is mandatory
    if (isCrossOrigin) {
      return { status: AuthStatus.SignedOut };
    }

    // First load of development. Could be logged in on Clerk-hosted UI.
    if (isDevelopmentOrStaging(API_KEY) && !clientUat) {
      return {
        status: AuthStatus.Interstitial,
        interstitial: await fetchInterstitial(),
      };
    }

    // Potentially arriving after a sign-in or sign-out on Clerk-hosted UI.
    if (
      isDevelopmentOrStaging(API_KEY) &&
      referrer &&
      checkCrossOrigin(
        new URL(referrer).origin,
        host,
        forwardedHost,
        forwardedPort
      )
    ) {
      return {
        status: AuthStatus.Interstitial,
        interstitial: await fetchInterstitial(),
      };
    }

    // Probably first load for production
    if (isProduction(API_KEY) && !clientUat && !cookieToken) {
      return { status: AuthStatus.SignedOut };
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
      return { status: AuthStatus.SignedOut };
    }

    if (isProduction(API_KEY) && clientUat && !cookieToken) {
      return {
        status: AuthStatus.Interstitial,
        interstitial: await fetchInterstitial(),
      };
    }

    try {
      sessionClaims = await this.verifySessionToken(cookieToken as string, { authorizedParties });
    } catch (err) {
      if (err instanceof JWTExpiredError) {
        return {
          status: AuthStatus.Interstitial,
          interstitial: await fetchInterstitial(),
        };
      } else {
        return { status: AuthStatus.SignedOut };
      }
    }

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
        sessionClaims,
      };
    }

    return {
      status: AuthStatus.Interstitial,
      interstitial: await fetchInterstitial(),
    };
  };
}

import { AuthStatus, Base, ClerkBackendAPI, ClerkFetcher, JWTPayload } from '@clerk/backend-core';
import Cookies from 'cookies';
import deepmerge from 'deepmerge';
import type { NextFunction, Request, Response } from 'express';
import got, { OptionsOfUnknownResponseBody } from 'got';
import jwt from 'jsonwebtoken';
import jwks, { JwksClient } from 'jwks-rsa';
import querystring from 'querystring';
import { NextApiRequest, NextApiResponse } from 'next';

import { SupportMessages } from './constants/SupportMessages';
import { LIB_NAME, LIB_VERSION } from './info';
import { ClerkServerError } from './utils/Errors';
// utils
import Logger from './utils/Logger';
import { Crypto, CryptoKey } from '@peculiar/webcrypto';

import { decodeBase64, toSPKIDer } from './utils/crypto';

const defaultApiKey = process.env.CLERK_API_KEY || '';
const defaultApiVersion = process.env.CLERK_API_VERSION || 'v1';
const defaultServerApiUrl = process.env.CLERK_API_URL || 'https://api.clerk.dev';
const JWKS_MAX_AGE = 1000 * 60 * 60; // 1 hour
const packageRepo = 'https://github.com/clerkinc/clerk-sdk-node';

export type MiddlewareOptions = {
  onError?: Function;
  authorizedParties?: string[];
};

export type RequireAuthProp<T> = T & {
  auth: { sessionId: string; userId: string };
};

export type WithAuthProp<T> = T & {
  auth: { sessionId: string | null; userId: string | null };
};

export type RequestWithRequiredAuth = RequireAuthProp<NextApiRequest | null>;
export type RequestWithAuth = WithAuthProp<NextApiRequest>;

export type WithAuthHandler<Return = any, Request = RequestWithAuth> = (
  req: Request,
  res: NextApiResponse,
  next?: NextFunction,
) => Return;
export type WithAuthReturn<Return = any> = (
  req: NextApiRequest,
  res: NextApiResponse,
  next?: NextFunction,
) => Promise<Awaited<Return>>;
export type WithAuth = <Return = any>(
  handler: WithAuthHandler<Return>,
  options?: MiddlewareOptions,
) => WithAuthReturn<Return>;

export type RequireAuth = <Return = any>(
  handler: WithAuthHandler<Return, RequestWithRequiredAuth>,
  options?: MiddlewareOptions,
) => WithAuthReturn<Return>;

const crypto = new Crypto();

const importKey = async (jwk: JsonWebKey, algorithm: Algorithm) => {
  return await crypto.subtle.importKey('jwk', jwk, algorithm, true, ['verify']);
};

const verifySignature = async (algorithm: Algorithm, key: CryptoKey, signature: Uint8Array, data: Uint8Array) => {
  return await crypto.subtle.verify(algorithm, key, signature, data);
};

const noop = () => {
  //
};

export default class Clerk extends ClerkBackendAPI {
  base: Base;
  httpOptions: OptionsOfUnknownResponseBody;

  _jwksClient: JwksClient;

  // singleton instance
  static _instance: Clerk;

  constructor({
    apiKey = defaultApiKey,
    serverApiUrl = defaultServerApiUrl,
    apiVersion = defaultApiVersion,
    httpOptions = {},
    jwksCacheMaxAge = JWKS_MAX_AGE,
  }: {
    apiKey?: string;
    serverApiUrl?: string;
    apiVersion?: string;
    httpOptions?: OptionsOfUnknownResponseBody;
    jwksCacheMaxAge?: number;
  } = {}) {
    const fetcher: ClerkFetcher = (url, { method, authorization, contentType, userAgent, body }) => {
      const finalHTTPOptions = deepmerge(this.httpOptions, {
        method,
        responseType: contentType === 'text/html' ? 'text' : 'json',
        headers: {
          authorization,
          'Content-Type': contentType,
          'User-Agent': userAgent,
          'X-Clerk-SDK': `node/${LIB_VERSION}`,
        },
        // @ts-ignore
        ...(body && { body: querystring.stringify(body) }),
      }) as OptionsOfUnknownResponseBody;

      return got(url, finalHTTPOptions).then(data => data.body);
    };

    super({
      apiKey,
      apiVersion,
      serverApiUrl,
      libName: LIB_NAME,
      libVersion: LIB_VERSION,
      packageRepo,
      fetcher,
    });

    if (!apiKey) {
      throw Error(SupportMessages.API_KEY_NOT_FOUND);
    }

    this.httpOptions = httpOptions;

    this._jwksClient = jwks({
      jwksUri: `${serverApiUrl}/${apiVersion}/jwks`,
      requestHeaders: {
        Authorization: `Bearer ${defaultApiKey}`,
      },
      timeout: 5000,
      cache: true,
      cacheMaxAge: jwksCacheMaxAge,
    });

    const loadCryptoKey = async (token: string) => {
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded) {
        throw new Error(`Failed to decode token: ${token}`);
      }

      const signingKey = await this._jwksClient.getSigningKey(decoded.header.kid);
      const pubKey = signingKey.getPublicKey();

      return await crypto.subtle.importKey(
        'spki',
        toSPKIDer(pubKey),
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: 'SHA-256',
        },
        true,
        ['verify'],
      );
    };

    /** Base initialization */

    this.base = new Base(importKey, verifySignature, decodeBase64, loadCryptoKey);
  }

  async verifyToken(token: string, authorizedParties?: string[]): Promise<JWTPayload> {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) {
      throw new Error(`Failed to verify token: ${token}`);
    }

    const key = await this._jwksClient.getSigningKey(decoded.header.kid);
    const verified = jwt.verify(token, key.getPublicKey(), {
      algorithms: ['RS256'],
    }) as JWTPayload;

    if (typeof verified === 'string') {
      throw new Error('Malformed token');
    }

    if (!verified.iss || !verified.iss.startsWith('https://clerk')) {
      throw new Error(`Issuer is invalid: ${verified.iss}`);
    }

    if (verified.azp && authorizedParties && authorizedParties.length > 0) {
      if (!authorizedParties.includes(verified.azp)) {
        throw new Error(`Authorized party is invalid: ${verified.azp}`);
      }
    }

    return verified;
  }

  /**
   * For use as singleton, always returns the same instance
   */
  static getInstance(): Clerk {
    if (!this._instance) {
      this._instance = new Clerk();
    }

    return this._instance;
  }

  /**
   * defaultOnError swallows the error
   */
  defaultOnError(error: Error & { data: any }) {
    Logger.warn(error.message);

    (error.data || []).forEach((serverError: ClerkServerError) => {
      Logger.warn(serverError.longMessage);
    });
  }

  /**
   * strictOnError returns the error so that Express will halt the request chain
   */
  strictOnError(error: Error & { data: any }) {
    Logger.error(error.message);

    (error.data || []).forEach((serverError: ClerkServerError) => {
      Logger.error(serverError.longMessage);
    });

    return error;
  }

  expressWithAuth(
    { onError, authorizedParties }: MiddlewareOptions = {
      onError: this.defaultOnError,
    },
  ): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    function signedOut() {
      throw new Error('Unauthenticated');
    }

    async function authenticate(this: Clerk, req: Request, res: Response, next: NextFunction): Promise<any> {
      const cookies = new Cookies(req, res);

      try {
        const { status, interstitial, sessionClaims } = await this.base.getAuthState({
          cookieToken: cookies.get('__session') as string,
          clientUat: cookies.get('__client_uat') as string,
          headerToken: req.headers.authorization?.replace('Bearer ', ''),
          origin: req.headers.origin,
          host: req.headers.host as string,
          forwardedPort: req.headers['x-forwarded-port'] as string,
          forwardedHost: req.headers['x-forwarded-host'] as string,
          referrer: req.headers.referer,
          userAgent: req.headers['user-agent'] as string,
          authorizedParties,
          fetchInterstitial: () => this.fetchInterstitial(),
        });

        if (status === AuthStatus.SignedOut) {
          return signedOut();
        }

        if (status === AuthStatus.SignedIn) {
          // @ts-expect-error
          req.auth = {
            sessionId: sessionClaims?.sid,
            userId: sessionClaims?.sub,
          };

          return next();
        }

        res.writeHead(401, { 'Content-Type': 'text/html' });
        res.write(interstitial);
        res.end();
      } catch (error) {
        // Auth object will be set to the signed out auth state
        // @ts-expect-error
        req.auth = {
          sessionId: null,
          userId: null,
        };

        // Call onError if provided
        if (!onError) {
          return next();
        }

        const err = await onError(error);

        if (err) {
          next(err);
        } else {
          next();
        }
      }
    }

    return authenticate.bind(this);
  }

  expressRequireAuth(
    { onError, authorizedParties }: MiddlewareOptions = {
      onError: this.strictOnError,
    },
  ) {
    return this.expressWithAuth({ onError, authorizedParties });
  }

  /**
   * Credits to https://nextjs.org/docs/api-routes/api-middlewares
   * Helper method to wait for a middleware to execute before continuing
   * And to throw an error when an error happens in a middleware
   */
  private _runMiddleware(req: any, res: any, fn: any) {
    return new Promise((resolve, reject) => {
      fn(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
  }

  /**
   * Set the session on the request and then call provided handler
   */
  withAuth: WithAuth = (handler, options) => {
    const { onError, authorizedParties } = options || { onError: this.defaultOnError };
    const authenticatedHandler: WithAuthReturn = async (req, res, next) => {
      try {
        await this._runMiddleware(req, res, this.expressWithAuth({ onError, authorizedParties }));
        return handler(req as RequestWithAuth, res, next);
      } catch (e) {
        const errorData = (e as any).data || { error: (e as any).message };
        res.statusCode = (e as any).statusCode || 401;
        // Res.json is available in express-like environments
        // Res.send is available both in express-like and Fastify
        res.json ? res.json(errorData) : res.send(errorData);
        res.end();
        return noop;
      }
    };
    return authenticatedHandler;
  };

  /**
   * Stricter version of withAuth, short-circuits if session can't be determined
   */
  requireAuth: RequireAuth = (handler, options) => {
    const { onError, authorizedParties } = options || { onError: this.defaultOnError };
    return this.withAuth(handler as any, { onError, authorizedParties });
  };
}

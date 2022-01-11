import {
  AuthStatus,
  ClerkBackendAPI,
  ClerkFetcher,
  Session,
} from '@clerk/backend-core';
import Cookies from 'cookies';
import type { NextFunction, Request, Response } from 'express';
import got from 'got';
import jwt, { JwtPayload } from 'jsonwebtoken';
import jwks, { JwksClient } from 'jwks-rsa';
import querystring from 'querystring';

import { SupportMessages } from './constants/SupportMessages';
import { LIB_NAME, LIB_VERSION } from './info';
import { ClerkServerError } from './utils/Errors';
// utils
import Logger from './utils/Logger';

const defaultApiKey = process.env.CLERK_API_KEY || '';
const defaultApiVersion = process.env.CLERK_API_VERSION || 'v1';
const defaultServerApiUrl =
  process.env.CLERK_API_URL || 'https://api.clerk.dev';
const defaultJWKSCacheMaxAge = 3600000; // 1 hour
const packageRepo = 'https://github.com/clerkinc/clerk-sdk-node';

export type MiddlewareOptions = {
  onError?: Function;
};

export type WithSessionProp<T> = T & { session?: Session };
export type RequireSessionProp<T> = T & { session: Session };
export type WithSessionClaimsProp<T> = T & { sessionClaims?: JwtPayload };
export type RequireSessionClaimsProp<T> = T & { sessionClaims: JwtPayload };

import { Base } from '@clerk/backend-core';
import { Crypto, CryptoKey } from '@peculiar/webcrypto';

const crypto = new Crypto();

const decodeBase64 = (base64: string) =>
  Buffer.from(base64, 'base64').toString('binary');

const importKey = async (jwk: JsonWebKey, algorithm: Algorithm) => {
  return await crypto.subtle.importKey('jwk', jwk, algorithm, true, ['verify']);
};

const verifySignature = async (
  algorithm: Algorithm,
  key: CryptoKey,
  signature: Uint8Array,
  data: Uint8Array
) => {
  return await crypto.subtle.verify(algorithm, key, signature, data);
};

/** Base initialization */

const nodeBase = new Base(importKey, verifySignature, decodeBase64);

export default class Clerk extends ClerkBackendAPI {
  // private _restClient: RestClient;
  private _jwksClient: JwksClient;

  // singleton instance
  static _instance: Clerk;

  constructor({
    apiKey = defaultApiKey,
    serverApiUrl = defaultServerApiUrl,
    apiVersion = defaultApiVersion,
    httpOptions = {},
    jwksCacheMaxAge = defaultJWKSCacheMaxAge,
  }: {
    apiKey?: string;
    serverApiUrl?: string;
    apiVersion?: string;
    httpOptions?: object;
    jwksCacheMaxAge?: number;
  } = {}) {
    const fetcher: ClerkFetcher = (
      url,
      { method, authorization, contentType, userAgent, body }
    ) => {
      return got(url, {
        method,
        responseType: 'json',
        headers: {
          authorization,
          'Content-Type': contentType,
          'User-Agent': userAgent,
        },
        // @ts-ignore
        ...(body && { body: querystring.stringify(body) }),
      });
    };

    super({
      apiKey: defaultApiKey,
      apiVersion: defaultApiVersion,
      serverApiUrl: defaultServerApiUrl,
      libName: LIB_NAME,
      libVersion: LIB_VERSION,
      packageRepo,
      fetcher,
    });

    if (!apiKey) {
      throw Error(SupportMessages.API_KEY_NOT_FOUND);
    }

    // TBD: Add jwk client as an argument to getAuthState ?
    // this._jwksClient = jwks({
    //   jwksUri: `${serverApiUrl}/${apiVersion}/jwks`,
    //   requestHeaders: {
    //     Authorization: `Bearer ${apiKey}`,
    //   },
    //   timeout: 5000,
    //   cache: true,
    //   cacheMaxAge: jwksCacheMaxAge,
    // });

    //   const key = await this._jwksClient.getSigningKey(decoded.header.kid);
    //   const verified = jwt.verify(token, key.getPublicKey(), {
    //     algorithms: algorithms as jwt.Algorithm[],
    //   }) as JwtPayload;
  }

  // For use as singleton, always returns the same instance
  static getInstance(): Clerk {
    if (!this._instance) {
      this._instance = new Clerk();
    }

    return this._instance;
  }

  // Middlewares

  // defaultOnError swallows the error
  defaultOnError(error: Error & { data: any }) {
    Logger.warn(error.message);

    (error.data || []).forEach((serverError: ClerkServerError) => {
      Logger.warn(serverError.longMessage);
    });
  }

  // strictOnError returns the error so that Express will halt the request chain
  strictOnError(error: Error & { data: any }) {
    Logger.error(error.message);

    (error.data || []).forEach((serverError: ClerkServerError) => {
      Logger.error(serverError.longMessage);
    });

    return error;
  }

  expressWithSession(
    { onError }: MiddlewareOptions = { onError: this.defaultOnError }
  ): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    function signedOut() {
      throw new Error('Unauthenticated');
    }

    async function authenticate(
      this: Clerk,
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<any> {
      const cookies = new Cookies(req, res);

      try {
        const { status, session, interstitial } = await nodeBase.getAuthState({
          cookieToken: cookies.get('__session') as string,
          clientUat: cookies.get('__client_uat') as string,
          headerToken: req.headers.authorization?.replace('Bearer ', ''),
          origin: req.headers.origin,
          host: req.headers.host,
          forwardedPort: req.headers['x-forwarded-port'] as string,
          forwardedHost: req.headers['x-forwarded-host'] as string,
          referrer: req.headers.referer,
          userAgent: req.headers['user-agent'] as string,
          fetchInterstitial: () => this.fetchInterstitial(),
        });

        if (status === AuthStatus.SignedOut) {
          return signedOut();
        }

        if (status === AuthStatus.SignedIn) {
          // @ts-ignore
          req.session = session;
          return next();
        }

        res.writeHead(401, { 'Content-Type': 'text/html' });
        res.write(interstitial);
        res.end();
      } catch (error) {
        // Session will not be set on request

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

  expressRequireSession(
    { onError }: MiddlewareOptions = { onError: this.strictOnError }
  ) {
    return this.expressWithSession({ onError });
  }

  // Credits to https://nextjs.org/docs/api-routes/api-middlewares
  // Helper method to wait for a middleware to execute before continuing
  // And to throw an error when an error happens in a middleware
  // @ts-ignore
  private _runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      fn(req, res, (result) => {
        if (result instanceof Error) {
          return reject(result);
        }

        return resolve(result);
      });
    });
  }

  // Set the session on the request and then call provided handler
  withSession(
    handler: Function,
    { onError }: MiddlewareOptions = { onError: this.defaultOnError }
  ) {
    return async (
      req: WithSessionProp<Request> | WithSessionClaimsProp<Request>,
      res: Response,
      next: NextFunction
    ) => {
      try {
        await this._runMiddleware(
          req,
          res,
          this.expressWithSession({ onError })
        );
        return handler(req, res, next);
      } catch (error) {
        // @ts-ignore
        const errorData = error.data || { error: error.message };
        // @ts-ignore
        res.statusCode = error.statusCode || 401;
        /**
         * Res.json is available in express-like environments.
         * Res.send is available in express-like but also Fastify.
         */
        res.json ? res.json(errorData) : res.send(errorData);
        res.end();
      }
    };
  }

  // Stricter version, short-circuits if session can't be determined
  requireSession(
    handler: Function,
    { onError }: MiddlewareOptions = { onError: this.strictOnError }
  ) {
    return this.withSession(handler, { onError });
  }
}

﻿import {
  APIRequestOptions,
  AuthStatus,
  Base,
  ClerkAPIResponseError,
  ClerkBackendAPI,
  createGetToken,
  createSignedOutState,
  Logger,
} from '@clerk/backend-core';
import { ClerkJWTClaims, ServerGetToken } from '@clerk/types';
import Cookies from 'cookies';
import deepmerge from 'deepmerge';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import jwks, { JwksClient } from 'jwks-rsa';
import fetch, { RequestInit } from 'node-fetch';

import { SupportMessages } from './constants/SupportMessages';
import { LIB_NAME, LIB_VERSION } from './info';
import {
  decodeBase64,
  importJSONWebKey,
  importPKIKey,
  verifySignature,
} from './utils';

const defaultApiKey = process.env.CLERK_API_KEY || '';
const defaultJWTKey = process.env.CLERK_JWT_KEY;
const defaultApiVersion = process.env.CLERK_API_VERSION || 'v1';
const defaultServerApiUrl =
  process.env.CLERK_API_URL || 'https://api.clerk.dev';
const JWKS_MAX_AGE = 3600000; // 1 hour

export type WithAuthProp<T> = T & {
  auth: {
    sessionId: string | null;
    userId: string | null;
    getToken: ServerGetToken;
    claims: ClerkJWTClaims | null;
  };
};

export type RequireAuthProp<T> = T & {
  auth: {
    sessionId: string;
    userId: string;
    getToken: ServerGetToken;
    claims: ClerkJWTClaims;
  };
};

export type Middleware = (
  req: WithAuthProp<Request>,
  res: Response,
  next: NextFunction
) => Promise<void>;

export type MiddlewareOptions = {
  onError?: (error: ClerkAPIResponseError) => unknown;
  authorizedParties?: string[];
  jwtKey?: string;
  strict?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop: NextFunction = () => {};

export default class Clerk extends ClerkBackendAPI {
  base: Base;
  jwtKey?: string;
  httpOptions: RequestInit;

  _jwksClient: JwksClient;

  // singleton instance
  static _instance: Clerk;

  constructor({
    apiKey = defaultApiKey,
    jwtKey = defaultJWTKey,
    apiUrl = defaultServerApiUrl,
    apiVersion = defaultApiVersion,
    httpOptions = {},
    jwksCacheMaxAge = JWKS_MAX_AGE,
  }: {
    apiKey?: string;
    jwtKey?: string;
    apiUrl?: string;
    apiVersion?: string;
    httpOptions?: RequestInit;
    jwksCacheMaxAge?: number;
  } = {}) {
    super({
      apiKey,
      apiVersion,
      apiUrl,
      libName: LIB_NAME,
      libVersion: LIB_VERSION,
      apiClient: {
        async request<T>(options: APIRequestOptions) {
          const { url, method, queryParams, headerParams, bodyParams } =
            options;
          // Build final URL with search parameters
          const finalUrl = new URL(url || '');

          if (queryParams) {
            for (const [key, val] of Object.entries(
              queryParams as Record<string, string | string[]>
            )) {
              // Support array values for queryParams such as { foo: [42, 43] }
              if (val) {
                [val]
                  .flat()
                  .forEach((v) => finalUrl.searchParams.append(key, v));
              }
            }
          }

          const response = await fetch(
            finalUrl.href,
            deepmerge(httpOptions, {
              method,
              headers: headerParams as Record<string, string>,
              ...(bodyParams &&
                Object.keys(bodyParams).length > 0 && {
                  body: JSON.stringify(bodyParams),
                }),
            })
          );

          // Parse JSON or Text response.
          const isJSONResponse =
            headerParams && headerParams['Content-Type'] === 'application/json';
          const data = (await (isJSONResponse
            ? response.json()
            : response.text())) as T;

          // Check for errors
          if (!response.ok) {
            throw new ClerkAPIResponseError(response.statusText, {
              data: (data as any)?.errors || data,
              status: response.status,
            });
          }

          return data;
        },
      },
    });

    if (!apiKey) {
      throw Error(SupportMessages.API_KEY_NOT_FOUND);
    }

    this.httpOptions = httpOptions;
    this.jwtKey = jwtKey;

    this._jwksClient = jwks({
      jwksUri: `${apiUrl}/${apiVersion}/jwks`,
      requestHeaders: {
        Authorization: `Bearer ${apiKey}`,
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

      const signingKey = await this._jwksClient.getSigningKey(
        decoded.header.kid
      );
      const publicKey = signingKey.getPublicKey();

      return importPKIKey(publicKey);
    };

    /** Base initialization */
    // TODO: More comprehensive base initialization
    this.base = new Base(
      importJSONWebKey,
      verifySignature,
      decodeBase64,
      loadCryptoKey
    );
  }

  async verifyToken(
    token: string,
    authorizedParties?: string[]
  ): Promise<ClerkJWTClaims> {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) {
      throw new Error(`Failed to verify token: ${token}`);
    }

    const key = await this._jwksClient.getSigningKey(decoded.header.kid);
    const verified = jwt.verify(token, key.getPublicKey(), {
      algorithms: ['RS256'],
    }) as ClerkJWTClaims;

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

  // For use as singleton, always returns the same instance
  static getInstance(): Clerk {
    if (!this._instance) {
      this._instance = new Clerk();
    }

    return this._instance;
  }

  private logError(error: ClerkAPIResponseError | Error, strict = false) {
    const logLevel = strict ? 'error' : 'warn';
    Logger[logLevel](error.message);

    if (error instanceof ClerkAPIResponseError) {
      (error.errors || []).forEach(({ message, longMessage }) =>
        Logger[logLevel](longMessage || message)
      );
    }
  }

  private nodeAuthenticate(options: MiddlewareOptions): Middleware {
    function signedOut() {
      throw new Error('Unauthenticated');
    }

    const { onError, authorizedParties, jwtKey, strict } = options;

    async function authenticate(
      this: Clerk,
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<any> {
      try {
        const cookies = new Cookies(req, res);
        const cookieToken = cookies.get('__session') as string;
        const headerToken = req.headers.authorization?.replace('Bearer ', '');

        const { status, interstitial, sessionClaims, errorReason } =
          await this.base.getAuthState({
            cookieToken,
            headerToken,
            clientUat: cookies.get('__client_uat') as string,
            origin: req.headers.origin,
            host: req.headers.host as string,
            forwardedPort: req.headers['x-forwarded-port'] as string,
            forwardedHost: req.headers['x-forwarded-host'] as string,
            referrer: req.headers.referer,
            userAgent: req.headers['user-agent'] as string,
            authorizedParties,
            jwtKey: jwtKey || this.jwtKey,
            fetchInterstitial: () => this.fetchInterstitial(),
          });

        errorReason && res.setHeader('Auth-Result', errorReason);

        if (status === AuthStatus.SignedOut) {
          return signedOut();
        }

        if (status === AuthStatus.SignedIn) {
          // @ts-expect-error
          req.auth = {
            sessionId: sessionClaims?.sid,
            userId: sessionClaims?.sub,
            getToken: createGetToken({
              headerToken,
              cookieToken,
              sessionId: sessionClaims?.sid,
              fetcher: (...args) => this.sessions.getToken(...args),
            }),
            claims: sessionClaims,
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
          userId: null,
          sessionId: null,
          getToken: createSignedOutState().getToken,
          claims: null,
        };

        this.logError(error as any, strict);
        const err = onError ? await onError(error as any) : error;

        // If strict, err will be returned to the Express-like `next` callback to signify an error should halt the request chain
        if (strict) {
          next(err);
        } else {
          next();
        }
      }
    }

    return authenticate.bind(this);
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

  // Middlewares

  expressWithAuth(options: MiddlewareOptions = {}) {
    return this.nodeAuthenticate({ strict: false, ...options });
  }

  expressRequireAuth(options?: MiddlewareOptions) {
    return this.nodeAuthenticate({ strict: true, ...options });
  }

  // Set the session on the request and then call provided handler
  withAuth(handler: Middleware, options?: MiddlewareOptions) {
    return async (
      req: WithAuthProp<Request>,
      res: Response,
      next?: NextFunction
    ) => {
      try {
        await this._runMiddleware(req, res, this.expressWithAuth(options));
        return handler(req, res, next || noop);
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
  requireAuth(handler: Middleware, options?: MiddlewareOptions) {
    return this.withAuth(handler, { strict: true, ...options });
  }
}

import {
  AuthStatus,
  Base,
  ClerkBackendAPI,
  ClerkFetcher,
  createGetToken,
  createSignedOutState,
  JWTPayload,
} from '@clerk/backend-core';
import { ServerGetToken } from '@clerk/types';
import { Crypto, CryptoKey } from '@peculiar/webcrypto';
import Cookies from 'cookies';
import deepmerge from 'deepmerge';
import type { NextFunction, Request, Response } from 'express';
import got, { OptionsOfUnknownResponseBody } from 'got';
import jwt from 'jsonwebtoken';
import jwks, { JwksClient } from 'jwks-rsa';
import querystring from 'querystring';

import { SupportMessages } from './constants/SupportMessages';
import { LIB_NAME, LIB_VERSION } from './info';
import { decodeBase64, toSPKIDer } from './utils/crypto';
import { ClerkServerError } from './utils/Errors';
// utils
import Logger from './utils/Logger';

const defaultApiKey = process.env.CLERK_API_KEY || '';
const defaultJWTKey = process.env.CLERK_JWT_KEY;
const defaultApiVersion = process.env.CLERK_API_VERSION || 'v1';
const defaultServerApiUrl =
  process.env.CLERK_API_URL || 'https://api.clerk.dev';
const JWKS_MAX_AGE = 3600000; // 1 hour
const packageRepo = 'https://github.com/clerkinc/clerk-sdk-node';

export type MiddlewareOptions = {
  onError?: Function;
  authorizedParties?: string[];
  jwtKey?: string;
};

export type WithAuthProp<T> = T & {
  auth: {
    sessionId: string | null;
    userId: string | null;
    getToken: ServerGetToken;
    claims: Record<string, unknown> | null;
  };
};

export type RequireAuthProp<T> = T & {
  auth: {
    sessionId: string;
    userId: string;
    getToken: ServerGetToken;
    claims: Record<string, unknown>;
  };
};

const crypto = new Crypto();

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

export default class Clerk extends ClerkBackendAPI {
  base: Base;
  jwtKey?: string;
  httpOptions: OptionsOfUnknownResponseBody;

  _jwksClient: JwksClient;

  // singleton instance
  static _instance: Clerk;

  constructor({
    apiKey = defaultApiKey,
    jwtKey = defaultJWTKey,
    serverApiUrl = defaultServerApiUrl,
    apiVersion = defaultApiVersion,
    httpOptions = {},
    jwksCacheMaxAge = JWKS_MAX_AGE,
  }: {
    apiKey?: string;
    jwtKey?: string;
    serverApiUrl?: string;
    apiVersion?: string;
    httpOptions?: OptionsOfUnknownResponseBody;
    jwksCacheMaxAge?: number;
  } = {}) {
    const fetcher: ClerkFetcher = (
      url,
      { method, authorization, contentType, userAgent, body }
    ) => {
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

      return got(url, finalHTTPOptions).then((data) => data.body);
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
    this.jwtKey = jwtKey;

    this._jwksClient = jwks({
      jwksUri: `${serverApiUrl}/${apiVersion}/jwks`,
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
      const pubKey = signingKey.getPublicKey();

      return await crypto.subtle.importKey(
        'spki',
        toSPKIDer(pubKey),
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: 'SHA-256',
        },
        true,
        ['verify']
      );
    };

    /** Base initialization */

    // TODO: More comprehensive base initialization
    this.base = new Base(
      importKey,
      verifySignature,
      decodeBase64,
      loadCryptoKey
    );
  }

  async verifyToken(
    token: string,
    authorizedParties?: string[]
  ): Promise<JWTPayload> {
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

  expressWithAuth(
    { onError, authorizedParties, jwtKey }: MiddlewareOptions = {
      onError: this.defaultOnError,
    }
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
      try {
        const cookies = new Cookies(req, res);
        const cookieToken = cookies.get('__session') as string;
        const headerToken = req.headers.authorization?.replace('Bearer ', '');

        const { status, sessionClaims, errorReason } =
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
        res.write(this.fetchInterstitial());
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
    options: MiddlewareOptions = {
      onError: this.strictOnError,
    }
  ) {
    return this.expressWithAuth(options);
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
  withAuth(
    handler: Function,
    options: MiddlewareOptions = {
      onError: this.defaultOnError,
    }
  ) {
    return async (
      req: WithAuthProp<Request>,
      res: Response,
      next?: NextFunction
    ) => {
      try {
        await this._runMiddleware(req, res, this.expressWithAuth(options));
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
  requireAuth(
    handler: Function,
    options: MiddlewareOptions = {
      onError: this.strictOnError,
    }
  ) {
    return this.withAuth(handler, options);
  }
}

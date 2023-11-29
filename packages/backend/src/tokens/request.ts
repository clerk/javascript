import { constants } from '../constants';
import { assertValidSecretKey } from '../util/assertValidSecretKey';
import { buildRequest, stripAuthorizationHeader } from '../util/IsomorphicRequest';
import { isDevelopmentFromSecretKey } from '../util/shared';
import type { AuthStatusOptionsType, RequestState } from './authStatus';
import { AuthErrorReason, handshake, signedOut } from './authStatus';
import type { TokenCarrier } from './errors';
import { TokenVerificationError, TokenVerificationErrorReason } from './errors';
import type { HandshakeRulesOptions } from './handshakeRule';
import { rules, runHandshakeRules } from './handshakeRule';
import type { VerifyTokenOptions } from './verify';

export type OptionalVerifyTokenOptions = Partial<
  Pick<
    VerifyTokenOptions,
    'audience' | 'authorizedParties' | 'clockSkewInMs' | 'jwksCacheTtlInMs' | 'skipJwksCache' | 'jwtKey'
  >
>;

export type AuthenticateRequestOptions = AuthStatusOptionsType &
  OptionalVerifyTokenOptions & {
    request: Request;
    handshakeToken?: string;
  };

function assertSignInUrlExists(signInUrl: string | undefined, key: string): asserts signInUrl is string {
  if (!signInUrl && isDevelopmentFromSecretKey(key)) {
    throw new Error(`Missing signInUrl. Pass a signInUrl for dev instances if an app is satellite`);
  }
}

function assertProxyUrlOrDomain(proxyUrlOrDomain: string | undefined) {
  if (!proxyUrlOrDomain) {
    throw new Error(`Missing domain and proxyUrl. A satellite application needs to specify a domain or a proxyUrl`);
  }
}

function assertSignInUrlFormatAndOrigin(_signInUrl: string, origin: string) {
  let signInUrl: URL;
  try {
    signInUrl = new URL(_signInUrl);
  } catch {
    throw new Error(`The signInUrl needs to have a absolute url format.`);
  }

  if (signInUrl.origin === origin) {
    throw new Error(`The signInUrl needs to be on a different origin than your satellite application.`);
  }
}

export async function authenticateRequest(options: AuthenticateRequestOptions): Promise<RequestState> {
  const { cookies, headers, searchParams } = buildRequest(options?.request);

  const ruleOptions = {
    ...options,
    ...loadOptionsFromHeaders(headers),
    ...loadOptionsFromCookies(cookies),
    request: options.request,
    searchParams,
  } satisfies HandshakeRulesOptions;

  assertValidSecretKey(ruleOptions.secretKey);

  if (ruleOptions.isSatellite) {
    assertSignInUrlExists(ruleOptions.signInUrl, ruleOptions.secretKey);
    if (ruleOptions.signInUrl && ruleOptions.origin) {
      assertSignInUrlFormatAndOrigin(ruleOptions.signInUrl, ruleOptions.origin);
    }
    assertProxyUrlOrDomain(ruleOptions.proxyUrl || ruleOptions.domain);
  }

  function handleError(err: unknown, tokenCarrier: TokenCarrier) {
    if (!(err instanceof TokenVerificationError)) {
      return signedOut(ruleOptions, AuthErrorReason.UnexpectedError, (err as Error).message);
    }

    err.tokenCarrier = tokenCarrier;
    const recoverableErrors = [
      TokenVerificationErrorReason.TokenExpired,
      TokenVerificationErrorReason.TokenNotActiveYet,
    ].includes(err.reason);

    if (!recoverableErrors || tokenCarrier === 'header') {
      return signedOut(ruleOptions, err.reason, err.getFullMessage());
    }

    return handshake(ruleOptions, err.reason, err.getFullMessage());
  }

  async function authenticateRequestWithTokenInHeader() {
    try {
      return await runHandshakeRules(ruleOptions, [rules.hasValidHeaderToken]);
    } catch (err) {
      return handleError(err, 'header');
    }
  }

  async function authenticateRequestWithTokenInCookie() {
    try {
      return await runHandshakeRules(ruleOptions, [rules.hasValidCookieToken]);
    } catch (err) {
      return handleError(err, 'cookie');
    }
  }

  return ruleOptions.headerToken ? authenticateRequestWithTokenInHeader() : authenticateRequestWithTokenInCookie();
}

export const debugRequestState = (params: RequestState) => {
  const { proxyUrl, reason, message, publishableKey, isSatellite, domain, status } = params;
  return { proxyUrl, reason, message, publishableKey, isSatellite, domain, status };
};

/**
 * Load authenticate request options related to headers.
 */
export const loadOptionsFromHeaders = (headers: ReturnType<typeof buildRequest>['headers']) => {
  if (!headers) {
    return {};
  }

  return {
    headerToken: stripAuthorizationHeader(headers(constants.Headers.Authorization)),
    origin: headers(constants.Headers.Origin),
    host: headers(constants.Headers.Host),
    forwardedHost: headers(constants.Headers.ForwardedHost),
    forwardedProto: headers(constants.Headers.CloudFrontForwardedProto) || headers(constants.Headers.ForwardedProto),
    referrer: headers(constants.Headers.Referrer),
    userAgent: headers(constants.Headers.UserAgent),
  };
};

/**
 * Load authenticate request options related to cookies.
 */
export const loadOptionsFromCookies = (cookies: ReturnType<typeof buildRequest>['cookies']) => {
  if (!cookies) {
    return {};
  }

  return {
    cookieToken: cookies?.(constants.Cookies.Session),
    clientUat: cookies?.(constants.Cookies.ClientUat),
  };
};

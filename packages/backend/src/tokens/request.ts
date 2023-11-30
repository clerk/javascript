import { parsePublishableKey } from '@clerk/shared/keys';

import { constants } from '../constants';
import { assertValidSecretKey } from '../util/assertValidSecretKey';
import { buildRequest, stripAuthorizationHeader } from '../util/IsomorphicRequest';
import { addClerkPrefix, isDevelopmentFromSecretKey, isDevOrStagingUrl } from '../util/shared';
import { buildRequestUrl } from '../utils';
import type { AuthStatusOptionsType, RequestState } from './authStatus';
import { AuthErrorReason, handshake, interstitial, signedIn, signedOut, unknownState } from './authStatus';
import type { TokenCarrier } from './errors';
import { TokenVerificationError, TokenVerificationErrorReason } from './errors';
import type { InterstitialRuleOptions } from './interstitialRule';
// TODO: Rename this crap, it's not interstitial anymore.
import { hasValidHeaderToken, runInterstitialRules } from './interstitialRule';
import { decodeJwt } from './jwt';
import { verifyToken, type VerifyTokenOptions } from './verify';
export type OptionalVerifyTokenOptions = Partial<
  Pick<
    VerifyTokenOptions,
    'audience' | 'authorizedParties' | 'clockSkewInMs' | 'jwksCacheTtlInMs' | 'skipJwksCache' | 'jwtKey'
  >
>;

export type AuthenticateRequestOptions = AuthStatusOptionsType & OptionalVerifyTokenOptions & { request: Request };

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
    searchParams,
  } satisfies InterstitialRuleOptions;

  assertValidSecretKey(ruleOptions.secretKey);

  if (ruleOptions.isSatellite) {
    assertSignInUrlExists(ruleOptions.signInUrl, ruleOptions.secretKey);
    if (ruleOptions.signInUrl && ruleOptions.origin) {
      assertSignInUrlFormatAndOrigin(ruleOptions.signInUrl, ruleOptions.origin);
    }
    assertProxyUrlOrDomain(ruleOptions.proxyUrl || ruleOptions.domain);
  }

  async function authenticateRequestWithTokenInHeader() {
    try {
      const state = await runInterstitialRules(ruleOptions, [hasValidHeaderToken]);
      return state;
    } catch (err) {
      return handleError(err, 'header');
    }
  }

  async function authenticateRequestWithTokenInCookie() {
    function buildRedirectToHandshake({
      publishableKey,
      devBrowserToken,
      redirectUrl,
      domain,
      proxyUrl,
    }: {
      publishableKey: string;
      devBrowserToken: string;
      redirectUrl: string;
      domain?: string;
      proxyUrl?: string;
    }): string {
      const pk = parsePublishableKey(publishableKey);
      const pkFapi = pk?.frontendApi || '';
      // determine proper FAPI url, taking into account multi-domain setups
      const frontendApi = proxyUrl || (!isDevOrStagingUrl(pkFapi) ? addClerkPrefix(domain) : '') || pkFapi;

      const url = new URL(`https://${frontendApi}/v1/client/handshake`);
      url.searchParams.append('redirect_url', redirectUrl);

      if (pk?.instanceType === 'development' && devBrowserToken) {
        url.searchParams.append('__clerk_db_jwt', devBrowserToken);
      }
      return url.href;
    }

    async function verifyRequestState(options: InterstitialRuleOptions, token: string) {
      const { isSatellite, proxyUrl } = options;
      let issuer;
      if (isSatellite) {
        issuer = null;
      } else if (proxyUrl) {
        issuer = proxyUrl;
      } else {
        issuer = (iss: string) => iss.startsWith('https://clerk.') || iss.includes('.clerk.accounts');
      }

      return verifyToken(token, { ...options, issuer });
    }

    const clientUat = parseInt(ruleOptions.clientUat || '', 10) || 0;
    const hasActiveClient = clientUat > 0;
    // TODO rename this to sessionToken
    const sessionToken = ruleOptions.sessionTokenInCookie;
    const hasSessionToken = !!sessionToken;
    const handshakeToken = ruleOptions.handshakeToken;

    // ================ This is to end the handshake if necessary ===================
    if (handshakeToken) {
      const headers = new Headers({
        'Access-Control-Allow-Origin': 'null',
        'Access-Control-Allow-Credentials': 'true',
      });

      const cookiesToSet = JSON.parse(atob(handshakeToken)) as string[];

      let sessionToken = '';
      cookiesToSet.forEach((x: string) => {
        headers.append('Set-Cookie', x);
        if (x.startsWith('__session=')) {
          sessionToken = x.split(';')[0].substring(10);
        }
      });

      if (parsePublishableKey(options.publishableKey)?.instanceType === 'development') {
        const newUrl = new URL(options.request.url);
        newUrl.searchParams.delete('__clerk_handshake');
        newUrl.searchParams.delete('__clerk_help');

        headers.append('Location', newUrl.toString());
      }

      if (sessionToken === '') {
        return signedOut(ruleOptions, AuthErrorReason.SessionTokenMissing, '', headers);
      }

      try {
        const verifyResult = await verifyRequestState(ruleOptions, sessionToken);
        if (verifyResult) {
          return signedIn(ruleOptions, verifyResult, headers);
        }
      } catch (err) {
        return signedOut(ruleOptions, AuthErrorReason.ClockSkew, '', headers);
      }
    }

    // ================ This is to start the handshake if necessary ===================
    if (ruleOptions.isSatellite && !new URL(options.request.url).searchParams.has('__clerk_synced')) {
      const redirectUrl = buildRequestUrl(options.request);
      const headers = new Headers();
      headers.set(
        'Location',
        buildRedirectToHandshake({
          publishableKey: ruleOptions.publishableKey!,
          devBrowserToken: ruleOptions.devBrowserToken!,
          redirectUrl: redirectUrl.toString(),
          proxyUrl: ruleOptions.proxyUrl,
          domain: ruleOptions.domain,
        }),
      );

      // TODO: Add status code for redirection
      return handshake(ruleOptions, AuthErrorReason.SatelliteCookieNeedsSyncing, '', headers);
    }

    if (!hasActiveClient && !hasSessionToken) {
      return signedOut(ruleOptions, AuthErrorReason.CookieAndUATMissing);
    }

    // This can eagerly run handshake since client_uat is SameSite=Strict in dev
    if (!hasActiveClient && hasSessionToken) {
      const headers = new Headers();
      headers.set(
        'Location',
        buildRedirectToHandshake({
          publishableKey: ruleOptions.publishableKey!,
          devBrowserToken: ruleOptions.devBrowserToken!,
          redirectUrl: ruleOptions.request.url.toString(),
        }),
      );

      // TODO: Add status code for redirection
      return handshake(ruleOptions, AuthErrorReason.SessionTokenWithoutClientUAT, '', headers);
    }

    if (hasActiveClient && !hasSessionToken) {
      const headers = new Headers();
      headers.set(
        'Location',
        buildRedirectToHandshake({
          publishableKey: ruleOptions.publishableKey!,
          devBrowserToken: ruleOptions.devBrowserToken!,
          redirectUrl: ruleOptions.request.url.toString(),
        }),
      );

      // TODO: Add status code for redirection
      return handshake(ruleOptions, AuthErrorReason.ClientUATWithoutSessionToken, '', headers);
    }

    const decodeResult = decodeJwt(sessionToken!);

    if (decodeResult.payload.iat < clientUat) {
      const headers = new Headers();
      headers.set(
        'Location',
        buildRedirectToHandshake({
          publishableKey: ruleOptions.publishableKey!,
          devBrowserToken: ruleOptions.devBrowserToken!,
          redirectUrl: ruleOptions.request.url.toString(),
        }),
      );

      // TODO: Add status code for redirection
      return handshake(ruleOptions, AuthErrorReason.SessionTokenOutdated, '', headers);
    }

    try {
      const verifyResult = await verifyRequestState(ruleOptions, sessionToken!);
      if (verifyResult) {
        return signedIn(ruleOptions, verifyResult);
      }
    } catch (err) {
      if (err instanceof TokenVerificationError) {
        err.tokenCarrier === 'cookie';

        const reasonToHandshake = [
          TokenVerificationErrorReason.TokenExpired,
          TokenVerificationErrorReason.TokenNotActiveYet,
        ].includes(err.reason);

        if (reasonToHandshake) {
          const headers = new Headers();
          headers.set(
            'Location',
            buildRedirectToHandshake({
              publishableKey: ruleOptions.publishableKey!,
              devBrowserToken: ruleOptions.devBrowserToken!,
              redirectUrl: ruleOptions.request.url.toString(),
            }),
          );

          // TODO: Add status code for redirection
          return handshake(ruleOptions, AuthErrorReason.SessionTokenOutdated, '', headers);
        }
        return signedOut(ruleOptions, err.reason, err.getFullMessage());
      }

      return signedOut(ruleOptions, AuthErrorReason.UnexpectedError);
    }

    return signedOut(ruleOptions, AuthErrorReason.UnexpectedError);
  }

  function handleError(err: unknown, tokenCarrier: TokenCarrier) {
    if (err instanceof TokenVerificationError) {
      err.tokenCarrier = tokenCarrier;

      const reasonToReturnInterstitial = [
        TokenVerificationErrorReason.TokenExpired,
        TokenVerificationErrorReason.TokenNotActiveYet,
      ].includes(err.reason);

      if (reasonToReturnInterstitial) {
        if (tokenCarrier === 'header') {
          return unknownState(ruleOptions, err.reason, err.getFullMessage());
        }
        return interstitial(ruleOptions, err.reason, err.getFullMessage());
      }
      return signedOut(ruleOptions, err.reason, err.getFullMessage());
    }
    return signedOut(ruleOptions, AuthErrorReason.UnexpectedError, (err as Error).message);
  }

  if (ruleOptions.sessionTokenInHeader) {
    return authenticateRequestWithTokenInHeader();
  }
  return authenticateRequestWithTokenInCookie();
}

export const debugRequestState = (params: RequestState) => {
  const { isSignedIn, proxyUrl, isInterstitial, reason, message, publishableKey, isSatellite, domain } = params;
  return { isSignedIn, proxyUrl, isInterstitial, reason, message, publishableKey, isSatellite, domain };
};

export type DebugRequestSate = ReturnType<typeof debugRequestState>;

/**
 * Load authenticate request options related to headers.
 */
export const loadOptionsFromHeaders = (headers: ReturnType<typeof buildRequest>['headers']) => {
  if (!headers) {
    return {};
  }

  return {
    sessionTokenInHeader: stripAuthorizationHeader(headers(constants.Headers.Authorization)),
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
    sessionTokenInCookie: cookies?.(constants.Cookies.Session),
    clientUat: cookies?.(constants.Cookies.ClientUat),
  };
};

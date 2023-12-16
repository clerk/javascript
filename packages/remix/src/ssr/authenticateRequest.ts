import { createClerkClient } from '@clerk/backend';
import type { SignedInState, SignedOutState } from '@clerk/backend/internal';
import { AuthStatus, buildRequestUrl } from '@clerk/backend/internal';
import { apiUrlFromPublishableKey } from '@clerk/shared/apiUrlFromPublishableKey';
import { handleValueOrFn } from '@clerk/shared/handleValueOrFn';
import { isDevelopmentFromSecretKey } from '@clerk/shared/keys';
import { isHttpOrHttps, isProxyUrlRelative } from '@clerk/shared/proxy';
import { isTruthy } from '@clerk/shared/underscore';

import { noSecretKeyError, satelliteAndMissingProxyUrlAndDomain, satelliteAndMissingSignInUrl } from '../errors';
import { getEnvVariable } from '../utils';
import type { LoaderFunctionArgs, RootAuthLoaderOptions } from './types';

export async function authenticateRequest(
  args: LoaderFunctionArgs,
  opts: RootAuthLoaderOptions = {},
): Promise<SignedInState | SignedOutState> {
  const { request, context } = args;
  const { audience, authorizedParties } = opts;

  // Fetch environment variables across Remix runtime.
  // 1. First check if the user passed the key in the getAuth function or the rootAuthLoader.
  // 2. Then try from process.env if exists (Node).
  // 3. Then try from globalThis (Cloudflare Workers).
  // 4. Then from loader context (Cloudflare Pages).
  const secretKey = opts.secretKey || getEnvVariable('CLERK_SECRET_KEY', context) || '';

  if (!secretKey) {
    throw new Error(noSecretKeyError);
  }

  const publishableKey = opts.publishableKey || getEnvVariable('CLERK_PUBLISHABLE_KEY', context) || '';

  const jwtKey = opts.jwtKey || getEnvVariable('CLERK_JWT_KEY', context);

  const apiUrl = getEnvVariable('CLERK_API_URL', context) || apiUrlFromPublishableKey(publishableKey);

  const domain = handleValueOrFn(opts.domain, new URL(request.url)) || getEnvVariable('CLERK_DOMAIN', context) || '';

  const isSatellite =
    handleValueOrFn(opts.isSatellite, new URL(request.url)) ||
    isTruthy(getEnvVariable('CLERK_IS_SATELLITE', context)) ||
    false;

  const requestURL = buildRequestUrl(request);

  const relativeOrAbsoluteProxyUrl = handleValueOrFn(
    opts?.proxyUrl,
    requestURL,
    getEnvVariable('CLERK_PROXY_URL', context),
  );

  let proxyUrl;
  if (!!relativeOrAbsoluteProxyUrl && isProxyUrlRelative(relativeOrAbsoluteProxyUrl)) {
    proxyUrl = new URL(relativeOrAbsoluteProxyUrl, requestURL).toString();
  } else {
    proxyUrl = relativeOrAbsoluteProxyUrl;
  }

  const signInUrl = opts.signInUrl || getEnvVariable('CLERK_SIGN_IN_URL', context) || '';

  const signUpUrl = opts.signUpUrl || getEnvVariable('CLERK_SIGN_UP_URL', context) || '';

  const afterSignInUrl = opts.afterSignInUrl || getEnvVariable('CLERK_AFTER_SIGN_IN_URL', context) || '';

  const afterSignUpUrl = opts.afterSignUpUrl || getEnvVariable('CLERK_AFTER_SIGN_UP_URL', context) || '';

  if (isSatellite && !proxyUrl && !domain) {
    throw new Error(satelliteAndMissingProxyUrlAndDomain);
  }

  if (isSatellite && !isHttpOrHttps(signInUrl) && isDevelopmentFromSecretKey(secretKey)) {
    throw new Error(satelliteAndMissingSignInUrl);
  }

  const requestState = await createClerkClient({
    apiUrl,
    secretKey,
    jwtKey,
    proxyUrl,
    isSatellite,
    domain,
  }).authenticateRequest(request, {
    audience,
    secretKey,
    jwtKey,
    publishableKey,
    authorizedParties,
    proxyUrl,
    isSatellite,
    domain,
    signInUrl,
    signUpUrl,
    afterSignInUrl,
    afterSignUpUrl,
  });

  const hasLocationHeader = requestState.headers.get('location');
  if (hasLocationHeader) {
    // triggering a handshake redirect
    throw new Response(null, { status: 307, headers: requestState.headers });
  }

  if (requestState.status === AuthStatus.Handshake) {
    throw new Error('Clerk: unexpected handshake without redirect');
  }

  return requestState;
}

import { createClerkRequest } from '@clerk/backend/internal';
import { apiUrlFromPublishableKey } from '@clerk/shared/apiUrlFromPublishableKey';
import { isDevelopmentFromSecretKey } from '@clerk/shared/keys';
import { isHttpOrHttps, isProxyUrlRelative } from '@clerk/shared/proxy';
import { isTruthy } from '@clerk/shared/underscore';
import { handleValueOrFn } from '@clerk/shared/utils';

import { noSecretKeyError, satelliteAndMissingProxyUrlAndDomain, satelliteAndMissingSignInUrl } from '../utils/errors';
import { getEnvVariable } from '../utils/utils';
import type { LoaderFunctionArgs, RootAuthLoaderOptions } from './types';
import { patchRequest } from './utils';

export const loadOptions = (args: LoaderFunctionArgs, overrides: RootAuthLoaderOptions = {}) => {
  const { request, context } = args;
  const clerkRequest = createClerkRequest(patchRequest(request));

  // Fetch environment variables across Remix runtime.
  // 1. First check if the user passed the key in the getAuth function or the rootAuthLoader.
  // 2. Then try from process.env if exists (Node).
  // 3. Then try from globalThis (Cloudflare Workers).
  // 4. Then from loader context (Cloudflare Pages).
  const secretKey = overrides.secretKey || getEnvVariable('CLERK_SECRET_KEY', context) || '';
  const machineSecretKey = overrides.machineSecretKey || getEnvVariable('CLERK_MACHINE_SECRET_KEY', context);
  const publishableKey = overrides.publishableKey || getEnvVariable('CLERK_PUBLISHABLE_KEY', context) || '';
  const jwtKey = overrides.jwtKey || getEnvVariable('CLERK_JWT_KEY', context);
  const apiUrl = getEnvVariable('CLERK_API_URL', context) || apiUrlFromPublishableKey(publishableKey);
  const domain =
    handleValueOrFn(overrides.domain, new URL(request.url)) || getEnvVariable('CLERK_DOMAIN', context) || '';
  const isSatellite =
    handleValueOrFn(overrides.isSatellite, new URL(request.url)) ||
    isTruthy(getEnvVariable('CLERK_IS_SATELLITE', context));
  const relativeOrAbsoluteProxyUrl = handleValueOrFn(
    overrides?.proxyUrl,
    clerkRequest.clerkUrl,
    getEnvVariable('CLERK_PROXY_URL', context),
  );
  const signInUrl = overrides.signInUrl || getEnvVariable('CLERK_SIGN_IN_URL', context) || '';
  const signUpUrl = overrides.signUpUrl || getEnvVariable('CLERK_SIGN_UP_URL', context) || '';
  const signInForceRedirectUrl =
    overrides.signInForceRedirectUrl || getEnvVariable('CLERK_SIGN_IN_FORCE_REDIRECT_URL', context) || '';
  const signUpForceRedirectUrl =
    overrides.signUpForceRedirectUrl || getEnvVariable('CLERK_SIGN_UP_FORCE_REDIRECT_URL', context) || '';
  const signInFallbackRedirectUrl =
    overrides.signInFallbackRedirectUrl || getEnvVariable('CLERK_SIGN_IN_FALLBACK_REDIRECT_URL', context) || '';
  const signUpFallbackRedirectUrl =
    overrides.signUpFallbackRedirectUrl || getEnvVariable('CLERK_SIGN_UP_FALLBACK_REDIRECT_URL', context) || '';
  const afterSignInUrl = overrides.afterSignInUrl || getEnvVariable('CLERK_AFTER_SIGN_IN_URL', context) || '';
  const afterSignUpUrl = overrides.afterSignUpUrl || getEnvVariable('CLERK_AFTER_SIGN_UP_URL', context) || '';
  const newSubscriptionRedirectUrl =
    overrides.newSubscriptionRedirectUrl || getEnvVariable('CLERK_CHECKOUT_CONTINUE_URL', context) || '';

  let proxyUrl;
  if (!!relativeOrAbsoluteProxyUrl && isProxyUrlRelative(relativeOrAbsoluteProxyUrl)) {
    proxyUrl = new URL(relativeOrAbsoluteProxyUrl, clerkRequest.clerkUrl).toString();
  } else {
    proxyUrl = relativeOrAbsoluteProxyUrl;
  }

  if (!secretKey) {
    throw new Error(noSecretKeyError);
  }
  if (isSatellite && !proxyUrl && !domain) {
    throw new Error(satelliteAndMissingProxyUrlAndDomain);
  }
  if (isSatellite && !isHttpOrHttps(signInUrl) && isDevelopmentFromSecretKey(secretKey)) {
    throw new Error(satelliteAndMissingSignInUrl);
  }

  return {
    // used to append options that are not initialized from env
    ...overrides,
    secretKey,
    machineSecretKey,
    publishableKey,
    jwtKey,
    apiUrl,
    domain,
    isSatellite,
    proxyUrl,
    signInUrl,
    signUpUrl,
    afterSignInUrl,
    afterSignUpUrl,
    signInForceRedirectUrl,
    signUpForceRedirectUrl,
    signInFallbackRedirectUrl,
    signUpFallbackRedirectUrl,
    newSubscriptionRedirectUrl,
  };
};

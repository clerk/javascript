import { createClerkRequest } from '@clerk/backend/internal';
import { apiUrlFromPublishableKey } from '@clerk/shared/apiUrlFromPublishableKey';
import { isDevelopmentFromSecretKey } from '@clerk/shared/keys';
import { isHttpOrHttps, isProxyUrlRelative } from '@clerk/shared/proxy';
import { handleValueOrFn } from '@clerk/shared/utils';

import { getEnvVariable, getPublicEnvVariables } from '../utils/env';
import { noSecretKeyError, satelliteAndMissingProxyUrlAndDomain, satelliteAndMissingSignInUrl } from '../utils/errors';
import type { LoaderFunctionArgs, RootAuthLoaderOptions } from './types';
import { patchRequest } from './utils';

export const loadOptions = (args: LoaderFunctionArgs, overrides: RootAuthLoaderOptions = {}) => {
  const { request, context } = args;
  const clerkRequest = createClerkRequest(patchRequest(request));

  // Fetch environment variables across React Router runtime.
  // 1. First check if the user passed the key in the getAuth() function or the rootAuthLoader().
  // 2. Then try from process.env if exists (Node).
  // 3. Then try from import.meta.env if exists (Vite).
  // 4. Then try from globalThis (Cloudflare Workers).
  // 5. Then from loader context (Cloudflare Pages).
  const secretKey = overrides.secretKey || getEnvVariable('CLERK_SECRET_KEY', context);
  const publishableKey = overrides.publishableKey || getPublicEnvVariables(context).publishableKey;
  const jwtKey = overrides.jwtKey || getEnvVariable('CLERK_JWT_KEY', context);
  const apiUrl = getEnvVariable('CLERK_API_URL', context) || apiUrlFromPublishableKey(publishableKey);
  const domain = handleValueOrFn(overrides.domain, new URL(request.url)) || getPublicEnvVariables(context).domain;
  const isSatellite =
    handleValueOrFn(overrides.isSatellite, new URL(request.url)) || getPublicEnvVariables(context).isSatellite;
  const relativeOrAbsoluteProxyUrl = handleValueOrFn(
    overrides?.proxyUrl,
    clerkRequest.clerkUrl,
    getPublicEnvVariables(context).proxyUrl,
  );
  const signInUrl = overrides.signInUrl || getPublicEnvVariables(context).signInUrl;
  const signUpUrl = overrides.signUpUrl || getPublicEnvVariables(context).signUpUrl;
  const signInForceRedirectUrl =
    overrides.signInForceRedirectUrl || getPublicEnvVariables(context).signInForceRedirectUrl;
  const signUpForceRedirectUrl =
    overrides.signUpForceRedirectUrl || getPublicEnvVariables(context).signUpForceRedirectUrl;
  const signInFallbackRedirectUrl =
    overrides.signInFallbackRedirectUrl || getPublicEnvVariables(context).signInFallbackRedirectUrl;
  const signUpFallbackRedirectUrl =
    overrides.signUpFallbackRedirectUrl || getPublicEnvVariables(context).signUpFallbackRedirectUrl;
  const afterSignInUrl = overrides.afterSignInUrl || getPublicEnvVariables(context).afterSignInUrl;
  const afterSignUpUrl = overrides.afterSignUpUrl || getPublicEnvVariables(context).afterSignUpUrl;

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
  };
};

import { createClerkRequest } from '@clerk/backend/internal';
import { apiUrlFromPublishableKey } from '@clerk/shared/apiUrlFromPublishableKey';
import { isDevelopmentFromSecretKey } from '@clerk/shared/keys';
import { isHttpOrHttps, isProxyUrlRelative } from '@clerk/shared/proxy';
import { handleValueOrFn } from '@clerk/shared/utils';

import { errorThrower } from '../utils';
import { getEnvVariable, getPublicEnvVariables } from '../utils/env';
import {
  CLERK_JWT_KEY,
  DOMAIN,
  IS_SATELLITE,
  PROXY_URL,
  PUBLISHABLE_KEY,
  SECRET_KEY,
  SIGN_IN_URL,
  SIGN_UP_URL,
} from './constants';
import type { LoaderOptions } from './types';
import { patchRequest } from './utils';

export const loadOptions = (request: Request, overrides: LoaderOptions = {}) => {
  const clerkRequest = createClerkRequest(patchRequest(request));

  const secretKey = overrides.secretKey || SECRET_KEY;
  const publishableKey = overrides.publishableKey || PUBLISHABLE_KEY;
  const jwtKey = overrides.jwtKey || CLERK_JWT_KEY;
  const apiUrl = getEnvVariable('CLERK_API_URL') || apiUrlFromPublishableKey(publishableKey);
  const domain = handleValueOrFn(overrides.domain, new URL(request.url)) || DOMAIN;
  const isSatellite = handleValueOrFn(overrides.isSatellite, new URL(request.url)) || IS_SATELLITE;
  const relativeOrAbsoluteProxyUrl = handleValueOrFn(overrides?.proxyUrl, clerkRequest.clerkUrl, PROXY_URL);
  const signInUrl = overrides.signInUrl || SIGN_IN_URL;
  const signUpUrl = overrides.signUpUrl || SIGN_UP_URL;
  const afterSignInUrl = overrides.afterSignInUrl || getPublicEnvVariables().afterSignInUrl;
  const afterSignUpUrl = overrides.afterSignUpUrl || getPublicEnvVariables().afterSignUpUrl;

  let proxyUrl;
  if (!!relativeOrAbsoluteProxyUrl && isProxyUrlRelative(relativeOrAbsoluteProxyUrl)) {
    proxyUrl = new URL(relativeOrAbsoluteProxyUrl, clerkRequest.clerkUrl).toString();
  } else {
    proxyUrl = relativeOrAbsoluteProxyUrl;
  }

  if (!secretKey) {
    throw errorThrower.throw('Clerk: no secret key provided');
  }

  if (isSatellite && !proxyUrl && !domain) {
    throw errorThrower.throw('Clerk: satellite mode requires a proxy URL or domain');
  }

  if (isSatellite && !isHttpOrHttps(signInUrl) && isDevelopmentFromSecretKey(secretKey)) {
    throw errorThrower.throw('Clerk: satellite mode requires a sign-in URL in production');
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
  };
};

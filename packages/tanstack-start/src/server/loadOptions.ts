import { createClerkRequest } from '@clerk/backend/internal';
import { apiUrlFromPublishableKey } from '@clerk/shared/apiUrlFromPublishableKey';
import { handleValueOrFn } from '@clerk/shared/handleValueOrFn';
import { isDevelopmentFromSecretKey } from '@clerk/shared/keys';
import { isHttpOrHttps, isProxyUrlRelative } from '@clerk/shared/proxy';
import { isTruthy } from '@clerk/shared/underscore';

import { errorThrower } from '../utils';
import { getEnvVariable, getPublicEnvVariables } from '../utils/env';
import type { LoaderOptions } from './types';

export const loadOptions = (request: Request, overrides: LoaderOptions = {}) => {
  const clerkRequest = createClerkRequest(request);

  const secretKey = overrides.secretKey || overrides.secretKey || getEnvVariable('CLERK_SECRET_KEY');
  const publishableKey = overrides.publishableKey || getPublicEnvVariables().publishableKey;
  const jwtKey = overrides.jwtKey || getEnvVariable('CLERK_JWT_KEY');
  const apiUrl = getEnvVariable('CLERK_API_URL') || apiUrlFromPublishableKey(publishableKey);
  const domain = handleValueOrFn(overrides.domain, new URL(request.url)) || getPublicEnvVariables().domain;
  const isSatellite =
    handleValueOrFn(overrides.isSatellite, new URL(request.url)) || isTruthy(getPublicEnvVariables().isSatellite);
  const relativeOrAbsoluteProxyUrl = handleValueOrFn(
    overrides?.proxyUrl,
    clerkRequest.clerkUrl,
    getPublicEnvVariables().proxyUrl,
  );
  const signInUrl = overrides.signInUrl || getPublicEnvVariables().signInUrl;
  const signUpUrl = overrides.signUpUrl || getPublicEnvVariables().signUpUrl;
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

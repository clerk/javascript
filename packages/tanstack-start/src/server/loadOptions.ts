import { createClerkRequest } from '@clerk/backend/internal';
import { apiUrlFromPublishableKey } from '@clerk/shared/apiUrlFromPublishableKey';
import { handleValueOrFn } from '@clerk/shared/handleValueOrFn';
import { isDevelopmentFromSecretKey } from '@clerk/shared/keys';
import { isHttpOrHttps, isProxyUrlRelative } from '@clerk/shared/proxy';
import { isTruthy } from '@clerk/shared/underscore';

import { errorThrower } from '../utils';
import type { LoaderOptions } from './types';
import { getEnvVariable } from './utils';

export const loadOptions = (request: Request, overrides: LoaderOptions = {}) => {
  const clerkRequest = createClerkRequest(request);

  const secretKey = overrides.secretKey || overrides.secretKey || getEnvVariable('CLERK_SECRET_KEY');
  const publishableKey = overrides.publishableKey || getEnvVariable('CLERK_PUBLISHABLE_KEY');
  const jwtKey = overrides.jwtKey || getEnvVariable('CLERK_JWT_KEY');
  const apiUrl = getEnvVariable('CLERK_API_URL') || apiUrlFromPublishableKey(publishableKey);
  const domain = handleValueOrFn(overrides.domain, new URL(request.url)) || getEnvVariable('CLERK_DOMAIN') || '';
  const isSatellite =
    handleValueOrFn(overrides.isSatellite, new URL(request.url)) || isTruthy(getEnvVariable('CLERK_IS_SATELLITE'));
  const relativeOrAbsoluteProxyUrl = handleValueOrFn(
    overrides?.proxyUrl,
    clerkRequest.clerkUrl,
    getEnvVariable('CLERK_PROXY_URL'),
  );
  const signInUrl = overrides.signInUrl || getEnvVariable('CLERK_SIGN_IN_URL');
  const signUpUrl = overrides.signUpUrl || getEnvVariable('CLERK_SIGN_UP_URL');
  const afterSignInUrl = overrides.afterSignInUrl || getEnvVariable('CLERK_AFTER_SIGN_IN_URL') || '';
  const afterSignUpUrl = overrides.afterSignUpUrl || getEnvVariable('CLERK_AFTER_SIGN_UP_URL') || '';

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

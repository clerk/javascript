import { createClerkRequest } from '@clerk/backend/internal';
import { apiUrlFromPublishableKey } from '@clerk/shared/apiUrlFromPublishableKey';
import { getEnvVariable } from '@clerk/shared/getEnvVariable';
import { isDevelopmentFromSecretKey } from '@clerk/shared/keys';
import { isHttpOrHttps, isProxyUrlRelative } from '@clerk/shared/proxy';
import { handleValueOrFn } from '@clerk/shared/utils';

import { errorThrower } from '../utils';
import { getPublicEnvVariables } from '../utils/env';
import { commonEnvs } from './constants';
import type { LoaderOptions } from './types';
import { patchRequest } from './utils';

export const loadOptions = (request: Request, overrides: LoaderOptions = {}) => {
  const clerkRequest = createClerkRequest(patchRequest(request));
  const commonEnv = commonEnvs();
  const secretKey = overrides.secretKey || commonEnv.SECRET_KEY;
  const machineSecretKey = overrides.machineSecretKey || commonEnv.MACHINE_SECRET_KEY;
  const publishableKey = overrides.publishableKey || commonEnv.PUBLISHABLE_KEY;
  const jwtKey = overrides.jwtKey || commonEnv.CLERK_JWT_KEY;
  const apiUrl = getEnvVariable('CLERK_API_URL') || apiUrlFromPublishableKey(publishableKey);
  const domain = handleValueOrFn(overrides.domain, new URL(request.url)) || commonEnv.DOMAIN;
  const isSatellite = handleValueOrFn(overrides.isSatellite, new URL(request.url)) || commonEnv.IS_SATELLITE;
  const relativeOrAbsoluteProxyUrl = handleValueOrFn(overrides?.proxyUrl, clerkRequest.clerkUrl, commonEnv.PROXY_URL);
  const signInUrl = overrides.signInUrl || commonEnv.SIGN_IN_URL;
  const signUpUrl = overrides.signUpUrl || commonEnv.SIGN_UP_URL;
  const afterSignInUrl = overrides.afterSignInUrl || getPublicEnvVariables().afterSignInUrl;
  const afterSignUpUrl = overrides.afterSignUpUrl || getPublicEnvVariables().afterSignUpUrl;

  let proxyUrl;
  if (!!relativeOrAbsoluteProxyUrl && isProxyUrlRelative(relativeOrAbsoluteProxyUrl)) {
    proxyUrl = new URL(relativeOrAbsoluteProxyUrl, clerkRequest.clerkUrl).toString();
  } else {
    proxyUrl = relativeOrAbsoluteProxyUrl;
  }

  if (!secretKey) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw errorThrower.throw('Clerk: no secret key provided');
  }

  if (isSatellite && !proxyUrl && !domain) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw errorThrower.throw('Clerk: satellite mode requires a proxy URL or domain');
  }

  if (isSatellite && !isHttpOrHttps(signInUrl) && isDevelopmentFromSecretKey(secretKey)) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw errorThrower.throw('Clerk: satellite mode requires a sign-in URL in production');
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
  };
};

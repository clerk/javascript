import type { ClerkRequest } from '@clerk/backend/internal';
import { apiUrlFromPublishableKey } from '@clerk/shared/apiUrlFromPublishableKey';
import { getEnvVariable } from '@clerk/shared/getEnvVariable';
import { isDevelopmentFromSecretKey } from '@clerk/shared/keys';
import { isHttpOrHttps, isProxyUrlRelative } from '@clerk/shared/proxy';

import { errorThrower } from '../utils';
import { canUseKeyless } from '../utils/feature-flags';
import { commonEnvs } from './constants';
import type { LoaderOptions } from './types';

export const loadOptions = (request: ClerkRequest, overrides: LoaderOptions = {}) => {
  const commonEnv = commonEnvs();
  const secretKey = overrides.secretKey || commonEnv.SECRET_KEY;
  const machineSecretKey = overrides.machineSecretKey || commonEnv.MACHINE_SECRET_KEY;
  const publishableKey = overrides.publishableKey || commonEnv.PUBLISHABLE_KEY;
  const jwtKey = overrides.jwtKey || commonEnv.CLERK_JWT_KEY;
  const apiUrl = getEnvVariable('CLERK_API_URL') || apiUrlFromPublishableKey(publishableKey);
  const domain = overrides.domain || commonEnv.DOMAIN;
  const isSatellite = overrides.isSatellite || commonEnv.IS_SATELLITE;
  const relativeOrAbsoluteProxyUrl = overrides.proxyUrl || commonEnv.PROXY_URL;
  const signInUrl = overrides.signInUrl || commonEnv.SIGN_IN_URL;
  const signUpUrl = overrides.signUpUrl || commonEnv.SIGN_UP_URL;
  const satelliteAutoSync = overrides.satelliteAutoSync;

  let proxyUrl;
  if (!!relativeOrAbsoluteProxyUrl && isProxyUrlRelative(relativeOrAbsoluteProxyUrl)) {
    proxyUrl = new URL(relativeOrAbsoluteProxyUrl, request.clerkUrl).toString();
  } else {
    proxyUrl = relativeOrAbsoluteProxyUrl;
  }

  // In keyless mode, don't throw if secretKey is missing - ClerkProvider will handle it
  if (!secretKey && !canUseKeyless) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw errorThrower.throw('Clerk: no secret key provided');
  }

  if (isSatellite && !proxyUrl && !domain) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw errorThrower.throw('Clerk: satellite mode requires a proxy URL or domain');
  }

  if (isSatellite && secretKey && !isHttpOrHttps(signInUrl) && isDevelopmentFromSecretKey(secretKey)) {
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
    satelliteAutoSync,
  };
};

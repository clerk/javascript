import { createClerkRequest } from '@clerk/backend/internal';
import { apiUrlFromPublishableKey } from '@clerk/shared/apiUrlFromPublishableKey';
import { isDevelopmentFromSecretKey } from '@clerk/shared/keys';
import { isHttpOrHttps, isProxyUrlRelative } from '@clerk/shared/proxy';
import { isTruthy } from '@clerk/shared/underscore';

// import { noSecretKeyError, satelliteAndMissingProxyUrlAndDomain, satelliteAndMissingSignInUrl } from '../utils/errors';
import { getEnvVariable } from './utils/utils.js';

export const loadOptions = (request: Request) => {
  const clerkRequest = createClerkRequest(request);

  const secretKey = getEnvVariable('CLERK_SECRET_KEY');
  const publishableKey = getEnvVariable('CLERK_PUBLISHABLE_KEY');
  const jwtKey = getEnvVariable('CLERK_JWT_KEY');
  const apiUrl = getEnvVariable('CLERK_API_URL') || apiUrlFromPublishableKey(publishableKey);
  const domain = getEnvVariable('CLERK_DOMAIN') || '';
  const isSatellite = isTruthy(getEnvVariable('CLERK_IS_SATELLITE'));
  const relativeOrAbsoluteProxyUrl = getEnvVariable('CLERK_PROXY_URL');
  const signInUrl = getEnvVariable('CLERK_SIGN_IN_URL');
  const signUpUrl = getEnvVariable('CLERK_SIGN_UP_URL');
  const afterSignInUrl = getEnvVariable('CLERK_AFTER_SIGN_IN_URL') || '';
  const afterSignUpUrl = getEnvVariable('CLERK_AFTER_SIGN_UP_URL') || '';

  let proxyUrl;
  if (!!relativeOrAbsoluteProxyUrl && isProxyUrlRelative(relativeOrAbsoluteProxyUrl)) {
    proxyUrl = new URL(relativeOrAbsoluteProxyUrl, clerkRequest.clerkUrl).toString();
  } else {
    proxyUrl = relativeOrAbsoluteProxyUrl;
  }

  if (!secretKey) {
    throw new Error('Clerk: no secret key provided');
  }
  if (isSatellite && !proxyUrl && !domain) {
    throw new Error('Clerk: satellite mode requires a proxy URL or domain');
  }
  if (isSatellite && !isHttpOrHttps(signInUrl) && isDevelopmentFromSecretKey(secretKey)) {
    throw new Error('Clerk: satellite mode requires a sign-in URL in production');
  }

  return {
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

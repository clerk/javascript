import { errorThrower, parsePublishableKey } from './util/shared';

const buildUrl = (_baseUrl: string | URL, _targetUrl: string | URL, _returnBackUrl?: string | URL) => {
  if (_baseUrl === '') {
    return legacyBuildUrl(_targetUrl.toString(), _returnBackUrl?.toString());
  }

  const baseUrl = new URL(_baseUrl);
  const returnBackUrl = _returnBackUrl ? new URL(_returnBackUrl, baseUrl) : undefined;
  const res = new URL(_targetUrl, baseUrl);

  if (returnBackUrl) {
    res.searchParams.set('redirect_url', returnBackUrl.toString());
  }
  return res.toString();
};

/**
 * In v5, we deprecated the top-level redirectToSignIn and redirectToSignUp functions
 * in favor of the new auth().redirectToSignIn helpers
 * In order to allow for a smooth transition, we need to support the legacy redirectToSignIn for now
 * as we will remove it in v6.
 * In order to make sure that the legacy function works as expected, we will use legacyBuildUrl
 * to build the url if baseUrl is not provided (which is the case for legacy redirectToSignIn)
 * This function can be safely removed when we remove the legacy redirectToSignIn function
 */
const legacyBuildUrl = (targetUrl: string, redirectUrl?: string) => {
  let url;
  if (!targetUrl.startsWith('http')) {
    if (!redirectUrl || !redirectUrl.startsWith('http')) {
      throw new Error('destination url or return back url should be an absolute path url!');
    }

    const baseURL = new URL(redirectUrl);
    url = new URL(targetUrl, baseURL.origin);
  } else {
    url = new URL(targetUrl);
  }

  if (redirectUrl) {
    url.searchParams.set('redirect_url', redirectUrl);
  }

  return url.toString();
};

const buildAccountsBaseUrl = (frontendApi?: string) => {
  if (!frontendApi) {
    return '';
  }

  // convert url from FAPI to accounts for Kima and legacy (prod & dev) instances
  const accountsBaseUrl = frontendApi
    // staging accounts
    .replace(/(clerk\.accountsstage\.)/, 'accountsstage.')
    .replace(/(clerk\.accounts\.|clerk\.)/, 'accounts.');
  return `https://${accountsBaseUrl}`;
};

type RedirectAdapter<RedirectReturn> = (url: string) => RedirectReturn;
type RedirectToParams = { returnBackUrl?: string | URL };
export type RedirectFun<ReturnType> = (params?: RedirectToParams) => ReturnType;

/**
 * @internal
 */
type CreateRedirect = <ReturnType>(params: {
  publishableKey: string;
  redirectAdapter: RedirectAdapter<ReturnType>;
  baseUrl: URL | string;
  signInUrl?: URL | string;
  signUpUrl?: URL | string;
}) => {
  redirectToSignIn: RedirectFun<ReturnType>;
  redirectToSignUp: RedirectFun<ReturnType>;
};

export const createRedirect: CreateRedirect = params => {
  const { publishableKey, redirectAdapter, signInUrl, signUpUrl, baseUrl } = params;
  const frontendApi = parsePublishableKey(publishableKey)?.frontendApi;
  const accountsBaseUrl = buildAccountsBaseUrl(frontendApi);

  const redirectToSignUp = ({ returnBackUrl }: RedirectToParams = {}) => {
    if (!signUpUrl && !accountsBaseUrl) {
      errorThrower.throwMissingPublishableKeyError();
    }
    const accountsSignUpUrl = `${accountsBaseUrl}/sign-up`;
    return redirectAdapter(buildUrl(baseUrl, signUpUrl || accountsSignUpUrl, returnBackUrl));
  };

  const redirectToSignIn = ({ returnBackUrl }: RedirectToParams = {}) => {
    if (!signInUrl && !accountsBaseUrl) {
      errorThrower.throwMissingPublishableKeyError();
    }
    const accountsSignInUrl = `${accountsBaseUrl}/sign-in`;
    return redirectAdapter(buildUrl(baseUrl, signInUrl || accountsSignInUrl, returnBackUrl));
  };

  return { redirectToSignUp, redirectToSignIn };
};

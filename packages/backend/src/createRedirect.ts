import { errorThrower, parsePublishableKey } from './util/shared';

const buildUrl = (_baseUrl: string | URL, _targetUrl: string | URL, _returnBackUrl?: string | URL) => {
  const baseUrl = new URL(_baseUrl);
  const returnBackUrl = _returnBackUrl ? new URL(_returnBackUrl, baseUrl) : undefined;
  const res = new URL(_targetUrl, baseUrl);
  if (returnBackUrl) {
    res.searchParams.set('redirect_url', returnBackUrl.toString());
  }
  return res.toString();
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

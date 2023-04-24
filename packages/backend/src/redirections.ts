import { parsePublishableKey } from './util/parsePublishableKey';

type RedirectAdapter = (url: string) => any;

type SingUpParams = { url?: string; returnBackUrl?: string };
type SingInParams = { url?: string; returnBackUrl?: string };

const buildUrl = (targetUrl: string, redirectUrl?: string) => {
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

type RedirectParams = {
  redirectAdapter: RedirectAdapter;
  signInUrl?: string;
  signUpUrl?: string;
  publishableKey?: string;
  /**
   * @deprecated Use `publishableKey` instead.
   */
  frontendApi?: string;
};

export function redirect({ redirectAdapter, signUpUrl, signInUrl, frontendApi, publishableKey }: RedirectParams) {
  if (!frontendApi) {
    frontendApi = parsePublishableKey(publishableKey)?.frontendApi;
  }

  const accountsBaseUrl = buildAccountsBaseUrl(frontendApi);

  const redirectToSignUp = ({ returnBackUrl }: SingUpParams = {}) => {
    if (!signUpUrl && !accountsBaseUrl) {
      throw new Error('signUpUrl or frontendApi/publishableKey should be provided!');
    }

    const accountsSignUpUrl = `${accountsBaseUrl}/sign-up`;
    return redirectAdapter(buildUrl(signUpUrl || accountsSignUpUrl, returnBackUrl));
  };

  const redirectToSignIn = ({ returnBackUrl }: SingInParams = {}) => {
    if (!signInUrl && !accountsBaseUrl) {
      throw new Error('signInUrl or frontendApi/publishableKey should be provided!');
    }

    const accountsSignInUrl = `${accountsBaseUrl}/sign-in`;
    return redirectAdapter(buildUrl(signInUrl || accountsSignInUrl, returnBackUrl));
  };

  return { redirectToSignUp, redirectToSignIn };
}

function buildAccountsBaseUrl(frontendApi?: string) {
  if (!frontendApi) {
    return '';
  }

  // convert url from FAPI to accounts for Kima and legacy (prod & dev) instances
  const accountsBaseUrl = frontendApi.replace(/(clerk\.accounts\.|clerk\.)/, 'accounts.');
  return `https://${accountsBaseUrl}`;
}

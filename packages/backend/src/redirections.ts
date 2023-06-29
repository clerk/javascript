import { parsePublishableKey } from './util/parsePublishableKey';

type RedirectAdapter = (url: string) => any;

type SignUpParams = { returnBackUrl?: string };
type SignInParams = { returnBackUrl?: string };

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

// TODO: replace it with @clerk/shared errorThrower.throwMissingPublishableKeyError()
const missingPublishableKeyErrorMessage = `Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.`;

export function redirect({ redirectAdapter, signUpUrl, signInUrl, frontendApi, publishableKey }: RedirectParams) {
  if (!frontendApi) {
    frontendApi = parsePublishableKey(publishableKey)?.frontendApi;
  }

  const accountsBaseUrl = buildAccountsBaseUrl(frontendApi);

  const redirectToSignUp = ({ returnBackUrl }: SignUpParams = {}) => {
    if (!signUpUrl && !accountsBaseUrl) {
      throw new Error(missingPublishableKeyErrorMessage);
    }

    const accountsSignUpUrl = `${accountsBaseUrl}/sign-up`;
    return redirectAdapter(buildUrl(signUpUrl || accountsSignUpUrl, returnBackUrl));
  };

  const redirectToSignIn = ({ returnBackUrl }: SignInParams = {}) => {
    if (!signInUrl && !accountsBaseUrl) {
      throw new Error(missingPublishableKeyErrorMessage);
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
  const accountsBaseUrl = frontendApi
    // staging accounts
    .replace(/(clerk\.accountsstage\.)/, 'accountsstage.')
    .replace(/(clerk\.accounts\.|clerk\.)/, 'accounts.');
  return `https://${accountsBaseUrl}`;
}

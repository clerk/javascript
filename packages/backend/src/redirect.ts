type RedirectAdapter = (url: string, response?: any) => any;

type SingUpParams = { signUpUrl: string; url: string; response?: any };
type SingInParams = { signInUrl: string; url: string; response?: any };

const buildPath = (destinationUrl: string, currentUrl: string) => {
  const currentURL = new URL(currentUrl);

  let destinationURL;
  if (!destinationUrl.startsWith('http')) {
    destinationURL = new URL(destinationUrl, currentURL.origin);
  } else {
    destinationURL = new URL(destinationUrl);
  }

  const qs = new URLSearchParams(`redirect_url=${currentUrl}`).toString();
  destinationURL.hash = `#/?${qs}`;

  return destinationURL.toString();
};

export function redirect(redirectAdapter: RedirectAdapter) {
  const redirectToSignUp = ({ signUpUrl, url, response }: SingUpParams) => {
    return redirectAdapter(buildPath(signUpUrl, url), response);
  };

  const redirectToSignIn = ({ signInUrl, url, response }: SingInParams) => {
    return redirectAdapter(buildPath(signInUrl, url), response);
  };

  return { redirectToSignUp, redirectToSignIn };
}

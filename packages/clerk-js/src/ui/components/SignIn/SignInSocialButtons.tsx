import React from 'react';

import { useCaptchaToken } from '../../../ui/hooks';
import { buildSSOCallbackURL } from '../../common/redirects';
import { useCoreClerk, useCoreSignIn, useSignInContext } from '../../contexts';
import { useEnvironment } from '../../contexts/EnvironmentContext';
import { useCardState } from '../../elements/contexts';
import type { SocialButtonsProps } from '../../elements/SocialButtons';
import { SocialButtons } from '../../elements/SocialButtons';
import { useRouter } from '../../router';
import { handleError } from '../../utils';

// a query param is appended in ./sso-callback route to later be retrived in handleRedirectCallback
type CaptchaParams = {
  key: string;
  value: string;
};
const withQueryParamIfCaptchaIsEnabled = (url: string, isCaptchaEnabled: boolean, params: CaptchaParams) => {
  if (!isCaptchaEnabled) {
    return url;
  }

  const urlWithParams = new URL(url);
  const searchParams = urlWithParams.searchParams;

  searchParams.set(params.key, params.value);

  urlWithParams.search = searchParams.toString();

  return urlWithParams.toString();
};

export const SignInSocialButtons = React.memo((props: SocialButtonsProps) => {
  const clerk = useCoreClerk();
  const { navigate } = useRouter();
  const card = useCardState();
  const { displayConfig } = useEnvironment();
  const ctx = useSignInContext();
  const signIn = useCoreSignIn();
  const redirectUrl = buildSSOCallbackURL(ctx, displayConfig.signInUrl);
  const redirectUrlComplete = ctx.afterSignInUrl || displayConfig.afterSignInUrl;
  const { isCaptchaEnabled } = useCaptchaToken();

  return (
    <SocialButtons
      {...props}
      oauthCallback={(strategy, captchaToken = '') => {
        return signIn
          .authenticateWithRedirect({
            strategy,
            redirectUrl: withQueryParamIfCaptchaIsEnabled(redirectUrl, isCaptchaEnabled, {
              key: '__clerk_captcha_token',
              value: captchaToken,
            }),
            redirectUrlComplete,
          })
          .catch(err => handleError(err, [], card.setError));
      }}
      web3Callback={() => {
        return clerk
          .authenticateWithMetamask({
            customNavigate: navigate,
            redirectUrl: redirectUrlComplete,
            signUpContinueUrl: ctx.signUpContinueUrl,
          })
          .catch(err => handleError(err, [], card.setError));
      }}
    />
  );
});

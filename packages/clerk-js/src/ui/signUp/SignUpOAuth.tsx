import React from 'react';
import { useCoreSignUp, useEnvironment, useSignUpContext } from 'ui/contexts';
import {
  handleError,
  buildSSOCallbackURL,
  ButtonSet,
  ButtonSetOptions,
  getOAuthProviderData,
} from 'ui/common';
import type { OAuthStrategy, OAuthProvider } from '@clerk/types';

export type OauthProps = {
  oauthOptions: string[];
  setError: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export function SignUpOAuth({
  oauthOptions,
  setError,
}: OauthProps): JSX.Element | null {
  const ctx = useSignUpContext();
  const environment = useEnvironment();

  const signUp = useCoreSignUp();
  const { displayConfig } = environment;

  const startOauth = async (e: React.MouseEvent, provider: string) => {
    e.preventDefault();

    try {
      await signUp.authenticateWithRedirect({
        strategy: provider as OAuthStrategy,
        redirectUrl: buildSSOCallbackURL(ctx, displayConfig.signUpUrl),
        redirectUrlComplete: ctx.afterSignUpUrl || displayConfig.afterSignUpUrl,
      });
    } catch (err) {
      handleError(err, [], setError);
    }
  };

  const options = oauthOptions.reduce<ButtonSetOptions[]>((memo, o) => {
    const key = o.replace('oauth_', '') as OAuthProvider;
    const data = getOAuthProviderData(key);

    if (data) {
      memo.push({
        ...data,
        strategy: o,
      });
    }

    return memo;
  }, []);

  return (
    <ButtonSet
      buttonClassName='cl-oauth-button'
      className='cl-oauth-button-group'
      flow='sign-up'
      handleClick={startOauth}
      options={options}
    />
  );
}

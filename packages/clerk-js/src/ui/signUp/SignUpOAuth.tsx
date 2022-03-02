import type { OAuthProvider, OAuthStrategy } from '@clerk/types';
import { getOAuthProviderData } from '@clerk/types';
import React from 'react';
import {
  buildSSOCallbackURL,
  ButtonSet,
  ButtonSetOptions,
  handleError,
} from 'ui/common';
import { useCoreSignUp, useEnvironment, useSignUpContext } from 'ui/contexts';

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
    const data = getOAuthProviderData({ strategy: o as OAuthStrategy });

    if (data) {
      memo.push({
        id: data.provider,
        name: data.name,
        strategy: data.strategy,
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

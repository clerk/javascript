import React from 'react';
import { useCoreSignIn, useEnvironment, useSignInContext } from 'ui/contexts';
import {
  buildSSOCallbackURL,
  ButtonSet,
  ButtonSetOptions,
  getOAuthProviderData,
  handleError,
} from 'ui/common';
import type { OAuthProvider, OAuthStrategy } from '@clerk/types';

export type OauthProps = {
  oauthOptions: OAuthStrategy[];
  error?: string;
  setError?: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export function OAuth({
  oauthOptions,
  setError,
  error,
}: OauthProps): JSX.Element | null {
  const ctx = useSignInContext();
  const signIn = useCoreSignIn();
  const environment = useEnvironment();

  const { displayConfig } = environment;

  const startOauth = async (e: React.MouseEvent, strategy: OAuthStrategy) => {
    e.preventDefault();

    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: buildSSOCallbackURL(ctx, displayConfig.signInUrl),
        redirectUrlComplete: ctx.afterSignInUrl || displayConfig.afterSignInUrl,
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
      error={error}
      flow='sign-in'
      handleClick={startOauth}
      options={options}
    />
  );
}

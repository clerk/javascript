import type { OAuthStrategy } from '@clerk/types';
import { getOAuthProviderData } from '@clerk/types';
import React from 'react';
import { buildSSOCallbackURL, ButtonSet, ButtonSetOptions, handleError } from 'ui/common';
import { useCoreSignIn, useEnvironment, useSignInContext } from 'ui/contexts';

export type OauthProps = {
  oauthOptions: OAuthStrategy[];
  error?: string;
  setError?: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export function OAuth({ oauthOptions, setError, error }: OauthProps): JSX.Element | null {
  const ctx = useSignInContext();
  const signIn = useCoreSignIn();
  const { displayConfig } = useEnvironment();

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
    const data = getOAuthProviderData({ strategy: o });

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
      error={error}
      flow='sign-in'
      handleClick={startOauth}
      options={options}
    />
  );
}

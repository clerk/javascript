import type { HandleOAuthCallbackParams } from '@clerk/shared/types';
import { createContext, useCallback, useContext } from 'react';

import { buildURL } from '../../../utils';
import { RedirectUrls } from '../../../utils/redirectUrls';
import { useEnvironment, useOptions } from '../../contexts';
import { useRouter } from '../../router';
import type { GoogleOneTapCtx } from '../../types';

export const GoogleOneTapContext = createContext<GoogleOneTapCtx | null>(null);

export const useGoogleOneTapContext = () => {
  const context = useContext(GoogleOneTapContext);
  const options = useOptions();
  const { displayConfig } = useEnvironment();
  const { queryParams } = useRouter();

  if (!context || context.componentName !== 'GoogleOneTap') {
    throw new Error('Clerk: useGoogleOneTapContext called outside GoogleOneTap.');
  }

  const { componentName, ...ctx } = context;

  const generateCallbackUrls = useCallback(
    (returnBackUrl: string): HandleOAuthCallbackParams => {
      const redirectUrls = new RedirectUrls(
        options,
        {
          ...ctx,
          signInFallbackRedirectUrl: returnBackUrl,
          signUpFallbackRedirectUrl: returnBackUrl,
        },
        queryParams,
      );

      let signUpUrl = options.signUpUrl || displayConfig.signUpUrl;
      let signInUrl = options.signInUrl || displayConfig.signInUrl;

      const preservedParams = redirectUrls.getPreservedSearchParams();
      signInUrl = buildURL({ base: signInUrl, hashSearchParams: [queryParams, preservedParams] }, { stringify: true });
      signUpUrl = buildURL({ base: signUpUrl, hashSearchParams: [queryParams, preservedParams] }, { stringify: true });

      const signInForceRedirectUrl = redirectUrls.getAfterSignInUrl();
      const signUpForceRedirectUrl = redirectUrls.getAfterSignUpUrl();

      const signUpContinueUrl = buildURL(
        {
          base: signUpUrl,
          hashPath: '/continue',
          hashSearch: new URLSearchParams({
            sign_up_force_redirect_url: signUpForceRedirectUrl,
          }).toString(),
        },
        { stringify: true },
      );

      const firstFactorUrl = buildURL(
        {
          base: signInUrl,
          hashPath: '/factor-one',
          hashSearch: new URLSearchParams({
            sign_in_force_redirect_url: signInForceRedirectUrl,
          }).toString(),
        },
        { stringify: true },
      );
      const secondFactorUrl = buildURL(
        {
          base: signInUrl,
          hashPath: '/factor-two',
          hashSearch: new URLSearchParams({
            sign_in_force_redirect_url: signInForceRedirectUrl,
          }).toString(),
        },
        { stringify: true },
      );

      return {
        signInUrl,
        signUpUrl,
        firstFactorUrl,
        secondFactorUrl,
        continueSignUpUrl: signUpContinueUrl,
        signInForceRedirectUrl,
        signUpForceRedirectUrl,
      };
    },
    [ctx, displayConfig.signInUrl, displayConfig.signUpUrl, options, queryParams],
  );

  return {
    ...ctx,
    componentName,
    generateCallbackUrls,
  };
};

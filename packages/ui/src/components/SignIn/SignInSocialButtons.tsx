import type { ClerkAPIError } from '@clerk/shared/error';
import { isClerkAPIResponseError } from '@clerk/shared/error';
import { ERROR_CODES } from '@clerk/shared/internal/clerk-js/constants';
import { useClerk } from '@clerk/shared/react';
import type { OAuthStrategy, PhoneCodeChannel } from '@clerk/shared/types';
import React, { useCallback, useEffect, useRef } from 'react';

import { handleError as _handleError } from '@/ui/utils/errorHandler';
import { originPrefersPopup } from '@/ui/utils/originPrefersPopup';
import { web3CallbackErrorHandler } from '@/ui/utils/web3CallbackErrorHandler';

import { useCoreSignIn, useSignInContext } from '../../contexts';
import { useCardState } from '../../elements/contexts';
import type { SocialButtonsProps } from '../../elements/SocialButtons';
import { SocialButtons } from '../../elements/SocialButtons';
import { useRouter } from '../../router';
import { buildSignInOAuthTransportCallbackParams } from './buildOAuthCallbackParams';
import { chatGPTSIWCOIDCPrompt, isChatGPTSIWCFlow } from './chatGPTSIWC';

export type SignInSocialButtonsProps = SocialButtonsProps & {
  onAlternativePhoneCodeProviderClick?: (channel: PhoneCodeChannel) => void;
  autoStartChatGPT?: boolean;
  ignoreChatGPTLoginHint?: boolean;
};

export const SignInSocialButtons = React.memo((props: SignInSocialButtonsProps) => {
  const clerk = useClerk();
  const { navigate } = useRouter();
  const card = useCardState();
  const ctx = useSignInContext();
  const signIn = useCoreSignIn();
  const autoStarted = useRef(false);
  const redirectUrl = ctx.ssoCallbackUrl;
  const redirectUrlComplete = ctx.afterSignInUrl || '/';
  const shouldUsePopup =
    !clerk.__internal_hasOAuthTransport &&
    (ctx.oauthFlow === 'popup' || (ctx.oauthFlow === 'auto' && originPrefersPopup()));
  const { onAlternativePhoneCodeProviderClick, autoStartChatGPT, ignoreChatGPTLoginHint, ...rest } = props;

  const handleError = useCallback(
    (err: any) => {
      if (isClerkAPIResponseError(err)) {
        const sessionAlreadyExistsError: ClerkAPIError | undefined = err.errors.find(
          (e: ClerkAPIError) => e.code === ERROR_CODES.SESSION_EXISTS,
        );

        if (sessionAlreadyExistsError) {
          return clerk.setActive({
            session: clerk.client.lastActiveSessionId,
            navigate: async ({ session, decorateUrl }) => {
              await ctx.navigateOnSetActive({ session, redirectUrl: ctx.afterSignInUrl, decorateUrl });
            },
          });
        }
      }

      return _handleError(err, [], card.setError);
    },
    [card, clerk, ctx],
  );

  const startOAuthRedirect = useCallback(
    (strategy: OAuthStrategy) =>
      signIn.authenticateWithRedirect({
        strategy,
        redirectUrl,
        redirectUrlComplete,
        oidcPrompt: chatGPTSIWCOIDCPrompt(ctx.oidcPrompt, ctx.queryParams),
        oidcLoginHint:
          isChatGPTSIWCFlow(ctx.queryParams) && !ignoreChatGPTLoginHint
            ? ctx.queryParams.email_address || ctx.queryParams.login_hint
            : undefined,
        __internal_callbackParams: {
          ...buildSignInOAuthTransportCallbackParams(ctx),
          __internal_navigateOnSetActive: ctx.navigateOnSetActive,
          __internal_navigate: navigate,
        },
      }),
    [ctx, ignoreChatGPTLoginHint, navigate, redirectUrl, redirectUrlComplete, signIn],
  );

  useEffect(() => {
    if (!autoStartChatGPT || autoStarted.current || !isChatGPTSIWCFlow(ctx.queryParams)) {
      return;
    }
    autoStarted.current = true;
    card.setLoading('oauth_chatgpt');
    try {
      window.sessionStorage.setItem(
        '__clerk_siwc_auto_start_at',
        JSON.stringify({ href: window.location.href, startedAt: Date.now() }),
      );
    } catch {
      // Browser storage may be unavailable; the in-memory guard still prevents repeated effects.
    }
    void startOAuthRedirect('oauth_chatgpt').catch(err => {
      void handleError(err);
      card.setIdle();
    });
  }, [autoStartChatGPT, card, clerk.__internal_hasOAuthTransport, ctx.queryParams, handleError, startOAuthRedirect]);

  useEffect(() => {
    const resetLoadingAfterHistoryRestore = (event: PageTransitionEvent) => {
      if (event.persisted && autoStarted.current) {
        card.setIdle();
      }
    };
    window.addEventListener('pageshow', resetLoadingAfterHistoryRestore);
    return () => window.removeEventListener('pageshow', resetLoadingAfterHistoryRestore);
  }, [card]);

  return (
    <SocialButtons
      {...rest}
      preferredOAuthStrategy={isChatGPTSIWCFlow(ctx.queryParams) ? 'oauth_chatgpt' : undefined}
      showLastAuthenticationStrategy
      idleAfterDelay={!shouldUsePopup && !clerk.__internal_hasOAuthTransport}
      oauthCallback={strategy => {
        if (shouldUsePopup) {
          // We create the popup window here with the `about:blank` URL since some browsers will block popups that are
          // opened within async functions. The `signInWithPopup` method handles setting the URL of the popup.
          const popup = window.open('about:blank', '', 'width=600,height=800');
          // Unfortunately, there's no good way to detect when the popup is closed, so we simply poll and check if it's closed.
          const interval = setInterval(() => {
            if (!popup || popup.closed) {
              clearInterval(interval);
              card.setIdle();
            }
          }, 500);

          return signIn
            .authenticateWithPopup({ strategy, redirectUrl, redirectUrlComplete, popup, oidcPrompt: ctx.oidcPrompt })
            .catch(err => handleError(err));
        }

        return signIn
          .authenticateWithRedirect({
            strategy,
            redirectUrl,
            redirectUrlComplete,
            oidcPrompt: ctx.oidcPrompt,
            __internal_callbackParams: {
              ...buildSignInOAuthTransportCallbackParams(ctx),
              __internal_navigateOnSetActive: ctx.navigateOnSetActive,
              __internal_navigate: navigate,
            },
          })
          .catch(err => {
            const res = handleError(err);
            if (clerk.__internal_hasOAuthTransport) {
              card.setIdle();
            }
            return res;
          });
      }}
      web3Callback={strategy => {
        if (strategy === 'web3_solana_signature') {
          return navigate(`choose-wallet?strategy=${strategy}`);
        }

        return clerk
          .authenticateWithWeb3({
            customNavigate: navigate,
            redirectUrl: redirectUrlComplete,
            signUpContinueUrl: ctx.isCombinedFlow ? 'create/continue' : ctx.signUpContinueUrl,
            strategy,
            secondFactorUrl: 'factor-two',
            protectCheckUrl: 'protect-check',
            signUpProtectCheckUrl: ctx.isCombinedFlow ? 'create/protect-check' : undefined,
          })
          .catch(err => web3CallbackErrorHandler(err, card.setError));
      }}
      alternativePhoneCodeCallback={channel => {
        onAlternativePhoneCodeProviderClick?.(channel);
      }}
    />
  );
});

import type { OAuthStrategy, PhoneCodeChannel, Web3Strategy } from '@clerk/shared/types';
import { useEffect, useRef } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';
import { web3CallbackErrorHandler } from '@/ui/utils/web3CallbackErrorHandler';
export type SocialAuthenticationCommands = {
  requestKey: string;
  canRun: () => boolean;
  shouldUsePopup: boolean;
  hasOAuthTransport: boolean;
  authenticateWithPopup: (strategy: OAuthStrategy, popup: Window | null) => Promise<void>;
  authenticateWithRedirect: (strategy: OAuthStrategy) => Promise<void>;
  authenticateWithWeb3: (strategy: Web3Strategy) => Promise<void>;
  recoverSessionExists?: (error: unknown) => Promise<void> | undefined;
};

type Request = { timer?: ReturnType<typeof setInterval> };

export function useSocialAuthenticationController(
  model: SocialAuthenticationCommands,
  onAlternativePhoneCodeProviderClick?: (channel: PhoneCodeChannel) => void,
) {
  const card = useCardState();
  const latestCard = useRef(card);
  latestCard.current = card;
  const mounted = useRef(true);
  const pending = useRef<Request>();
  const scope = useRef({ key: model.requestKey, version: 0 });
  if (scope.current.key !== model.requestKey) {
    scope.current = { key: model.requestKey, version: scope.current.version + 1 };
  }
  const version = scope.current.version;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearInterval(pending.current?.timer);
      pending.current = undefined;
    };
  }, [model.requestKey]);
  const isCurrent = () => mounted.current && scope.current.version === version && model.canRun();
  const startRequest = () => {
    if (!isCurrent() || pending.current) {
      return;
    }
    const request: Request = {};
    pending.current = request;
    return request;
  };
  const ownsRequest = (request: Request) => isCurrent() && pending.current === request;
  const finishRequest = (request: Request, clearLoading: boolean) => {
    clearInterval(request.timer);
    if (ownsRequest(request) && clearLoading) {
      latestCard.current.setIdle();
    }
    if (pending.current === request) {
      pending.current = undefined;
    }
  };
  const handleOAuthError = async (error: unknown, request: Request) => {
    if (!ownsRequest(request)) {
      return;
    }
    const recovered = model.recoverSessionExists?.(error);
    if (recovered) {
      try {
        await recovered;
      } catch (recoveryError) {
        if (ownsRequest(request)) {
          throw recoveryError;
        }
      }
      return;
    }
    handleError(error as Error, [], latestCard.current.setError);
  };

  return {
    idleAfterDelay: !model.shouldUsePopup && !model.hasOAuthTransport,
    oauthCallback: (strategy: OAuthStrategy) => {
      const request = startRequest();
      if (!request) {
        return Promise.resolve();
      }
      if (model.shouldUsePopup) {
        // We create the popup window here with the `about:blank` URL since some browsers will block popups that are
        // opened within async functions. The authentication method handles setting the URL of the popup.
        let popup: Window | null;
        try {
          popup = window.open('about:blank', '', 'width=600,height=800');
        } catch (error) {
          finishRequest(request, true);
          return Promise.reject(error instanceof Error ? error : new Error(String(error)));
        }
        // Unfortunately, there's no good way to detect when the popup is closed, so we simply poll and check if it's closed.
        request.timer = setInterval(() => {
          if (!ownsRequest(request) || !popup || popup.closed) {
            clearInterval(request.timer);
            if (ownsRequest(request)) {
              latestCard.current.setIdle();
            }
          }
        }, 500);
        return model
          .authenticateWithPopup(strategy, popup)
          .catch(error => handleOAuthError(error, request))
          .finally(() => finishRequest(request, true));
      }
      return model
        .authenticateWithRedirect(strategy)
        .catch(error => handleOAuthError(error, request))
        .finally(() => finishRequest(request, model.hasOAuthTransport));
    },
    web3Callback: (strategy: Web3Strategy) => {
      const request = startRequest();
      if (!request) {
        return Promise.resolve();
      }
      return model
        .authenticateWithWeb3(strategy)
        .catch(error => {
          if (ownsRequest(request) && strategy !== 'web3_solana_signature') {
            web3CallbackErrorHandler(error, latestCard.current.setError);
          } else if (ownsRequest(request)) {
            throw error;
          }
        })
        .finally(() => finishRequest(request, false));
    },
    alternativePhoneCodeCallback: (channel: PhoneCodeChannel) => {
      if (isCurrent()) {
        onAlternativePhoneCodeProviderClick?.(channel);
      }
    },
  };
}

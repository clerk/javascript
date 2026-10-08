import { getAlternativePhoneCodeProviderData } from '@clerk/shared/alternativePhoneCode';
import type { OAuthStrategy, PhoneCodeChannel, Web3Strategy } from '@clerk/shared/types';
import { useEffect, useRef } from 'react';

import { useCardState } from './contexts';
import type { SocialStrategy, useSocialButtonsModel } from './social-buttons.model';
import type { SocialButtonsRootProps } from './SocialButtons';

type Request = {
  release: () => void;
  timer?: ReturnType<typeof setTimeout>;
  resume?: () => void;
};

export const useSocialButtonsController = (
  model: Pick<ReturnType<typeof useSocialButtonsModel>, 'requestKey' | 'canRun'>,
  props: Pick<
    SocialButtonsRootProps,
    'oauthCallback' | 'web3Callback' | 'alternativePhoneCodeCallback' | 'idleAfterDelay'
  >,
) => {
  const card = useCardState();
  const latest = useRef({ model, props, card });
  latest.current = { model, props, card };
  const mounted = useRef(true);
  const pending = useRef<Request>();
  const scope = useRef({ key: model.requestKey, version: 0 });
  if (scope.current.key !== model.requestKey) {
    scope.current = { key: model.requestKey, version: scope.current.version + 1 };
  }
  const version = scope.current.version;
  const dispose = (request: Request) => {
    clearTimeout(request.timer);
    request.resume?.();
    request.release();
    if (pending.current === request) {
      pending.current = undefined;
    }
  };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (pending.current) {
        dispose(pending.current);
      }
    };
  }, [model.requestKey]);
  const isCurrent = () => mounted.current && scope.current.version === version && latest.current.model.canRun();
  const wait = (request: Request, duration: number) =>
    new Promise<void>(resolve => {
      request.resume = resolve;
      request.timer = setTimeout(resolve, duration);
    });
  const onSocialButtonClick = (strategy: SocialStrategy) => async () => {
    if (!isCurrent()) {
      return;
    }
    if (getAlternativePhoneCodeProviderData(strategy)) {
      latest.current.props.alternativePhoneCodeCallback(strategy as PhoneCodeChannel);
      return;
    }
    if (pending.current) {
      return;
    }
    const release = latest.current.card.beginRequest(strategy);
    if (!release) {
      return;
    }
    const request: Request = { release };
    pending.current = request;
    try {
      try {
        if (strategy.startsWith('web3_')) {
          await latest.current.props.web3Callback(strategy as Web3Strategy);
        } else {
          await latest.current.props.oauthCallback(strategy as OAuthStrategy);
        }
      } catch {
        if (isCurrent() && pending.current === request) {
          await wait(request, 1000);
        }
        return;
      }
      if (isCurrent() && pending.current === request && (latest.current.props.idleAfterDelay ?? true)) {
        await wait(request, 5000);
      }
    } finally {
      dispose(request);
    }
  };
  return { onSocialButtonClick, isLoading: card.isLoading, loadingMetadata: card.loadingMetadata };
};

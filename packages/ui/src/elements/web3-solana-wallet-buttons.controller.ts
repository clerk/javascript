import { useEffect, useRef } from 'react';

import { useCardState } from './contexts';

type WalletRequest = {
  release: () => void;
  timer?: ReturnType<typeof setTimeout>;
  resume?: () => void;
};

export const useWeb3SolanaWalletButtonsController = (
  authenticate: (params: { walletName: string }) => Promise<unknown>,
) => {
  const card = useCardState();
  const latest = useRef({ card, authenticate });
  latest.current = { card, authenticate };
  const mounted = useRef(true);
  const pending = useRef<WalletRequest>();
  const dispose = (request: WalletRequest) => {
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
  }, []);

  const onWalletClick = (walletName: string) => async () => {
    if (!mounted.current || pending.current) {
      return;
    }
    const release = latest.current.card.beginRequest(walletName);
    if (!release) {
      return;
    }
    const request: WalletRequest = { release };
    pending.current = request;
    try {
      await latest.current.authenticate({ walletName });
    } catch {
      if (mounted.current && pending.current === request) {
        await new Promise<void>(resolve => {
          request.resume = resolve;
          request.timer = setTimeout(resolve, 1000);
        });
      }
    } finally {
      dispose(request);
    }
  };

  return { onWalletClick, isLoading: card.isLoading, loadingMetadata: card.loadingMetadata };
};

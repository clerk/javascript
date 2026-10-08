import { useEffect, useRef } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { web3CallbackErrorHandler } from '@/ui/utils/web3CallbackErrorHandler';

type SolanaWalletModel = {
  requestKey: string;
  canRun: () => boolean;
  navigateBack: () => Promise<void>;
  authenticate: (walletName: string) => Promise<void>;
};

export const useSolanaWalletController = (model: SolanaWalletModel) => {
  const card = useCardState();
  const mounted = useRef(true);
  const scope = useRef({ key: model.requestKey, version: 0 });
  if (scope.current.key !== model.requestKey) {
    scope.current = { key: model.requestKey, version: scope.current.version + 1 };
  }
  const version = scope.current.version;
  const canRun = () => mounted.current && scope.current.version === version && model.canRun();
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const presentError = (error: unknown) => {
    if (canRun()) {
      web3CallbackErrorHandler(error, card.setError);
    }
  };
  return {
    requestKey: model.requestKey,
    error: card.error,
    onBackLinkClick: () => {
      if (canRun()) {
        void model.navigateBack().catch(presentError);
      }
    },
    onWeb3Auth: async ({ walletName }: { walletName: string }) => {
      if (!canRun()) {
        return;
      }
      try {
        await model.authenticate(walletName);
      } catch (error) {
        presentError(error);
      }
    },
  };
};

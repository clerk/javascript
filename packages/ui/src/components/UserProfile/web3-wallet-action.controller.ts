import type { Web3Strategy } from '@clerk/shared/types';
import { useEffect, useRef, useState } from 'react';

import { useActionContext } from '@/ui/elements/Action/ActionRoot';
import { useCardState } from '@/ui/elements/contexts';
import { web3CallbackErrorHandler } from '@/ui/utils/web3CallbackErrorHandler';

import type { useWeb3WalletActionModel, Web3ConnectionRequest } from './web3-wallet-action.model';

export const useWeb3WalletActionController = (model: ReturnType<typeof useWeb3WalletActionModel>) => {
  const card = useCardState();
  const { open } = useActionContext();
  const [pendingState, setPendingState] = useState<{ key: string; strategy: Web3Strategy }>();
  const pending = useRef<{ release?: () => void; canRun: () => boolean }>();
  const pendingStrategy =
    pendingState?.key === model.requestKey && pending.current?.canRun() ? pendingState.strategy : undefined;
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      pending.current?.release?.();
      pending.current = undefined;
    };
  }, [model.requestKey]);

  const connect = async (request: Web3ConnectionRequest): Promise<boolean> => {
    const isCurrent = () => mounted.current && model.canRun() && (request.canRun?.() ?? true);
    if (pending.current && !pending.current.canRun()) {
      pending.current.release?.();
      pending.current = undefined;
    }
    if (!isCurrent() || pending.current) {
      return false;
    }
    const connection = model.prepareConnection({ ...request, canRun: isCurrent });
    if (connection.status === 'select-wallet') {
      open('web3Wallets');
      return false;
    }
    const release = request.walletName ? undefined : card.beginRequest(request.strategy);
    if (!request.walletName && !release) {
      return false;
    }
    const action = { release, canRun: isCurrent };
    pending.current = action;
    card.setError(undefined);
    setPendingState({ key: model.requestKey, strategy: request.strategy });
    try {
      const completed = await connection.execute();
      return isCurrent() && completed;
    } catch (error) {
      if (isCurrent()) {
        web3CallbackErrorHandler(error, card.setError);
      }
      return false;
    } finally {
      action.release?.();
      if (pending.current === action) {
        pending.current = undefined;
        if (mounted.current) {
          setPendingState(undefined);
        }
      }
    }
  };

  return {
    requestKey: model.requestKey,
    strategies: model.strategies,
    connect,
    isDisabled: card.isLoading || !!pendingStrategy,
    isLoading: (strategy: Web3Strategy) => card.loadingMetadata === strategy || pendingStrategy === strategy,
  };
};

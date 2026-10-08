import { ClerkRuntimeError } from '@clerk/shared/error';
import { useEffect, useRef } from 'react';

import { useActionContext } from '@/ui/elements/Action/ActionRoot';
import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/utils/errorHandler';

import type { Web3SelectWalletProps } from './Web3SelectSolanaWalletScreen';

export const useWeb3SelectSolanaWalletController = ({ onConnect }: Web3SelectWalletProps) => {
  const card = useCardState();
  const action = useActionContext();
  const mounted = useRef(true);
  const scope = useRef({ active: action.active, version: 0 });
  if (scope.current.active !== action.active) {
    scope.current = { active: action.active, version: scope.current.version + 1 };
  }
  const version = scope.current.version;
  const isCurrent = () => mounted.current && scope.current.version === version;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const close = () => {
    if (isCurrent()) {
      action.close();
    }
  };
  const onClick = async ({ walletName }: { walletName: string }) => {
    if (!isCurrent()) {
      return;
    }
    try {
      const completed = await onConnect({ strategy: 'web3_solana_signature', walletName, canRun: isCurrent });
      if (completed) {
        close();
      }
    } catch (err) {
      if (!isCurrent()) {
        return;
      }
      if (err instanceof Error) {
        handleError(err, [], card.setError);
      } else {
        const error = new ClerkRuntimeError('An error occurred while generating the Solana signature.', {
          code: 'web3_solana_signature_generation_failed',
        });
        handleError(error, [], card.setError);
      }
    }
  };

  return { onClick, close };
};

import { ClerkRuntimeError } from '@clerk/shared/error';
import { createWeb3 } from '@clerk/shared/internal/clerk-js/web3';
import { useReverification, useUser } from '@clerk/shared/react';
import type { Web3Provider, Web3Strategy } from '@clerk/shared/types';

import { useModuleManager } from '@/contexts';
import type { ProviderIcon } from '@/ui/common';
import { useEnabledThirdPartyProviders } from '@/ui/hooks';
import type { PropsOfComponent } from '@/ui/styledSystem';

import { useProfileRequestScopeModel } from './profile-request-scope.model';

export type Web3ConnectionRequest = { strategy: Web3Strategy; walletName?: string; canRun?: () => boolean };

export type Web3StrategyRow = {
  strategy: Web3Strategy;
  id: PropsOfComponent<typeof ProviderIcon>['id'];
  name: string;
  iconUrl?: string;
};

export const useWeb3WalletActionModel = () => {
  const { user } = useUser();
  const scope = useProfileRequestScopeModel('web3-wallet');
  const { strategies, strategyToDisplayData } = useEnabledThirdPartyProviders();
  const moduleManager = useModuleManager();
  const enabledStrategies = strategies.filter(strategy => strategy.startsWith('web3')) as Web3Strategy[];
  const connectedStrategies =
    user?.verifiedWeb3Wallets?.map(wallet => wallet.verification.strategy) ?? ([] as Web3Strategy[]);
  const unconnectedStrategies = enabledStrategies.filter(strategy => {
    return !connectedStrategies.includes(strategy) && strategyToDisplayData[strategy];
  });
  const createWeb3Wallet = useReverification((identifier: string, isCurrent: () => boolean) =>
    isCurrent() ? user?.createWeb3Wallet({ web3Wallet: identifier }) : undefined,
  );

  return {
    requestKey: scope.requestKey,
    canRun: scope.canRun,
    strategies: unconnectedStrategies.map(strategy => ({
      strategy,
      id: strategyToDisplayData[strategy].id,
      name: strategyToDisplayData[strategy].name,
      iconUrl: strategyToDisplayData[strategy].iconUrl,
    })),
    prepareConnection: ({ strategy, walletName, canRun: canContinue }: Web3ConnectionRequest) => {
      const web3 = createWeb3(moduleManager);

      // If the user selects `web3_solana_signature` as their strategy,
      // we need to obtain the wallet name to use when connecting and signing the message during the auth flow
      //
      // Otherwise, our current Web3 providers are all based on the wallet provider name,
      // which is sufficient for our current use case when connecting to a wallet.
      if (strategy === 'web3_solana_signature' && !walletName) {
        return { status: 'select-wallet' as const };
      }

      const provider = strategy.replace('web3_', '').replace('_signature', '') as Web3Provider;
      return {
        status: 'ready' as const,
        execute: async () => {
          const isCurrent = () => scope.canRun() && (canContinue?.() ?? true);
          if (!isCurrent()) {
            return false;
          }
          const identifier = await web3.getWeb3Identifier({ provider, walletName });

          if (!isCurrent()) {
            return false;
          }
          if (!user) {
            throw new Error('user is not defined');
          }

          // `getWeb3Identifier` returns '' when the wallet provider (or its dynamic
          // import) is unavailable. Posting an empty string yields an unhelpful 422
          // from FAPI (`form_param_nil` on `web3_wallet`); surface the missing-
          // provider state locally instead.
          if (!identifier) {
            throw new ClerkRuntimeError('A Web3 Wallet extension cannot be found. Please install one to continue.', {
              code: 'web3_missing_identifier',
            });
          }

          let web3Wallet = await createWeb3Wallet(identifier, isCurrent);
          if (!isCurrent() || !web3Wallet) {
            return false;
          }
          web3Wallet = await web3Wallet.prepareVerification({ strategy });
          if (!isCurrent() || !web3Wallet) {
            return false;
          }
          const message = web3Wallet.verification.message as string;
          const signature = await web3.generateWeb3Signature({ identifier, nonce: message, provider, walletName });
          if (!isCurrent()) {
            return false;
          }
          const verified = await web3Wallet.attemptVerification({ signature });
          return isCurrent() && verified.verification.status === 'verified';
        },
      };
    },
  };
};

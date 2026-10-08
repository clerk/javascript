import { useReverification, useUser } from '@clerk/shared/react';

import type { ProviderIcon } from '@/ui/common';
import { useEnabledThirdPartyProviders } from '@/ui/hooks';
import type { PropsOfComponent } from '@/ui/styledSystem';

import { sortIdentificationBasedOnVerification } from './utils';

export type Web3SectionProps = { shouldAllowCreation?: boolean };

export type Web3WalletRow = {
  id: string;
  label: string;
  icon?: { id: PropsOfComponent<typeof ProviderIcon>['id']; iconUrl: string; name: string };
  isPrimary: boolean;
  isVerified: boolean;
};

export const useWeb3SectionModel = () => {
  const { user } = useUser();
  const { strategyToDisplayData } = useEnabledThirdPartyProviders();

  const rows = sortIdentificationBasedOnVerification(user?.web3Wallets, user?.primaryWeb3WalletId)
    .map(wallet => {
      const strategy = wallet.verification.strategy;
      const displayData = strategyToDisplayData[strategy as keyof typeof strategyToDisplayData] ?? null;
      // We only display the Web3 wallet if it matches a known provider
      // in displayData, or if it was added by an administrator using BAPI.
      if (!displayData && strategy !== 'admin') {
        return null;
      }
      return {
        id: wallet.id,
        label: displayData
          ? `${displayData.name} (${shortenWeb3Address(wallet.web3Wallet)})`
          : shortenWeb3Address(wallet.web3Wallet),
        icon: displayData?.iconUrl
          ? { id: displayData.id, iconUrl: displayData.iconUrl, name: displayData.name }
          : undefined,
        isPrimary: user?.primaryWeb3WalletId === wallet.id,
        isVerified: wallet.verification.status === 'verified',
      };
    })
    .filter(row => row !== null);

  return { hasWeb3Wallets: Boolean(user?.web3Wallets?.length), rows };
};

export const useWeb3WalletMenuModel = (walletId: string) => {
  const { user } = useUser();
  const setPrimary = useReverification(() => user?.update({ primaryWeb3WalletId: walletId }));

  return { isPrimary: user?.primaryWeb3WalletId === walletId, setPrimary: () => setPrimary() };
};

const shortenWeb3Address = (address: string) => {
  if (address.length <= 10) {
    return address;
  }
  return address.slice(0, 6) + '...' + address.slice(-4);
};

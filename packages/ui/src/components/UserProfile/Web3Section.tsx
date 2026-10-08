import { withCardStateProvider } from '@/ui/elements/contexts';

import { useWeb3SectionController, useWeb3WalletMenuController } from './web3-section.controller';
import type { Web3SectionProps, Web3WalletRow } from './web3-section.model';
import { useWeb3SectionModel, useWeb3WalletMenuModel } from './web3-section.model';
import { RemoveWeb3WalletScreen } from './web3-section.screens';
import { Web3SectionView, Web3WalletMenuView, Web3WalletRowView } from './web3-section.view';
import { AddWeb3WalletActionMenu } from './Web3Form';

export const Web3Section = withCardStateProvider(({ shouldAllowCreation = true }: Web3SectionProps) => {
  const model = useWeb3SectionModel();
  const controller = useWeb3SectionController();

  if (!shouldAllowCreation && !model.hasWeb3Wallets) {
    return null;
  }

  return (
    <Web3SectionView
      controller={controller}
      items={model.rows.map(row => (
        <Web3WalletRowEntry
          key={row.id}
          row={row}
        />
      ))}
      addMenu={shouldAllowCreation ? <AddWeb3WalletActionMenu /> : null}
    />
  );
});

const Web3WalletRowEntry = ({ row }: { row: Web3WalletRow }) => (
  <Web3WalletRowView
    row={row}
    menu={
      <Web3WalletMenu
        walletId={row.id}
        isVerified={row.isVerified}
      />
    }
    removeScreen={<RemoveWeb3WalletScreen walletId={row.id} />}
  />
);

const Web3WalletMenu = ({ walletId, isVerified }: { walletId: string; isVerified: boolean }) => {
  const model = useWeb3WalletMenuModel(walletId);
  const controller = useWeb3WalletMenuController(model, walletId, isVerified);

  return <Web3WalletMenuView controller={controller} />;
};

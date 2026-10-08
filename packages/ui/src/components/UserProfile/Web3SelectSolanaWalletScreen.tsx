import type { Web3Strategy } from '@clerk/shared/types';

import { useWeb3SelectSolanaWalletController } from './web3-select-solana-wallet.controller';
import { Web3SelectSolanaWalletView } from './web3-select-solana-wallet.view';

export type Web3SelectWalletProps = {
  onConnect: (params: { strategy: Web3Strategy; walletName: string; canRun: () => boolean }) => Promise<boolean>;
};

export const Web3SelectSolanaWalletScreen = (props: Web3SelectWalletProps) => {
  const controller = useWeb3SelectSolanaWalletController(props);
  return <Web3SelectSolanaWalletView {...controller} />;
};

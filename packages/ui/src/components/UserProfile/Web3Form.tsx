import { useWeb3WalletActionController } from './web3-wallet-action.controller';
import { useWeb3WalletActionModel } from './web3-wallet-action.model';
import { Web3WalletActionView } from './web3-wallet-action.view';

export const AddWeb3WalletActionMenu = () => {
  const model = useWeb3WalletActionModel();
  const controller = useWeb3WalletActionController(model);

  return <Web3WalletActionView controller={controller} />;
};

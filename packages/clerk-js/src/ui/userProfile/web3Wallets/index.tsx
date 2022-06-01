import React from 'react';
import { Route } from 'ui/router';

import { AddNewWeb3Wallet } from './AddNewWeb3Wallet';
import { Web3WalletDetail } from './Web3WalletDetail';
import { Web3WalletList } from './Web3WalletList';

export { AddNewWeb3Wallet, Web3WalletDetail, Web3WalletList };

export function Web3WalletsRoutes(): JSX.Element {
  return (
    <Route path='web3-wallets'>
      <Route index>
        <Web3WalletList />
      </Route>
      <Route path=':web3_wallet_id'>
        <Web3WalletDetail />
      </Route>
      <Route path='add'>
        <AddNewWeb3Wallet />
      </Route>
    </Route>
  );
}

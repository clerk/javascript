import { renderJSON } from '@clerk/shared/testUtils';
import { UserResource, Web3WalletResource } from '@clerk/types';
import React from 'react';

import { Web3WalletList } from './Web3WalletList';

jest.mock('ui/router/RouteContext');

jest.mock('ui/contexts/CoreUserContext', () => {
  return {
    useCoreUser: (): Partial<UserResource> => {
      return {
        primaryWeb3WalletId: 'test-id-1',
        web3Wallets: [
          {
            id: 'test-id-1',
            web3Wallet: '0x0000000000000000000000000000000000000000',
            verification: { status: 'verified' },
          } as Web3WalletResource,
          {
            id: 'test-id-2',
            web3Wallet: '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
            verification: { status: 'verified' },
          } as Web3WalletResource,
        ],
      };
    },
  };
});

describe('<Web3WalletList/>', () => {
  it('renders the list', () => {
    const tree = renderJSON(<Web3WalletList />);
    expect(tree).toMatchSnapshot();
  });
});

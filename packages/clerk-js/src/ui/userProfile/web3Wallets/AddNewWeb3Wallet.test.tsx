import { renderJSON } from '@clerk/shared/testUtils';
import { UserResource, Web3WalletResource } from '@clerk/types';
import React from 'react';

import { AddNewWeb3Wallet } from './AddNewWeb3Wallet';

const mockNavigate = jest.fn();
jest.mock('ui/hooks', () => ({
  useNavigate: () => {
    return {
      navigate: mockNavigate,
    };
  },
}));

jest.mock('ui/router/RouteContext', () => {
  return {
    useRouter: () => {
      return {
        params: { web3_wallet_id: 'test-id' },
        resolve: () => {
          return {
            toURL: {
              href: 'https://www.ssddd.com',
            },
          };
        },
      };
    },
  };
});

jest.mock('ui/contexts/CoreUserContext', () => {
  return {
    useCoreUser: (): Partial<UserResource> => {
      return {
        primaryWeb3WalletId: 'test-id',
        web3Wallets: [
          {
            id: 'test-id',
            web3Wallet: '0x0000000000000000000000000000000000000000',
            verification: { status: 'verified' },
          } as Web3WalletResource,
        ],
      };
    },
  };
});

describe('<AddNewWeb3Wallet/>', () => {
  it('renders the AddNewWeb3Wallet', () => {
    const tree = renderJSON(<AddNewWeb3Wallet />);
    expect(tree).toMatchSnapshot();
  });
});

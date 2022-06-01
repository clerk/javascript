import { renderJSON } from '@clerk/shared/testUtils';
import { EnvironmentResource, UserResource, UserSettingsResource, Web3WalletResource } from '@clerk/types';
import React from 'react';
import { PartialDeep } from 'type-fest';

import { Web3WalletDetail } from './Web3WalletDetail';

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

jest.mock('ui/contexts', () => {
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
    useEnvironment: jest.fn(
      () =>
        ({
          userSettings: {} as PartialDeep<UserSettingsResource>,
        } as PartialDeep<EnvironmentResource>),
    ),
  };
});

describe('<Web3WalletDetail/>', () => {
  it('renders Web3WalletDetail', () => {
    const tree = renderJSON(<Web3WalletDetail />);
    expect(tree).toMatchSnapshot();
  });
});

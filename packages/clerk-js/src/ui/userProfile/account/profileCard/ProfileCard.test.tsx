import { renderJSON } from '@clerk/shared/testUtils';
import { EmailAddressResource, UserResource } from '@clerk/types';
import * as React from 'react';
import { PartialDeep } from 'type-fest';
import { useEnvironment } from 'ui/contexts';

import { ProfileCard } from './ProfileCard';

jest.mock('ui/hooks', () => {
  return {
    useNavigate: () => ({ navigate: jest.fn() }),
  };
});

jest.mock('ui/contexts', () => {
  return {
    useEnvironment: jest.fn(),
    useCoreUser: (): PartialDeep<UserResource> => {
      return {
        isPrimaryIdentification: jest.fn(() => true),
        emailAddresses: [
          {
            id: 1,
            emailAddress: 'clerk@clerk.dev',
            verification: { status: 'verified' },
          } as any as EmailAddressResource,
          {
            id: 2,
            emailAddress: 'clerk-unverified@clerk.dev',
            verification: { status: 'unverified' },
          } as any as EmailAddressResource,
        ],
        phoneNumbers: [],
        externalAccounts: [],
        web3Wallets: [{ web3Wallet: '0x123456789' }],
      };
    },
    useCoreClerk: jest.fn(),
  };
});

(useEnvironment as jest.Mock).mockImplementation(() => ({
  displayConfig: {},
  userSettings: {
    attributes: {
      email_address: {
        enabled: true,
      },
      phone_number: {
        enabled: true,
      },
      username: {
        enabled: false,
      },
      web3_wallet: {
        enabled: false,
      },
    },
  },
}));

describe('<ProfileCard/>', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the ProfileCard', () => {
    const tree = renderJSON(<ProfileCard />);
    expect(tree).toMatchSnapshot();
  });

  it('renders the ProfileCard ', () => {
    (useEnvironment as jest.Mock).mockImplementation(() => ({
      displayConfig: {},
      userSettings: {
        attributes: {
          email_address: {
            enabled: true,
          },
          phone_number: {
            enabled: true,
          },
          username: {
            enabled: false,
          },
          web3_wallet: {
            enabled: true,
          },
        },
      },
    }));

    const tree = renderJSON(<ProfileCard />);
    expect(tree).toMatchSnapshot();
  });
});

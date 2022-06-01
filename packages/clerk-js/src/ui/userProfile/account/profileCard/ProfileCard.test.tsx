import { renderJSON } from '@clerk/shared/testUtils';
import { EmailAddressResource, ExternalAccountResource, UserResource, Web3WalletResource } from '@clerk/types';
import * as React from 'react';
import { PartialDeep } from 'type-fest';
import { useCoreUser, useEnvironment } from 'ui/contexts';

import { ProfileCard } from './ProfileCard';

jest.mock('ui/hooks', () => {
  return {
    useNavigate: () => ({ navigate: jest.fn() }),
  };
});

jest.mock('ui/contexts', () => {
  return {
    useEnvironment: jest.fn(),
    useCoreUser: jest.fn(),
    useCoreClerk: jest.fn(),
  };
});

const userWithoutExtAccounts = (): PartialDeep<UserResource> => {
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
    verifiedExternalAccounts: [],
    unverifiedExternalAccounts: [],
    web3Wallets: [
      {
        web3Wallet: '0x0000000000000000000000000000000000000000',
        verification: { status: 'verified' },
      } as Web3WalletResource,
    ],
  };
};

const userWithExtAccounts = (): PartialDeep<UserResource> => {
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
    externalAccounts: [
      {
        id: 'eac_google',
        provider: 'google',
        emailAddress: 'sanjay@gmail.com',
        providerTitle: () => 'Google',
      } as ExternalAccountResource,
      {
        id: 'eac_twitch',
        provider: 'twitch',
        emailAddress: 'sanjay@gmail.com',
        username: 'dhalsim',
        providerTitle: () => 'Twitch',
      } as ExternalAccountResource,
      {
        id: 'eac_facebook',
        provider: 'facebook',
      } as ExternalAccountResource,
    ],
    verifiedExternalAccounts: [
      {
        id: 'eac_google',
        provider: 'google',
        emailAddress: 'sanjay@gmail.com',
        providerTitle: () => 'Google',
      } as ExternalAccountResource,
      {
        id: 'eac_twitch',
        provider: 'twitch',
        emailAddress: 'sanjay@gmail.com',
        username: 'dhalsim',
        providerTitle: () => 'Twitch',
      } as ExternalAccountResource,
    ],
    unverifiedExternalAccounts: [
      {
        id: 'eac_facebook',
        provider: 'facebook',
        providerTitle: () => 'Facebook',
      } as ExternalAccountResource,
    ],
    web3Wallets: [{ web3Wallet: '0x123456789' }],
  };
};

const envWithEmailPhone = () => ({
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
});

const envWithExternalAccount = () => ({
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
    social: {
      oauth_google: {
        enabled: true,
      },
      oauth_twitch: {
        enabled: true,
      },
      oauth_facebook: {
        enabled: true,
      },
    },
  },
});

const envWithWeb3Wallet = () => ({
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
});

describe('<ProfileCard/>', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the ProfileCard', () => {
    (useEnvironment as jest.Mock).mockImplementation(envWithEmailPhone);
    (useCoreUser as jest.Mock).mockImplementation(userWithoutExtAccounts);

    const tree = renderJSON(<ProfileCard />);
    expect(tree).toMatchSnapshot();
  });

  it('renders the ProfileCard with web3 wallet', () => {
    (useEnvironment as jest.Mock).mockImplementation(envWithWeb3Wallet);
    (useCoreUser as jest.Mock).mockImplementation(userWithoutExtAccounts);

    const tree = renderJSON(<ProfileCard />);
    expect(tree).toMatchSnapshot();
  });

  it('renders the profile card with verified external accounts', () => {
    (useEnvironment as jest.Mock).mockImplementation(envWithExternalAccount);
    (useCoreUser as jest.Mock).mockImplementation(userWithExtAccounts);

    const tree = renderJSON(<ProfileCard />);
    expect(tree).toMatchSnapshot();
  });
});

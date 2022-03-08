import { renderJSON } from '@clerk/shared/testUtils';
import {
  ClerkAPIErrorJSON,
  ExternalAccountJSON,
  OAuthProviders,
  UserJSON,
  UserResource,
  UserSettingsJSON,
  UserSettingsResource,
  VerificationJSON,
} from '@clerk/types';
import { User } from 'core/resources/User';
import { UserSettings } from 'core/resources/UserSettings';
import React from 'react';

import { ConnectedAccountList } from './ConnectedAccountList';

const mockNavigate = jest.fn();
jest.mock('ui/hooks', () => ({
  useNavigate: () => {
    return {
      navigate: mockNavigate,
    };
  },
}));

const mockUseEnvironment = jest.fn();

jest.mock('ui/contexts', () => {
  return {
    useCoreUser: (): Partial<UserResource> => {
      return new User({
        object: 'user',
        id: 'user_1nQu4nZrhHEeolMMRhg4yERFYJx',
        username: '',
        first_name: 'Peter',
        last_name: 'Smith',
        email_addresses: [],
        phone_numbers: [],
        web3_wallets: [],
        external_accounts: [
          {
            id: 'fbac_yolo',
            provider: 'facebook',
            approved_scopes: 'email',
            avatar_url: 'http://text.host/avatar.png',
            email_address: 'peter@gmail.com',
            first_name: 'Peter',
            last_name: 'Smith',
            provider_user_id: '10147951078263327',
            verification: { status: 'verified' } as VerificationJSON,
          } as ExternalAccountJSON,
          {
            id: 'gac_swag',
            provider: 'google',
            approved_scopes:
              'email https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid profile',
            avatar_url: 'http://text.host/avatar.png',
            email_address: 'peter@gmail.com',
            first_name: 'Peter',
            last_name: 'Smith',
            provider_user_id: '112567347150540108741',
            verification: { status: 'verified' } as VerificationJSON,
          } as ExternalAccountJSON,
          {
            id: 'eac_heehee',
            provider: 'github',
            approved_scopes: '',
            avatar_url: '',
            email_address: '',
            first_name: '',
            last_name: '',
            provider_user_id: '',
            verification: {
              status: 'unverified',
              error: {
                long_message: 'Everything that could go wrong, did',
              } as ClerkAPIErrorJSON,
            } as VerificationJSON,
          } as ExternalAccountJSON,
        ],
      } as unknown as UserJSON);
    },
    useEnvironment: () => mockUseEnvironment(),
  };
});

const environmentContext = {
  userSettings: new UserSettings({
    social: {
      oauth_google: {
        enabled: true,
        required: false,
        authenticatable: true,
        strategy: 'oauth_google',
      },
      oauth_facebook: {
        enabled: true,
        required: false,
        authenticatable: true,
        strategy: 'oauth_facebook',
      },
      oauth_github: {
        enabled: true,
        required: false,
        authenticatable: true,
        strategy: 'oauth_github',
      },
      oauth_microsoft: {
        enabled: true,
        required: false,
        authenticatable: true,
        strategy: 'oauth_microsoft',
      },
      oauth_bitbucket: {
        enabled: false,
        required: false,
        authenticatable: true,
        strategy: 'oauth_bitbucket',
      },
      oauth_discord: {
        enabled: false,
        required: false,
        authenticatable: true,
        strategy: 'oauth_bitbucket',
      },
    } as OAuthProviders,
  } as UserSettingsJSON) as UserSettingsResource,
};

const emptyEnvironmentContext = {
  userSettings: new UserSettings({
    social: {
      oauth_google: {
        enabled: false,
        required: false,
        authenticatable: true,
        strategy: 'oauth_google',
      },
      oauth_facebook: {
        enabled: false,
        required: false,
        authenticatable: true,
        strategy: 'oauth_facebook',
      },
    } as OAuthProviders,
  } as UserSettingsJSON) as UserSettingsResource,
};

jest.mock('ui/router/RouteContext', () => {
  return {
    useRouter: () => {
      return {
        resolve: () => {
          return {
            toURL: {
              href: 'http://www.ssddd.com',
            },
          };
        },
      };
    },
  };
});

describe('<ConnectedAccountList/>', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a list of Connected Accounts', () => {
    mockUseEnvironment.mockImplementation(() => environmentContext);
    const tree = renderJSON(<ConnectedAccountList />);
    expect(tree).toMatchSnapshot();
  });

  it('renders an empty list if there are no enabled providers', () => {
    mockUseEnvironment.mockImplementation(() => emptyEnvironmentContext);
    const tree = renderJSON(<ConnectedAccountList />);
    expect(tree).toMatchSnapshot();
  });
});

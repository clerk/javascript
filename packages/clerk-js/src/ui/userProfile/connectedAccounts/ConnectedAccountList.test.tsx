import React from 'react';
import { renderJSON } from '@clerk/shared/testUtils';
import { ConnectedAccountList } from './ConnectedAccountList';
import { ExternalAccount } from 'core/resources/ExternalAccount';
import { ExternalAccountResource, UserResource } from '@clerk/types';

const mockNavigate = jest.fn();
jest.mock('ui/hooks', () => ({
  useNavigate: () => {
    return {
      navigate: mockNavigate,
    };
  },
}));

jest.mock('ui/contexts', () => {
  return {
    useCoreUser: (): Partial<UserResource> => {
      return {
        id: 'user_1nQu4nZrhHEeolMMRhg4yERFYJx',
        username: null,
        firstName: 'Peter',
        lastName: 'Smith',
        externalAccounts: [
          new ExternalAccount({
            id: 'fbac_yolo',
            provider: 'facebook',
            approvedScopes: 'email',
            emailAddress: 'peter@gmail.com',
            firstName: 'Peter',
            lastName: 'Smith',
            externalId: '10147951078263327',
          } as ExternalAccountResource),
          new ExternalAccount({
            id: 'gac_swag',
            provider: 'google',
            approvedScopes:
              'email https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid profile',
            emailAddress: 'peter@gmail.com',
            firstName: 'Peter',
            lastName: 'Smith',
            externalId: '112567347150540108741',
          } as ExternalAccountResource),
        ],
      };
    },
  };
});

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
  it('renders a list of Connected Accounts', async () => {
    const tree = renderJSON(<ConnectedAccountList />);
    expect(tree).toMatchSnapshot();
  });
});

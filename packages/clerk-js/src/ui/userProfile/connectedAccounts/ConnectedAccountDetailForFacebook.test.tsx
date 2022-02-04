import { renderJSON } from '@clerk/shared/testUtils';
import { ExternalAccountResource } from '@clerk/types';
import { ExternalAccount } from 'core/resources/ExternalAccount';
import React from 'react';

import { ConnectedAccountDetail } from './ConnectedAccountDetail';

jest.mock('ui/contexts/CoreUserContext', () => {
  return {
    useCoreUser: () => {
      return {
        User: {
          path: '/users/user_1nQu4nZrhHEeolMMRhg4yERFYJx',
          provider: 'clerk.prod.lclclerk.com',
          id: 'user_1nQu4nZrhHEeolMMRhg4yERFYJx',
          username: null,
        },
        data: {
          id: 'user_1nQu4nZrhHEeolMMRhg4yERFYJx',
          object: 'user',
          username: null,
          first_name: 'Peter',
          last_name: 'Smith',
        },
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
        params: { connected_account_id: 'fbac_yolo' },
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

describe('<ConnectedAccountDetail/>', () => {
  it('Connected Account Detail renders Facebook account', async () => {
    const tree = renderJSON(<ConnectedAccountDetail />);
    expect(tree).toMatchSnapshot();
  });
});

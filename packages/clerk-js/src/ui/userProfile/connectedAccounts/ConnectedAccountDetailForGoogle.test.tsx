import { renderJSON } from '@clerk/shared/testUtils';
import { ExternalAccountResource, UserResource } from '@clerk/types';
import { ExternalAccount } from 'core/resources/ExternalAccount';
import React from 'react';

import { ConnectedAccountDetail } from './ConnectedAccountDetail';

jest.mock('ui/contexts/CoreUserContext', () => {
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
        params: { connected_account_id: 'gac_swag' },
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
  it('Connected Account Detail renders Google account', async () => {
    const tree = renderJSON(<ConnectedAccountDetail />);
    expect(tree).toMatchSnapshot();
  });
});

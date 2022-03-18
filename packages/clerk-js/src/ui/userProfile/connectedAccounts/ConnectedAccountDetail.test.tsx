import { renderJSON } from '@clerk/shared/testUtils';
import type { ExternalAccountResource, UserResource } from '@clerk/types';
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
          {
            id: 'fbac_yolo',
            provider: 'facebook',
            approvedScopes: 'email',
            avatarUrl: 'http://text.host/avatar.png',
            emailAddress: 'peter@gmail.com',
            firstName: 'Peter',
            lastName: 'Smith',
            providerUserId: '10147951078263327',
            providerSlug: () => 'facebook',
            providerTitle: () => 'Facebook',
          } as ExternalAccountResource,
          {
            id: 'gac_swag',
            provider: 'google',
            approvedScopes:
              'email https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid profile',
            avatarUrl: 'http://text.host/avatar.png',
            emailAddress: 'peter@gmail.com',
            firstName: 'Peter',
            lastName: 'Smith',
            providerUserId: '112567347150540108741',
            providerSlug: () => 'google',
            providerTitle: () => 'Google',
          } as ExternalAccountResource,
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

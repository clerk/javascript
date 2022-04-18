import { render, renderJSON, screen, userEvent } from '@clerk/shared/testUtils';
import type { ExternalAccountResource, UserResource } from '@clerk/types';
import React from 'react';

import { ConnectedAccountDetail } from './ConnectedAccountDetail';

const mockFacebookDestroy = jest.fn();
const mockGoogleDestroy = jest.fn();
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
            identificationId: 'ident_fb',
            provider: 'facebook',
            approvedScopes: 'email',
            avatarUrl: 'http://images.clerktest.host/avatar.png',
            emailAddress: 'peter@gmail.com',
            firstName: 'Peter',
            lastName: 'Smith',
            providerUserId: '10147951078263327',
            publicMetadata: {},
            verification: null,
            destroy: mockFacebookDestroy,
            providerSlug: () => 'facebook',
            providerTitle: () => 'Facebook',
          } as ExternalAccountResource,
          {
            id: 'gac_swag',
            identificationId: 'ident_google',
            provider: 'google',
            approvedScopes:
              'email https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid profile',
            avatarUrl: 'http://images.clerktest.host/avatar.png',
            emailAddress: 'peter@gmail.com',
            firstName: 'Peter',
            lastName: 'Smith',
            providerUserId: '112567347150540108741',
            publicMetadata: {},
            verification: null,
            destroy: mockGoogleDestroy,
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

const mockNavigate = jest.fn();
jest.mock('ui/hooks', () => ({
  useNavigate: jest.fn(() => {
    return {
      navigate: mockNavigate,
    };
  }),
}));

describe('<ConnectedAccountDetail/>', () => {
  it('Connected Account Detail renders Google account', () => {
    const tree = renderJSON(<ConnectedAccountDetail />);
    expect(tree).toMatchSnapshot();
  });

  it('Disconnect Google Connected Account', () => {
    render(<ConnectedAccountDetail />);

    userEvent.click(screen.getByText('Disconnect'));
    userEvent.click(screen.getByText('Remove external account', { selector: 'button' }));
    expect(mockGoogleDestroy).toHaveBeenCalled();
  });
});

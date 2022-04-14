import { renderJSON } from '@clerk/shared/testUtils';
import { EmailAddressResource, EnvironmentResource, UserResource } from '@clerk/types';
import React from 'react';
import { PartialDeep } from 'type-fest';
import { AddNewEmail } from './AddNewEmail';

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
        params: { email_address_id: '1' },
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

jest.mock('ui/contexts/CoreUserContext', () => {
  return {
    useCoreUser: (): Partial<UserResource> => {
      return {
        primaryEmailAddressId: '1',
        emailAddresses: [
          {
            id: '1',
            email_address: 'clerk1@clerk.dev',
            verification: { status: 'verified' },
            linkedTo: [],
          } as any as EmailAddressResource,
        ],
      };
    },
  };
});

jest.mock('ui/contexts/EnvironmentContext', () => {
  return {
    useEnvironment: jest.fn(
      () =>
        ({
          userSettings: {
            attributes: {
              email_address: {
                enabled: true,
                verifications: ['email_link'],
              },
            },
          },
        } as PartialDeep<EnvironmentResource>),
    ),
  };
});

describe('<AddNewEmail/>', () => {
  it('renders the AddNewEmail', async () => {
    const tree = renderJSON(<AddNewEmail />);
    expect(tree).toMatchSnapshot();
  });
});

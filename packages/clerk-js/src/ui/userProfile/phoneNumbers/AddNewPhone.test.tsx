import { renderJSON } from '@clerk/shared/testUtils';
import { PhoneNumberResource, UserResource } from '@clerk/types';
import React from 'react';

import { AddNewPhone } from './AddNewPhone';

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
        primaryPhoneNumberId: '1',
        phoneNumbers: [
          {
            id: '1',
            phoneNumber: '1234',
            verification: { status: 'verified' },
            linkedTo: [],
          } as any as PhoneNumberResource,
        ],
      };
    },
  };
});

describe('<AddNewPhone/>', () => {
  it('renders the AddNewPhone', async () => {
    const tree = renderJSON(<AddNewPhone />);
    expect(tree).toMatchSnapshot();
  });
});

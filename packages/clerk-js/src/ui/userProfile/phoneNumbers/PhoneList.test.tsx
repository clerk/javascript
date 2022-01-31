import { PhoneNumberResource, UserResource } from '@clerk/types';
import React from 'react';
import { renderJSON } from '@clerk/shared/testUtils';
import { PhoneList } from './PhoneList';

jest.mock('ui/router/RouteContext');

jest.mock('ui/contexts/CoreUserContext', () => {
  return {
    useCoreUser: (): Partial<UserResource> => {
      return {
        primaryEmailAddressId: '1',
        phoneNumbers: [
          {
            id: '1',
            phoneNumber: '1234',
            verification: { status: 'verified' },
            linkedTo: [],
          } as any as PhoneNumberResource,
          {
            id: '21',
            phoneNumber: '123',
            verification: { status: 'verified' },
            linkedTo: [],
          } as any as PhoneNumberResource,
        ],
      };
    },
  };
});

describe('<PhoneList/>', () => {
  it('renders the list', async () => {
    const tree = renderJSON(<PhoneList />);
    expect(tree).toMatchSnapshot();
  });
});

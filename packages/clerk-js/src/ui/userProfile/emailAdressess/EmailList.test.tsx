import { renderJSON } from '@clerk/shared/testUtils';
import { EmailAddressResource, UserResource } from '@clerk/types';
import React from 'react';

import { EmailList } from './EmailList';

jest.mock('ui/router/RouteContext');

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
          {
            id: '21',
            email_address: 'clerk2@clerk.dev',
            verification: { status: 'verified' },
            linkedTo: [],
          } as any as EmailAddressResource,
        ],
      };
    },
  };
});

describe('<EmailList/>', () => {
  it('renders the list', async () => {
    const tree = renderJSON(<EmailList />);
    expect(tree).toMatchSnapshot();
  });
});

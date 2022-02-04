import { renderJSON } from '@clerk/shared/testUtils';
import { PhoneNumberResource, UserResource } from '@clerk/types';
import * as React from 'react';

import { ActiveMethodsCard } from './ActiveMethodsCard';

jest.mock('ui/contexts/CoreUserContext', () => {
  return {
    useCoreUser: (): Partial<UserResource> => {
      return {
        twoFactorEnabled: () => true,
        phoneNumbers: [
          {
            id: '1',
            phoneNumber: '123123',
            verification: { status: 'verified' },
            reservedForSecondFactor: true,
          },
        ] as PhoneNumberResource[],
      };
    },
  };
});

it('renders the active methods card', () => {
  const tree = renderJSON(<ActiveMethodsCard />);
  expect(tree).toMatchSnapshot();
});

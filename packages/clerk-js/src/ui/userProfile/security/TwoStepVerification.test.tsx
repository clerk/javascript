import { renderJSON } from '@clerk/shared/testUtils';
import { PhoneNumberResource, UserResource } from '@clerk/types';
import * as React from 'react';

import { TwoStepVerification } from './TwoStepVerification';

jest.mock('ui/router/RouteContext');

jest.mock('ui/hooks', () => ({
  useNavigate: () => {
    return {
      navigate: jest.fn(),
    };
  },
}));

jest.mock('ui/contexts/CoreUserContext', () => {
  return {
    useCoreUser: (): Partial<UserResource> => {
      return {
        twoFactorEnabled: true,
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

it('renders <TwoStepVerification/>', () => {
  const tree = renderJSON(<TwoStepVerification />);
  expect(tree).toMatchSnapshot();
});

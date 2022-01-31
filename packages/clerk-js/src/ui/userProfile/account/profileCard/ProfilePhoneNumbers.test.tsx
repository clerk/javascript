import * as React from 'react';
import { ProfilePhoneNumbers } from './ProfilePhoneNumbers';
import { renderJSON } from '@clerk/shared/testUtils';
import { PhoneNumberResource, UserResource } from '@clerk/types';

const mockNavigate = jest.fn();
jest.mock('ui/hooks', () => ({
  useNavigate: jest.fn(() => {
    return {
      navigate: mockNavigate,
    };
  }),
}));

const mockIdentIsPrimary = jest.fn();
jest.mock('ui/contexts/CoreUserContext', () => {
  return {
    useCoreUser: (): Partial<UserResource> => {
      return {
        isPrimaryIdentification: mockIdentIsPrimary,
        phoneNumbers: [
          {
            id: '1',
            phoneNumber: '1234',
            verification: { status: 'verified' },
          } as any as PhoneNumberResource,
          {
            id: '2',
            phoneNumber: '5678',
            verification: { status: 'unverified' },
          } as any as PhoneNumberResource,
        ],
      };
    },
  };
});

describe('<ProfilePhoneNumbers/>', () => {
  it('renders the ProfilePhoneNumbers', () => {
    mockIdentIsPrimary.mockImplementationOnce(() => true);
    const tree = renderJSON(<ProfilePhoneNumbers />);
    expect(tree).toMatchSnapshot();
  });
});

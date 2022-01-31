import * as React from 'react';
import { ProfileEmailAddresses } from './ProfileEmailAddresses';
import { renderJSON } from '@clerk/shared/testUtils';
import { EmailAddressResource, UserResource } from '@clerk/types';

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
        emailAddresses: [
          {
            id: 1,
            emailAddress: 'clerk@clerk.dev',
            verification: { status: 'verified' },
          } as any as EmailAddressResource,
          {
            id: 2,
            emailAddress: 'clerk-unverified@clerk.dev',
            verification: { status: 'unverified' },
          } as any as EmailAddressResource,
        ],
      };
    },
  };
});

describe('<ProfileEmailAddresses/>', () => {
  it('renders the ProfileEmailAddresses', () => {
    mockIdentIsPrimary.mockImplementationOnce(() => true);
    const tree = renderJSON(<ProfileEmailAddresses />);
    expect(tree).toMatchSnapshot();
  });
});

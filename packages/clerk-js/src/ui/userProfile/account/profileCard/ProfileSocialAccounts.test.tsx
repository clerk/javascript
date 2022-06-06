import { renderJSON } from '@clerk/shared/testUtils';
import { ExternalAccountResource, UserResource } from '@clerk/types';
import * as React from 'react';

import { ProfileSocialAccounts } from './ProfileSocialAccounts';

const mockVerifiedExternalAccount = {
  id: '1',
  provider: 'google',
  emailAddress: 'clerk@clerk.dev',
  verification: { status: 'verified' },
  providerTitle: () => 'Google',
} as ExternalAccountResource;

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
        externalAccounts: [mockVerifiedExternalAccount],
        verifiedExternalAccounts: [mockVerifiedExternalAccount],
      };
    },
  };
});

describe('<ProfileSocialAccounts/>', () => {
  it('renders the ProfileSocialAccounts', () => {
    mockIdentIsPrimary.mockImplementationOnce(() => true);
    const tree = renderJSON(<ProfileSocialAccounts />);
    expect(tree).toMatchSnapshot();
  });
});

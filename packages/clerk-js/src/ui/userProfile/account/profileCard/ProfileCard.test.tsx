import { renderJSON } from '@clerk/shared/testUtils';
import { EmailAddressResource, UserResource } from '@clerk/types';
import * as React from 'react';

import { ProfileCard } from './ProfileCard';

jest.mock('ui/hooks', () => {
  return {
    useNavigate: () => ({ navigate: jest.fn() }),
  };
});

jest.mock('ui/contexts', () => {
  return {
    useEnvironment: () => ({
      displayConfig: {},
      userSettings: {
        attributes: {
          email_address: {
            enabled: true
          },
          phone_number: {
            enabled: true
          },
          username: {
            enabled: false
          },
        }
      }
    }),
    useCoreUser: (): Partial<UserResource> => {
      return {
        isPrimaryIdentification: jest.fn(() => true),
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
        phoneNumbers: [],
        externalAccounts: [],
      };
    },
    useCoreClerk: jest.fn(),
  };
});

describe('<ProfileCard/>', () => {
  it('renders the ProfileCard', () => {
    const tree = renderJSON(<ProfileCard />);
    expect(tree).toMatchSnapshot();
  });
});

import { render, screen } from '@clerk/shared/testUtils';
import type { UserResource, UserSettingsResource } from '@clerk/types';
import React from 'react';

import { Account } from './Account';

const mockEnvironment = jest.fn();

jest.mock('ui/contexts', () => {
  return {
    // @ts-ignore 2698
    // ...jest.requireActual('ui/contexts'),
    useEnvironment: () => ({
      ...mockEnvironment(),
      displayConfig: {},
    }),
    // @ts-ignore 2352
    useCoreUser: () => ({ externalAccounts: [] } as UserResource),
    useCoreClerk: jest.fn(),
  };
});

jest.mock('ui/hooks', () => {
  return {
    useNavigate: () => ({ navigate: jest.fn() }),
  };
});

const OTHER_ATTRIBUTES = {
  username: {
    enabled: false,
  },
  email_address: {
    enabled: false,
  },
  phone_number: {
    enabled: false,
  },
  web3_wallet: {
    enabled: false,
  },
};

describe('<Account/>', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders personal information for auth config that requires name', () => {
    mockEnvironment.mockImplementation(() => {
      return {
        userSettings: {
          attributes: {
            first_name: {
              enabled: true,
              required: true,
            },
            last_name: {
              enabled: false,
            },
            ...OTHER_ATTRIBUTES,
          },
        } as UserSettingsResource,
      };
    });
    render(<Account />);
    expect(screen.getByText('Personal information')).toBeInTheDocument();
  });

  it('renders personal information for auth config that has name turned on', () => {
    mockEnvironment.mockImplementation(() => {
      return {
        userSettings: {
          attributes: {
            last_name: {
              enabled: true,
            },
            first_name: {
              enabled: false,
            },
            ...OTHER_ATTRIBUTES,
          },
        } as UserSettingsResource,
      };
    });
    render(<Account />);
    expect(screen.getByText('Personal information')).toBeInTheDocument();
  });

  it('does not render personal information for auth config that has named turned off', () => {
    mockEnvironment.mockImplementation(() => {
      return {
        userSettings: {
          attributes: {
            first_name: {
              enabled: false,
            },
            last_name: {
              enabled: false,
            },
            ...OTHER_ATTRIBUTES,
          },
        } as UserSettingsResource,
      };
    });
    render(<Account />);
    expect(screen.queryByText('Personal information')).not.toBeInTheDocument();
  });
});

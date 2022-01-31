import React from 'react';
import { Account } from './Account';
import { render, screen } from '@clerk/shared/testUtils';
import type { AuthConfigResource, UserResource } from '@clerk/types';

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

describe('<Account/>', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders personal information for auth config that requires name', () => {
    mockEnvironment.mockImplementation(() => {
      return {
        authConfig: {
          firstName: 'required',
        } as AuthConfigResource,
      };
    });
    render(<Account />);
    expect(screen.getByText('Personal information')).toBeInTheDocument();
  });

  it('renders personal information for auth config that has name turned on', () => {
    mockEnvironment.mockImplementation(() => {
      return {
        authConfig: {
          lastName: 'on',
        } as AuthConfigResource,
      };
    });
    render(<Account />);
    expect(screen.getByText('Personal information')).toBeInTheDocument();
  });

  it('does not render personal information for auth config that has named turned off', () => {
    mockEnvironment.mockImplementation(() => {
      return {
        authConfig: {
          firstName: 'off',
          lastName: 'off',
        } as AuthConfigResource,
      };
    });
    render(<Account />);
    expect(screen.queryByText('Personal information')).not.toBeInTheDocument();
  });
});

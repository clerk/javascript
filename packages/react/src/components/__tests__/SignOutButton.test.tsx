import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { SignOutButton } from '../SignOutButton';

const mockSignOut = jest.fn();
const originalError = console.error;

const mockClerk = {
  signOut: mockSignOut,
} as any;

jest.mock('../withClerk', () => {
  return {
    withClerk: (Component: any) => (props: any) => {
      return (
        <Component
          {...props}
          clerk={mockClerk}
        />
      );
    },
  };
});

const url = 'https://www.clerk.com';

describe('<SignOutButton />', () => {
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    mockSignOut.mockReset();
  });

  it('calls clerk.signOutOne when clicked', async () => {
    render(<SignOutButton />);
    const btn = screen.getByText('Sign out');
    userEvent.click(btn);
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  it('handles redirectUrl prop', async () => {
    render(<SignOutButton redirectUrl={url} />);
    const btn = screen.getByText('Sign out');
    userEvent.click(btn);
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledWith({ redirectUrl: url });
    });
  });

  it('handles signOutOptions prop', async () => {
    render(<SignOutButton signOutOptions={{ redirectUrl: url, sessionId: 'sess_1yDceUR8SIKtQ0gIOO8fNsW7nhe' }} />);
    const btn = screen.getByText('Sign out');
    userEvent.click(btn);
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledWith({ redirectUrl: url, sessionId: 'sess_1yDceUR8SIKtQ0gIOO8fNsW7nhe' });
    });
  });

  it('uses text passed as children', async () => {
    render(<SignOutButton>text</SignOutButton>);
    screen.getByText('text');
  });

  it('throws if multiple children provided', async () => {
    expect(() => {
      render(
        <SignOutButton>
          <button>1</button>
          <button>2</button>
        </SignOutButton>,
      );
    }).toThrow();
  });
});

import { render, screen, waitFor } from '@clerk/shared/testUtils';
import { userEvent } from '@clerk/shared/utils/testUtils';
import React from 'react';

import { SignOutButton } from './SignOutButton';

const mockSignOutOne = jest.fn();
const originalError = console.error;

const mockClerk = {
  signOutOne: mockSignOutOne,
} as any;

jest.mock('../contexts', () => {
  return {
    withClerk: (Component: any) => (props: any) => {
      return <Component {...props} clerk={mockClerk} />;
    },
  };
});

describe('<SignOutButton />', () => {
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    mockSignOutOne.mockReset();
  });

  it('calls clerk.signOutOne when clicked', async () => {
    render(<SignOutButton />);
    const btn = screen.getByText('Sign out');
    userEvent.click(btn);
    await waitFor(() => {
      expect(mockSignOutOne).toHaveBeenCalled();
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

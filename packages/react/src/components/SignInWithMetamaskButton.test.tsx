/* eslint-disable react/display-name */

import { render, screen, userEvent, waitFor } from '@clerk/shared/utils/testUtils';
import React from 'react';

import { SignInWithMetamaskButton } from './SignInWithMetamaskButton';

const mockAuthenticatewithMetamask = jest.fn();
const originalError = console.error;

const mockClerk = {
  authenticateWithMetamask: mockAuthenticatewithMetamask,
} as any;

jest.mock('./withClerk', () => {
  return {
    withClerk: (Component: any) => (props: any) =>
      (
        <Component
          {...props}
          clerk={mockClerk}
        />
      ),
  };
});

describe('<SignInWithMetamaskButton/>', () => {
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    mockAuthenticatewithMetamask.mockReset();
  });

  it('calls clerk.authenticateWithMetamask when clicked', async () => {
    render(<SignInWithMetamaskButton />);
    const btn = screen.getByText('Sign in with Metamask');
    userEvent.click(btn);
    await waitFor(() => {
      expect(mockAuthenticatewithMetamask).toHaveBeenCalled();
    });
  });

  it('uses text passed as children', async () => {
    render(<SignInWithMetamaskButton>text</SignInWithMetamaskButton>);
    screen.getByText('text');
  });

  it('throws if multiple children provided', async () => {
    expect(() => {
      render(
        <SignInWithMetamaskButton>
          <button>1</button>
          <button>2</button>
        </SignInWithMetamaskButton>,
      );
    }).toThrow();
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { SignInWithMetamaskButton } from '../SignInWithMetamaskButton';

const mockAuthenticatewithMetamask = vi.fn();
const originalError = console.error;

const mockClerk = {
  authenticateWithMetamask: mockAuthenticatewithMetamask,
} as any;

vi.mock('../withClerk', () => {
  return {
    withClerk: (Component: any) => (props: any) => (
      <Component
        {...props}
        clerk={mockClerk}
      />
    ),
  };
});

describe('<SignInWithMetamaskButton/>', () => {
  beforeAll(() => {
    console.error = vi.fn();
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
    await userEvent.click(btn);

    await waitFor(() => {
      expect(mockAuthenticatewithMetamask).toHaveBeenCalled();
    });
  });

  it('uses text passed as children', () => {
    render(<SignInWithMetamaskButton>text</SignInWithMetamaskButton>);
    screen.getByText('text');
  });

  it('throws if multiple children provided', () => {
    expect(() => {
      render(
        <SignInWithMetamaskButton>
          <button type='button'>1</button>
          <button type='button'>2</button>
        </SignInWithMetamaskButton>,
      );
    }).toThrow();
  });
});

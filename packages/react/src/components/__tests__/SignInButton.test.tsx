import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { SignInButton } from '../SignInButton';

const mockRedirectToSignIn = vi.fn();
const originalError = console.error;

const mockClerk = {
  redirectToSignIn: mockRedirectToSignIn,
} as any;

vi.mock('../withClerk', () => {
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

describe('<SignInButton/>', () => {
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    mockRedirectToSignIn.mockReset();
  });

  it('calls clerk.redirectToSignIn when clicked', async () => {
    render(<SignInButton />);
    const btn = screen.getByText('Sign in');
    await userEvent.click(btn);
    expect(mockRedirectToSignIn).toHaveBeenCalled();
  });

  it('handles forceRedirectUrl prop', async () => {
    render(<SignInButton forceRedirectUrl={url} />);

    const btn = screen.getByText('Sign in');
    await userEvent.click(btn);

    expect(mockRedirectToSignIn).toHaveBeenCalledWith({ forceRedirectUrl: url, signInForceRedirectUrl: url });
  });

  it('handles fallbackRedirectUrl prop', async () => {
    render(<SignInButton fallbackRedirectUrl={url} />);

    const btn = screen.getByText('Sign in');
    await userEvent.click(btn);

    expect(mockRedirectToSignIn).toHaveBeenCalledWith({
      fallbackRedirectUrl: url,
      signInFallbackRedirectUrl: url,
    });
  });

  it('renders passed button and calls both click handlers', async () => {
    const handler = vi.fn();

    render(
      <SignInButton>
        <button
          onClick={handler}
          type='button'
        >
          custom button
        </button>
      </SignInButton>,
    );

    const btn = screen.getByText('custom button');
    await userEvent.click(btn);

    expect(handler).toHaveBeenCalled();
    expect(mockRedirectToSignIn).toHaveBeenCalled();
  });

  it('uses text passed as children', async () => {
    render(<SignInButton>text</SignInButton>);

    await screen.findByText('text');
  });

  it('throws if multiple children provided', () => {
    expect(() => {
      render(
        <SignInButton>
          <button type='button'>1</button>
          <button type='button'>2</button>
        </SignInButton>,
      );
    }).toThrow();
  });

  it('does not pass appearance prop to child element', () => {
    const { container } = render(
      <SignInButton
        mode='modal'
        appearance={{ elements: { rootBox: 'test' } }}
      >
        <button type='button'>Sign in</button>
      </SignInButton>,
    );

    const button = container.querySelector('button');
    expect(button?.hasAttribute('appearance')).toBe(false);
  });
});

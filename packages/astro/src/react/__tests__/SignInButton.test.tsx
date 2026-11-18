import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as UtilsModule from '../utils';

const mockRedirectToSignIn = vi.fn();
const originalError = console.error;

const mockClerk = {
  redirectToSignIn: mockRedirectToSignIn,
} as any;

vi.mock('../utils', async importActual => {
  const actual = await importActual<typeof UtilsModule>();
  return {
    ...actual,
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

const { SignInButton } = await import('../SignInButton');

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

  afterEach(() => {
    cleanup();
  });

  it('renders the default button and calls clerk.redirectToSignIn when clicked', async () => {
    render(<SignInButton />);
    const btn = screen.getByText('Sign in');
    await userEvent.click(btn);
    expect(mockRedirectToSignIn).toHaveBeenCalled();
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

  it('accepts a single child passed as an array', async () => {
    const handler = vi.fn();

    render(
      <SignInButton>
        {[
          <button
            key='custom'
            onClick={handler}
            type='button'
          >
            custom button
          </button>,
        ]}
      </SignInButton>,
    );

    const btn = screen.getByText('custom button');
    await userEvent.click(btn);

    expect(handler).toHaveBeenCalled();
    expect(mockRedirectToSignIn).toHaveBeenCalled();
  });
});

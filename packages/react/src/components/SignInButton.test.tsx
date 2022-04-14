import { render, screen, userEvent, waitFor } from '@clerk/shared/utils/testUtils';
import React from 'react';

import { SignInButton } from './SignInButton';

const mockRedirectToSignIn = jest.fn();
const originalError = console.error;

const mockClerk = {
  redirectToSignIn: mockRedirectToSignIn,
} as any;

jest.mock('./withClerk', () => {
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

const url = 'https://www.clerk.dev';

describe('<SignInButton/>', () => {
  beforeAll(() => {
    console.error = jest.fn();
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
    userEvent.click(btn);
    await waitFor(() => {
      expect(mockRedirectToSignIn).toHaveBeenCalled();
    });
  });

  it('handles redirectUrl prop', async () => {
    render(<SignInButton redirectUrl={url} />);
    const btn = screen.getByText('Sign in');
    userEvent.click(btn);
    await waitFor(() => {
      expect(mockRedirectToSignIn).toHaveBeenCalledWith({ redirectUrl: url });
    });
  });

  it('handles afterSignInUrl prop', async () => {
    render(<SignInButton afterSignInUrl={url} />);
    const btn = screen.getByText('Sign in');
    userEvent.click(btn);
    await waitFor(() => {
      expect(mockRedirectToSignIn).toHaveBeenCalledWith({
        afterSignInUrl: url,
      });
    });
  });

  it('handles afterSignUpUrl prop', async () => {
    render(<SignInButton afterSignUpUrl={url} />);
    const btn = screen.getByText('Sign in');
    userEvent.click(btn);
    await waitFor(() => {
      expect(mockRedirectToSignIn).toHaveBeenCalledWith({
        afterSignUpUrl: url,
      });
    });
  });

  it('renders passed button and calls both click handlers', async () => {
    const handler = jest.fn();
    render(
      <SignInButton>
        <button onClick={handler}>custom button</button>
      </SignInButton>,
    );
    const btn = screen.getByText('custom button');
    userEvent.click(btn);
    await waitFor(() => {
      expect(handler).toHaveBeenCalled();
      expect(mockRedirectToSignIn).toHaveBeenCalled();
    });
  });

  it('uses text passed as children', async () => {
    render(<SignInButton>text</SignInButton>);
    screen.getByText('text');
  });

  it('throws if multiple children provided', async () => {
    expect(() => {
      render(
        <SignInButton>
          <button>1</button>
          <button>2</button>
        </SignInButton>,
      );
    }).toThrow();
  });
});

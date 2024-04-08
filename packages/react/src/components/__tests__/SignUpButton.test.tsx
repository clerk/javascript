import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { SignUpButton } from '../SignUpButton';

const mockRedirectToSignUp = jest.fn();
const originalError = console.error;

const mockClerk = {
  redirectToSignUp: mockRedirectToSignUp,
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

describe('<SignUpButton/>', () => {
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    mockRedirectToSignUp.mockReset();
  });

  it('calls clerk.redirectToSignUp when clicked', async () => {
    render(<SignUpButton />);
    const btn = screen.getByText('Sign up');
    userEvent.click(btn);
    await waitFor(() => {
      expect(mockRedirectToSignUp).toHaveBeenCalled();
    });
  });

  it('handles forceRedirectUrl prop', async () => {
    render(<SignUpButton forceRedirectUrl={url} />);
    const btn = screen.getByText('Sign up');
    userEvent.click(btn);
    await waitFor(() => {
      expect(mockRedirectToSignUp).toHaveBeenCalledWith({ forceRedirectUrl: url });
    });
  });

  it('handles forceRedirectUrl prop', async () => {
    render(<SignUpButton forceRedirectUrl={url} />);
    const btn = screen.getByText('Sign up');
    userEvent.click(btn);
    await waitFor(() => {
      expect(mockRedirectToSignUp).toHaveBeenCalledWith({
        forceRedirectUrl: url,
      });
    });
  });

  it('handles forceRedirectUrl prop', async () => {
    render(<SignUpButton forceRedirectUrl={url} />);
    const btn = screen.getByText('Sign up');
    userEvent.click(btn);
    await waitFor(() => {
      expect(mockRedirectToSignUp).toHaveBeenCalledWith({
        forceRedirectUrl: url,
      });
    });
  });

  it('renders passed button and calls both click handlers', async () => {
    const handler = jest.fn();
    render(
      <SignUpButton>
        <button onClick={handler}>custom button</button>
      </SignUpButton>,
    );
    const btn = screen.getByText('custom button');
    userEvent.click(btn);
    await waitFor(() => {
      expect(handler).toHaveBeenCalled();
      expect(mockRedirectToSignUp).toHaveBeenCalled();
    });
  });

  it('uses text passed as children', async () => {
    render(<SignUpButton>text</SignUpButton>);
    screen.getByText('text');
  });

  it('throws if multiple children provided', async () => {
    expect(() => {
      render(
        <SignUpButton>
          <button>1</button>
          <button>2</button>
        </SignUpButton>,
      );
    }).toThrow();
  });
});

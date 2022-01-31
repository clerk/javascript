import React from 'react';
import { render, renderJSON, screen, userEvent } from '@clerk/shared/testUtils';
import { All } from './All';
import { Session } from 'core/resources';
import { SignInFactor } from '@clerk/types';

jest.mock('ui/contexts', () => {
  return {
    useCoreSignIn: jest.fn(),
    useCoreClerk: jest.fn(() => ({
      Clerk: {
        frontendAPI: 'clerk.clerk.dev',
      },
    })),
    useEnvironment: jest.fn(() => ({
      displayConfig: {
        theme: {
          general: {
            color: '#000000',
          },
        },
        preferred_sign_in_strategy: 'otp',
      },
    })),
    useSignInContext: () => {
      return {
        signUpUrl: 'http://testurl',
        navigateAfterSignIn: jest.fn(),
      };
    },
    useCoreSession: () => {
      return {
        id: 'sess_id',
      } as Partial<Session>;
    },
  };
});

describe('<All/>', () => {
  const factors: SignInFactor[] = [
    {
      strategy: 'password',
    },
    {
      strategy: 'oauth_google',
    },
    {
      strategy: 'oauth_facebook',
    },
    {
      strategy: 'email_code',
      safe_identifier: 'j***@e*****.com',
      email_address_id: '123',
    },
    {
      strategy: 'phone_code',
      safe_identifier: '+1*********9',
      phone_number_id: '456',
    },
    {
      strategy: 'email_link',
      safe_identifier: '+1*********9',
      email_address_id: '456',
    },
  ];

  it('renders the All sign in methods', async () => {
    const tree = renderJSON(<All factors={factors} selectFactor={jest.fn()} />);
    expect(tree).toMatchSnapshot();
  });

  it('triggers selectStrategy callback on click', async () => {
    const mockSelectStrategy = jest.fn();
    render(<All factors={factors} selectFactor={mockSelectStrategy} />);

    userEvent.click(screen.getByText('Sign in with your password'));
    userEvent.click(screen.getByText('Email code to j***@e*****.com'));
    userEvent.click(screen.getByText('Send code to +1*********9'));

    expect(mockSelectStrategy).toHaveBeenCalledTimes(3);
  });
});

import { render, renderJSON, screen, userEvent } from '@clerk/shared/testUtils';
import { SignInFactor } from '@clerk/types';
import { Session } from 'core/resources';
import React from 'react';

const mockUseOptions = jest.fn(() => ({}));

import { All } from './All';

jest.mock('ui/contexts', () => {
  return {
    useCoreSignIn: jest.fn(),
    useCoreClerk: jest.fn(() => ({
      Clerk: {
        frontendAPI: 'clerk.clerk.dev',
      },
    })),
    useOptions: mockUseOptions,
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
      safeIdentifier: 'j***@e*****.com',
      emailAddressId: '123',
    },
    {
      strategy: 'phone_code',
      safeIdentifier: '+1*********9',
      phoneNumberId: '456',
    },
    {
      strategy: 'email_link',
      safeIdentifier: '+1*********9',
      emailAddressId: '456',
    },
  ];

  it('renders the All sign in methods', () => {
    const tree = renderJSON(
      <All
        factors={factors}
        selectFactor={jest.fn()}
      />,
    );
    expect(tree).toMatchSnapshot();
  });

  it('renders the All sign in methods with custom support email', () => {
    mockUseOptions.mockImplementationOnce(() => ({ supportEmail: 'test@test.com' }));
    const tree = renderJSON(
      <All
        factors={factors}
        selectFactor={jest.fn()}
      />,
    );
    expect(tree).toMatchSnapshot();
  });

  it('triggers selectStrategy callback on click', async () => {
    const mockSelectStrategy = jest.fn();
    render(
      <All
        factors={factors}
        selectFactor={mockSelectStrategy}
      />,
    );

    await userEvent.click(screen.getByText('Sign in with your password'));
    await userEvent.click(screen.getByText('Email code to j***@e*****.com'));
    await userEvent.click(screen.getByText('Send code to +1*********9'));

    expect(mockSelectStrategy).toHaveBeenCalledTimes(3);
  });
});

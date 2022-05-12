import { render, renderJSON, screen, userEvent, waitFor } from '@clerk/shared/testUtils';
import React from 'react';

import { SignInFactorTwo } from './SignInFactorTwo';

const mockSetActive = jest.fn().mockReturnValue({
  status: 'complete',
});
const mockFactorOneAttempt = jest.fn();

jest.mock('ui/router/RouteContext');

jest.mock('ui/hooks', () => ({
  useNavigate: jest.fn(() => {
    return {
      navigate: jest.fn(),
    };
  }),
}));

jest.mock('ui/contexts', () => {
  return {
    useCoreSession: jest.fn(),
    useSignInContext: () => {
      return {
        signUpUrl: 'http://testurl',
        navigateAfterSignIn: jest.fn(),
      };
    },
    useEnvironment: jest.fn(() => ({
      authConfig: { singleSessionMode: false },
      displayConfig: {
        theme: {
          general: {
            color: '#000000',
          },
        },
      },
    })),
    useCoreSignIn: () => ({
      status: 'needs_second_factor',
      supportedSecondFactors: [
        {
          strategy: 'phone_code',
          safeIdentifier: '+1********9',
        },
      ],
      secondFactorVerification: {
        status: 'ok',
      },
      attemptSecondFactor: mockFactorOneAttempt.mockReturnValueOnce({
        status: 'complete',
      }),
      attemptFirstFactor: mockFactorOneAttempt.mockReturnValueOnce({
        status: 'complete',
      }),
      prepareSecondFactor: jest.fn(() => Promise.resolve()),
    }),
    useCoreClerk: () => ({
      setActive: mockSetActive,
    }),
  };
});

describe('<SignInFactorTwo/>', () => {
  it('renders the factorTWO snapshot', async () => {
    const tree = renderJSON(<SignInFactorTwo />);
    expect(tree).toMatchSnapshot();
  });

  it('renders the factorTWO screen and enters a code', async () => {
    render(<SignInFactorTwo />);

    const text = '123456';
    const inputs = screen.getAllByRole('textbox');
    for (const [i, input] of inputs.entries()) {
      await userEvent.type(input, text[i]);
    }

    await waitFor(() => {
      expect(mockSetActive).toHaveBeenCalledTimes(1);
    });
  });
});

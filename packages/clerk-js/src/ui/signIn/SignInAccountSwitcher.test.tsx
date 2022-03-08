import { renderJSON } from '@clerk/shared/testUtils';
import { Session } from 'core/resources';
import React from 'react';

import { SignInAccountSwitcher } from './SignInAccountSwitcher';

const navigateMock = jest.fn();
const mockCreateRequest = jest.fn();

const mockFactorOneAttempt = jest.fn();
const mockSetSession = jest.fn().mockReturnValue({
  status: 'complete',
});

jest.mock('ui/contexts', () => {
  return {
    useCoreSession: () => {
      return {
        id: 'sess_id',
      } as Partial<Session>;
    },
    useEnvironment: jest.fn(() => ({
      displayConfig: {
        theme: {
          general: {
            color: '#000000',
          },
        },
      },
      authConfig: {
        singleSessionMode: false,
      },
    })),
    useSignInContext: () => {
      return {
        signUpUrl: 'http://testurl',
        navigateAfterSignIn: jest.fn(),
      };
    },

    useCoreSessionList: () => [
      {
        id: '1',
        user: {
          profileImg: 'https://www.imageurl.com',
          firstName: 'Peter',
          lastName: 'James',
          primaryEmailAddress: 'peter.smith@clerk.dev',
        },
      },
    ],
    withCoreUserGuard: (a: any) => a,
    useCoreClerk: () => {
      return {
        setSession: mockSetSession,
      };
    },
    useSignUpContext: () => {
      return {
        signInUrl: 'http://test.host/sign-in',
        navigateAfterSignUp: jest.fn(),
      };
    },
    useCoreSignIn: () => ({
      create: mockCreateRequest.mockReturnValueOnce({
        status: 'needs_first_factor',
        firstFactorVerification: { status: 'verified' },
      }),
      attemptFirstFactor: mockFactorOneAttempt.mockReturnValueOnce({
        status: 'complete',
      }),
    }),
  };
});

jest.mock('ui/router/RouteContext');

jest.mock('ui/hooks', () => ({
  useNavigate: () => {
    return {
      navigate: navigateMock,
    };
  },
}));

describe('<SignInAccountSwitcher/>', () => {
  it('takes a screenshot for the start screen', async () => {
    const tree = renderJSON(<SignInAccountSwitcher />);
    expect(tree).toMatchSnapshot();
  });
});

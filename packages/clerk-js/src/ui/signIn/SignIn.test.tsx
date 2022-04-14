import { render } from '@clerk/shared/testUtils';
import { EnvironmentResource } from '@clerk/types';
import { AuthConfig, DisplayConfig, Session } from 'core/resources/internal';
import React from 'react';
import { SignIn } from 'ui/signIn/SignIn';

const mockNavigate = jest.fn();

const mockSetSession = jest.fn().mockReturnValue({
  status: 'complete',
});

jest.mock('ui/router/RouteContext');

jest.mock('ui/contexts', () => {
  return {
    useCoreClerk: () => {
      return { redirectToSignIn: jest.fn() };
    },
    useSignInContext: () => {
      return {
        signUpUrl: 'http://testurl',
        navigateAfterSignIn: jest.fn(),
      };
    },
    useEnvironment: jest.fn(
      () =>
        ({
          displayConfig: {
            homeUrl: 'https://www.cnn.com',
          } as Partial<DisplayConfig>,
          authConfig: {
            singleSessionMode: true,
          } as Partial<AuthConfig>,
        } as Partial<EnvironmentResource>),
    ),
    useSignUpContext: jest.fn(),
    useClerk: () => {
      return {
        setSession: mockSetSession,
      };
    },
    withCoreSessionSwitchGuard: (a: any) => a,
    useCoreSession: () => {
      return {
        id: 'sess_id',
      } as Partial<Session>;
    },
  };
});

jest.mock('ui/hooks', () => ({
  useNavigate: () => {
    return {
      navigate: mockNavigate,
    };
  },
}));

describe('<SignIn/>', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when the user is already signed in and singleSessionMode is true', () => {
    it('does not redirect to after sign in url', () => {
      render(<SignIn />);
      expect(mockNavigate).not.toHaveBeenCalledWith('https://www.cnn.com');
    });
  });
});

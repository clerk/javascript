import { render } from '@clerk/shared/testUtils';
import { EnvironmentResource } from '@clerk/types';
import { AuthConfig, DisplayConfig, Session } from 'core/resources/internal';
import React from 'react';
import { SignUp } from 'ui/signUp/SignUp';

const mockNavigate = jest.fn();

jest.mock('ui/router/RouteContext');

const mockSetActive = jest.fn().mockReturnValue({
  status: 'complete',
});

jest.mock('ui/contexts', () => {
  return {
    useSignUpContext: () => {
      return {
        signInUrl: 'http://test.host/sign-in',
        navigateAfterSignUp: jest.fn(),
      };
    },
    useEnvironment: jest.fn(
      () =>
        ({
          displayConfig: {
            homeUrl: 'https://www.bbc.com',
          } as Partial<DisplayConfig>,
          authConfig: { singleSessionMode: true } as Partial<AuthConfig>,
        } as Partial<EnvironmentResource>),
    ),
    withCoreSessionSwitchGuard: (a: any) => a,
    useCoreSession: () =>
      ({
        id: 'sess_id',
      } as Partial<Session>),
    useCoreClerk: () => ({
      redirectToSignUp: jest.fn(),
      setActive: mockSetActive,
    }),
    useCoreSignIn: jest.fn(),
  };
});

jest.mock('ui/hooks', () => ({
  useNavigate: () => {
    return {
      navigate: mockNavigate,
    };
  },
}));

describe('<SignUp/>', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when the user is already signed in and singleSessionMode is true', () => {
    it('does not redirect to after sign in url', () => {
      render(<SignUp />);
      expect(mockNavigate).not.toHaveBeenCalledWith('https://www.bbc.com');
    });
  });
});

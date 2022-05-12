import { mocked, render, renderJSON, screen, userEvent, waitFor } from '@clerk/shared/testUtils';
import { titleize } from '@clerk/shared/utils/string';
import { EnvironmentResource, SignInResource, UserSettingsJSON, UserSettingsResource } from '@clerk/types';
import { ClerkAPIResponseError, UserSettings } from 'core/resources/internal';
import React from 'react';
import { useCoreSignIn } from 'ui/contexts';

import { SignInStart } from './SignInStart';

const mockNavigate = jest.fn();
const mockCreateRequest = jest.fn();
const mockAuthenticateWithRedirect = jest.fn();
const mockNavigateAfterSignIn = jest.fn();
let mockUserSettings: UserSettingsResource;

jest.mock('ui/router/RouteContext');

jest.mock('ui/contexts', () => {
  return {
    useCoreSession: jest.fn(),
    useSignInContext: () => {
      return {
        signUpUrl: 'http://test.host/signup',
        navigateAfterSignIn: mockNavigateAfterSignIn,
      };
    },
    useEnvironment: jest.fn(
      () =>
        ({
          displayConfig: {
            theme: {
              general: {
                color: '#000000',
              },
            },
            preferredSignInStrategy: 'otp',
            afterSignInUrl: 'http://test.host',
          },
          userSettings: mockUserSettings,
          authConfig: {
            password: 'required',
            singleSessionMode: false,
          },
        } as any as EnvironmentResource),
    ),
    useCoreSignIn: jest.fn(() => ({
      create: mockCreateRequest,
      attemptFirstFactor: mockFactorOneAttempt.mockReturnValueOnce({
        status: 'complete',
      }),
      authenticateWithRedirect: mockAuthenticateWithRedirect,
    })),
    useCoreClerk: jest.fn(() => ({
      setActive: mockSetActive,
    })),
    useOptions: jest.fn(() => ({ supportEmail: undefined })),
  };
});

const mockFactorOneAttempt = jest.fn();
const mockSetActive = jest.fn().mockReturnValue({
  status: 'complete',
});

jest.mock('ui/hooks', () => ({
  useNavigate: () => {
    return {
      navigate: mockNavigate,
    };
  },
}));

fdescribe('<SignInStart/>', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    mockUserSettings = new UserSettings({
      attributes: {
        email_address: {
          enabled: true,
          required: false,
          used_for_first_factor: true,
          first_factors: ['email_link'],
          used_for_second_factor: false,
          second_factors: [],
          verifications: ['email_link'],
          verify_at_sign_up: false,
        },
        password: {
          enabled: true,
          required: true,
        },
      },
      social: {
        oauth_google: {
          enabled: true,
          required: false,
          authenticatable: false,
          strategy: 'oauth_google',
        },
        oauth_facebook: {
          enabled: true,
          required: false,
          authenticatable: false,
          strategy: 'oauth_facebook',
        },
      },
    } as unknown as UserSettingsJSON);
  });

  describe('when user is not signed in', () => {
    beforeAll(() => {
      mockCreateRequest.mockReturnValue({
        status: 'needs_first_factor',
        firstFactorVerification: { status: 'verified' },
      });
    });

    it('renders the sign in start screen', () => {
      const tree = renderJSON(<SignInStart />);
      expect(tree).toMatchSnapshot();
    });

    it('renders the start screen, types the email and creates a sign in attempt', async () => {
      render(<SignInStart />);

      const inputField = screen.getByLabelText('Email address');
      await userEvent.type(inputField, 'boss@clerk.dev');

      const signEmailButton = screen.getByRole('button', { name: /Continue/i });
      await userEvent.click(signEmailButton);

      await waitFor(() => {
        expect(mockCreateRequest).toHaveBeenCalledTimes(1);
        expect(mockCreateRequest).toHaveBeenCalledWith({
          identifier: 'boss@clerk.dev',
        });
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('factor-one');
      });
    });

    it('renders the start screen, email and instant password are filled by pwd manager', async () => {
      const { container } = render(<SignInStart />);
      mockCreateRequest.mockReturnValueOnce({
        status: 'complete',
      });

      const instantPasswordField = container.querySelector('input#password') as HTMLInputElement;

      expect(instantPasswordField).toBeDefined();

      const inputField = screen.getByLabelText('Email address');
      await userEvent.type(inputField, 'boss@clerk.dev');

      // simulate password being filled by a pwd manager
      await userEvent.type(instantPasswordField, '123456');

      const signEmailButton = screen.getByRole('button', { name: /Continue/i });
      await userEvent.click(signEmailButton);

      await waitFor(() => {
        expect(mockCreateRequest).toHaveBeenCalledTimes(1);
        expect(mockCreateRequest).toHaveBeenCalledWith({
          identifier: 'boss@clerk.dev',
          password: '123456',
          strategy: 'password',
        });
        expect(mockSetActive).toHaveBeenCalledTimes(1);
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it('recovers from an invalid_strategy error when instant password is filled by a pwd manager', async () => {
      const { container } = render(<SignInStart />);
      mockCreateRequest
        .mockImplementationOnce(() => {
          throw new ClerkAPIResponseError('', {
            data: [
              {
                code: 'strategy_for_user_invalid',
                message: 'Invalid verification strategy',
              },
            ],
            status: 422,
          });
        })
        .mockImplementationOnce(() => ({
          status: 'needs_first_factor',
        }));

      const instantPasswordField = container.querySelector('input#password') as HTMLInputElement;

      expect(instantPasswordField).toBeDefined();

      const inputField = screen.getByLabelText('Email address');
      await userEvent.type(inputField, 'boss@clerk.dev');

      // simulate password being filled by a pwd manager
      await userEvent.type(instantPasswordField, 'wrong pass');

      const signEmailButton = screen.getByRole('button', { name: /Continue/i });
      await userEvent.click(signEmailButton);

      await waitFor(() => {
        expect(mockCreateRequest).toHaveBeenCalledTimes(2);
        // 1st call
        expect(mockCreateRequest).toHaveBeenCalledWith({
          identifier: 'boss@clerk.dev',
          password: 'wrong pass',
          strategy: 'password',
        });
        // 2nd call
        expect(mockCreateRequest).toHaveBeenCalledWith({
          identifier: 'boss@clerk.dev',
        });
        expect(mockSetActive).not.toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('factor-one');
      });
    });

    it('recovers from an incorrect instant password filled by a pwd manager', async () => {
      const { container } = render(<SignInStart />);
      mockCreateRequest
        .mockImplementationOnce(() => {
          throw new ClerkAPIResponseError('', {
            data: [
              {
                code: 'form_password_incorrect',
                message: 'Password is incorrect. Try again, or use another method.',
                meta: {
                  param_name: 'password',
                },
              },
            ],
            status: 422,
          });
        })
        .mockImplementationOnce(() => ({
          status: 'needs_first_factor',
        }));

      const instantPasswordField = container.querySelector('input#password') as HTMLInputElement;

      expect(instantPasswordField).toBeDefined();

      const inputField = screen.getByLabelText('Email address');
      await userEvent.type(inputField, 'boss@clerk.dev');

      // simulate password being filled by a pwd manager
      await userEvent.type(instantPasswordField, 'wrong pass');

      const signEmailButton = screen.getByRole('button', { name: /Continue/i });
      await userEvent.click(signEmailButton);

      await waitFor(() => {
        expect(mockCreateRequest).toHaveBeenCalledTimes(2);
        // 1st call
        expect(mockCreateRequest).toHaveBeenCalledWith({
          identifier: 'boss@clerk.dev',
          password: 'wrong pass',
          strategy: 'password',
        });
        // 2nd call
        expect(mockCreateRequest).toHaveBeenCalledWith({
          identifier: 'boss@clerk.dev',
        });
        expect(mockSetActive).not.toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('factor-one');
      });
    });

    it('does not render instant password is instance is passwordless', () => {
      mockUserSettings = new UserSettings({
        attributes: {
          password: {
            enabled: true,
            required: false,
          },
        },
      } as unknown as UserSettingsJSON);

      const { container } = render(<SignInStart />);
      const instantPasswordField = container.querySelector('input#password') as HTMLInputElement;
      expect(instantPasswordField).toBeNull();
    });

    it.each(['google', 'facebook'])(
      'renders the start screen, presses the %s button and starts an oauth flow',
      async provider => {
        const providerTitle = titleize(provider);

        render(<SignInStart />);

        const regex = new RegExp(`Sign in with ${providerTitle}`, 'i');

        const signGoogleButton = screen.getByRole('button', {
          name: regex,
        });
        await userEvent.click(signGoogleButton);

        await waitFor(() => {
          expect(mockAuthenticateWithRedirect).toHaveBeenCalledTimes(1);
          expect(mockAuthenticateWithRedirect).toHaveBeenCalledWith({
            strategy: `oauth_${provider}`,
            redirectUrl: 'http://localhost/#/sso-callback',
            redirectUrlComplete: 'http://test.host',
          });
        });
      },
    );
  });

  describe('when the user is already signed in', () => {
    afterEach(() => {
      mockCreateRequest.mockReset();
    });

    it('redirects to after sign in url', async () => {
      mockCreateRequest.mockImplementation(() => {
        throw new ClerkAPIResponseError('', {
          data: [
            {
              code: 'identifier_already_signed_in',
              message: 'User already signed in',
              meta: {
                session_id: 'deadbeef',
              },
            },
          ],
          status: 400,
        });
      });

      render(<SignInStart />);

      const inputField = screen.getByLabelText('Email address');
      await userEvent.type(inputField, 'boss@clerk.dev');

      const signEmailButton = screen.getByRole('button', { name: /Continue/i });
      await userEvent.click(signEmailButton);

      await waitFor(() => {
        expect(mockCreateRequest).toHaveBeenCalledTimes(1);
        expect(mockCreateRequest).toHaveBeenCalledWith({
          identifier: 'boss@clerk.dev',
        });
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockSetActive).toHaveBeenNthCalledWith(1, {
          session: 'deadbeef',
          beforeEmit: mockNavigateAfterSignIn,
        });
      });
    });
  });

  describe('when the instance is invitation only', () => {
    it('renders the external account verification error if available', async () => {
      const errorMsg = 'You cannot sign up with sokratis.vidros@gmail.com since this is an invitation-only application';

      mocked(useCoreSignIn as jest.Mock<SignInResource>, true).mockImplementationOnce(
        () =>
          ({
            create: mockCreateRequest,
            firstFactorVerification: {
              error: {
                code: 'not_allowed_to_sign_up',
                longMessage: errorMsg,
              },
            },
          } as unknown as SignInResource),
      );

      render(<SignInStart />);

      expect(screen.getByText(errorMsg)).toBeInTheDocument();
      expect(mockCreateRequest).toHaveBeenNthCalledWith(1, {});
    });
  });

  describe('when the user does not grant access to their Google account', () => {
    it('renders the external account verification error if available', async () => {
      const errorMsg = 'You did not grant access to your Google account';

      mocked(useCoreSignIn as jest.Mock<SignInResource>, true).mockImplementationOnce(
        () =>
          ({
            create: mockCreateRequest,
            firstFactorVerification: {
              error: {
                code: 'oauth_access_denied',
                longMessage: errorMsg,
              },
            },
          } as unknown as SignInResource),
      );

      render(<SignInStart />);

      expect(screen.getByText(errorMsg)).toBeInTheDocument();
      expect(mockCreateRequest).toHaveBeenNthCalledWith(1, {});
    });
  });

  describe('when a miscellaneous oauth error occurs', () => {
    it('renders a generic error message', () => {
      const genericErrorMsg = 'Unable to complete action at this time. If the problem persists please contact support.';

      mocked(useCoreSignIn as jest.Mock<SignInResource>, true).mockImplementationOnce(
        () =>
          ({
            create: mockCreateRequest,
            firstFactorVerification: {
              error: {
                code: 'omg_they_killed_kenny',
                longMessage: 'All hope is lost',
              },
            },
          } as unknown as SignInResource),
      );

      render(<SignInStart />);

      expect(screen.getByText(genericErrorMsg)).toBeInTheDocument();
      expect(mockCreateRequest).toHaveBeenNthCalledWith(1, {});
    });
  });
});

import { mocked, render, screen, userEvent, waitFor } from '@clerk/shared/testUtils';
import { EnvironmentResource, LoadedClerk, SignInFactor, SignInResource } from '@clerk/types';
import * as React from 'react';
import { PartialDeep } from 'type-fest';
import { useCoreClerk, useCoreSignIn, useEnvironment, useSignInContext } from 'ui/contexts';

import { SignInFactorOne } from './SignInFactorOne';

const mockNavigate = jest.fn();
const mockNavigateAfterSignIn = jest.fn();
const mockPrepareFirstFactor = jest.fn(() => Promise.resolve());

jest.mock('ui/contexts', () => {
  return {
    useEnvironment: jest.fn(),
    useCoreSession: jest.fn(),
    useSignInContext: jest.fn(),
    useCoreClerk: jest.fn(),
    useCoreSignIn: jest.fn(),
    useOptions: jest.fn(() => ({ supportEmail: undefined })),
  };
});

jest.mock('ui/hooks', () => ({
  // @ts-ignore
  ...jest.requireActual('ui/hooks'),
  useNavigate: () => {
    return {
      navigate: mockNavigate,
    };
  },
}));

jest.mock('ui/router/RouteContext');

(useSignInContext as jest.Mock).mockImplementation(() => ({
  signUpUrl: 'http://test.host',
  navigateAfterSignIn: mockNavigateAfterSignIn,
}));

describe('<SignInFactorOne/>', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('successful password based sign in', () => {
    it('renders the sign in screen, enters a password and sets session', async () => {
      const mockSetActive = jest.fn();
      const mockAttemptFirstFactor = jest.fn();

      (useEnvironment as jest.Mock).mockImplementation(() => ({
        authConfig: { singleSessionMode: false },
        displayConfig: {
          preferredSignInStrategy: 'password',
        },
      }));

      (useCoreSignIn as jest.Mock).mockImplementation(() => ({
        mockPrepareFirstFactor: mockPrepareFirstFactor,
        firstFactorVerification: {
          status: null,
          verifiedAtClient: '',
          verifiedFromTheSameClient: jest.fn(() => false),
        },
        supportedFirstFactors: [
          {
            strategy: 'password',
          } as SignInFactor,
        ],
        attemptFirstFactor: mockAttemptFirstFactor.mockReturnValue({
          status: 'complete',
          createdSessionId: 'cafebabe',
        }),
      }));

      (useCoreClerk as jest.Mock<PartialDeep<LoadedClerk>>).mockImplementation(() => ({
        setActive: mockSetActive,
      }));

      render(<SignInFactorOne />);

      const inputField = screen.getByLabelText('Password');
      userEvent.clear(inputField);
      await userEvent.type(inputField, 'p@ssW0rD');

      const button = screen.getByRole('button', { name: /Sign in/i });
      await userEvent.click(button);

      await waitFor(() => {
        expect(mockAttemptFirstFactor).toHaveBeenCalledTimes(1);
        expect(mockAttemptFirstFactor).toHaveBeenCalledWith({
          strategy: 'password',
          password: 'p@ssW0rD',
        });

        expect(mockNavigate).toHaveBeenCalledTimes(0);
        expect(mockSetActive).toHaveBeenCalledTimes(1);
        expect(mockSetActive).toHaveBeenCalledWith({
          session: 'cafebabe',
          beforeEmit: mockNavigateAfterSignIn,
        });
      });
    });
  });

  describe('2SV password based sign in', () => {
    it('redirects to /factor-two', async () => {
      const mockSetActive = jest.fn();
      const mockAttemptFirstFactor = jest.fn();

      (useEnvironment as jest.Mock).mockImplementation(() => ({
        authConfig: { singleSessionMode: false },
        displayConfig: {
          preferredSignInStrategy: 'password',
        },
      }));

      (useCoreSignIn as jest.Mock).mockImplementation(() => ({
        mockPrepareFirstFactor: mockPrepareFirstFactor,
        firstFactorVerification: {
          status: null,
          verifiedAtClient: '',
          verifiedFromTheSameClient: jest.fn(() => false),
        },
        supportedFirstFactors: [
          {
            strategy: 'password',
            safeIdentifier: 'jdoe@example.com',
            emailAddressId: 'deadbeef',
          } as SignInFactor,
        ],
        attemptFirstFactor: mockAttemptFirstFactor.mockReturnValue({
          status: 'needs_second_factor',
        }),
      }));

      (useCoreClerk as jest.Mock<PartialDeep<LoadedClerk>>).mockImplementation(() => ({
        setActive: mockSetActive,
      }));

      render(<SignInFactorOne />);

      const inputField = screen.getByLabelText('Password');
      userEvent.clear(inputField);
      await userEvent.type(inputField, 'p@ssW0rD');

      const button = screen.getByRole('button', { name: /Sign in/i });
      await userEvent.click(button);

      await waitFor(() => {
        expect(mockAttemptFirstFactor).toHaveBeenCalledTimes(1);
        expect(mockAttemptFirstFactor).toHaveBeenCalledWith({
          strategy: 'password',
          password: 'p@ssW0rD',
        });

        expect(mockSetActive).toHaveBeenCalledTimes(0);
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('../factor-two');
      });
    });
  });

  describe('successful passwordless sign in', () => {
    it('renders the sign in screen, enters a password and sets session', async () => {
      const mockAttemptFirstFactor = jest.fn();
      const mockSetActive = jest.fn();

      (useEnvironment as jest.Mock<PartialDeep<EnvironmentResource>>).mockImplementation(() => ({
        authConfig: { singleSessionMode: false },
        displayConfig: {
          preferredSignInStrategy: 'otp',
        },
      }));

      (useCoreSignIn as jest.Mock<SignInResource>).mockImplementation(
        () =>
          ({
            prepareFirstFactor: mockPrepareFirstFactor,
            supportedFirstFactors: [
              {
                strategy: 'email_code',
                safeIdentifier: 'jdoe@example.com',
                emailAddressId: 'deadbeef',
              } as SignInFactor,
            ],
            attemptFirstFactor: mockAttemptFirstFactor.mockReturnValue({
              status: 'complete',
              createdSessionId: 'cafebabe',
            }),
            firstFactorVerification: {
              status: null,
              verifiedAtClient: '',
              verifiedFromTheSameClient: jest.fn(() => false),
            },
          } as unknown as SignInResource),
      );

      (useCoreClerk as jest.Mock<PartialDeep<LoadedClerk>>).mockImplementation(() => ({
        setActive: mockSetActive,
      }));

      render(<SignInFactorOne />);

      expect(mockPrepareFirstFactor).toHaveBeenCalledTimes(1);
      expect(mockPrepareFirstFactor).toHaveBeenCalledWith({
        strategy: 'email_code',
        safeIdentifier: 'jdoe@example.com',
        emailAddressId: 'deadbeef',
      } as SignInFactor);

      const text = '123456';
      const inputs = screen.getAllByRole('textbox');
      for (const [i, input] of inputs.entries()) {
        await userEvent.type(input, text[i]);
      }

      await waitFor(() => {
        expect(mockAttemptFirstFactor).toHaveBeenCalledTimes(1);
        expect(mockAttemptFirstFactor).toHaveBeenCalledWith({
          strategy: 'email_code',
          code: '123456',
        });

        expect(mockNavigate).toHaveBeenCalledTimes(0);
        expect(mockSetActive).toHaveBeenCalledTimes(1);
        expect(mockSetActive).toHaveBeenCalledWith({
          session: 'cafebabe',
          beforeEmit: mockNavigateAfterSignIn,
        });
      });
    });
  });

  describe('successful magiclink sign in', () => {
    it('renders the magic link sign in screen, and handles an expired first factor verification', async () => {
      const mockSetActive = jest.fn();
      const mockStartMagicLinkFlow = jest.fn(() =>
        Promise.resolve({
          status: 'needs_factor_one',
          firstFactorVerification: {
            status: 'expired',
          },
        }),
      );

      (useEnvironment as jest.Mock<PartialDeep<EnvironmentResource>>).mockImplementation(() => ({
        authConfig: { singleSessionMode: false },
        displayConfig: {
          preferredSignInStrategy: 'otp',
        },
      }));

      (useCoreSignIn as jest.Mock<SignInResource>).mockImplementation(
        () =>
          ({
            createMagicLinkFlow: () => ({
              startMagicLinkFlow: mockStartMagicLinkFlow,
              cancelMagicLinkFlow: () => {
                return;
              },
            }),
            supportedFirstFactors: [
              {
                strategy: 'email_link',
                safeIdentifier: 'jdoe@example.com',
                emailAddressId: 'deadbeef',
              } as SignInFactor,
            ],
            firstFactorVerification: {
              status: null,
              verifiedFromTheSameClient: jest.fn(() => false),
            },
          } as unknown as SignInResource),
      );

      (useCoreClerk as jest.Mock<PartialDeep<LoadedClerk>>).mockImplementation(() => ({
        setActive: mockSetActive,
      }));

      render(<SignInFactorOne />);

      expect(mockStartMagicLinkFlow).toHaveBeenCalledTimes(1);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledTimes(0);
        expect(mockSetActive).toHaveBeenCalledTimes(0);
        screen.getByText(/expired/);
      });
    });

    it('renders the magic link sign in screen, waits for magic link and sets session', async () => {
      const mockSetActive = jest.fn();
      const mockStartMagicLinkFlow = jest.fn(() =>
        Promise.resolve({
          status: 'complete',
          createdSessionId: 'cafebabe',
          firstFactorVerification: {
            status: 'verified',
            verifiedAtClient: '',
            verifiedFromTheSameClient: jest.fn(() => false),
          },
        }),
      );

      (useEnvironment as jest.Mock<PartialDeep<EnvironmentResource>>).mockImplementation(() => ({
        authConfig: { singleSessionMode: false },
        displayConfig: {
          preferredSignInStrategy: 'otp',
        },
      }));

      (useCoreSignIn as jest.Mock<SignInResource>).mockImplementation(
        () =>
          ({
            createMagicLinkFlow: () => ({
              startMagicLinkFlow: mockStartMagicLinkFlow,
              cancelMagicLinkFlow: () => {
                return;
              },
            }),
            supportedFirstFactors: [
              {
                strategy: 'email_link',
                safeIdentifier: 'jdoe@example.com',
                emailAddressId: 'deadbeef',
              } as SignInFactor,
            ],
            firstFactorVerification: {
              status: null,
              verifiedFromTheSameClient: jest.fn(() => false),
            },
          } as unknown as SignInResource),
      );

      (useCoreClerk as jest.Mock<PartialDeep<LoadedClerk>>).mockImplementation(() => ({
        setActive: mockSetActive,
      }));

      render(<SignInFactorOne />);

      expect(mockStartMagicLinkFlow).toHaveBeenCalledTimes(1);
      const params: any = mockStartMagicLinkFlow.mock.calls[0];
      expect(params[0].strategy).toBe(undefined);
      expect(params[0].emailAddressId).toBe('deadbeef');
      expect(params[0].redirectUrl).toContain('verify');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledTimes(0);
        expect(mockSetActive).toHaveBeenCalledTimes(1);
        expect(mockSetActive).toHaveBeenCalledWith({
          session: 'cafebabe',
          beforeEmit: mockNavigateAfterSignIn,
        });
      });
    });
  });

  describe('2SV passwordless sign in', () => {
    it('renders the sign in screen, enters a password and sets session', async () => {
      const mockAttemptFirstFactor = jest.fn();
      const mockSetActive = jest.fn();

      mocked(useEnvironment as jest.Mock<PartialDeep<EnvironmentResource>>, true).mockImplementation(() => ({
        authConfig: { singleSessionMode: false },
        displayConfig: {
          preferredSignInStrategy: 'otp',
        },
      }));

      mocked(useCoreSignIn as jest.Mock<SignInResource>, true).mockImplementation(
        () =>
          ({
            prepareFirstFactor: mockPrepareFirstFactor,
            supportedFirstFactors: [
              {
                strategy: 'phone_code',
                safeIdentifier: '+1********9',
                phoneNumberId: 'deadbeef',
              } as SignInFactor,
            ],
            attemptFirstFactor: mockAttemptFirstFactor.mockReturnValue({
              status: 'needs_second_factor',
            }),
            firstFactorVerification: {
              status: null,
              verifiedAtClient: '',
              verifiedFromTheSameClient: jest.fn(() => false),
            },
          } as unknown as SignInResource),
      );

      mocked(useCoreClerk as jest.Mock<PartialDeep<LoadedClerk>>, true).mockImplementation(() => ({
        setActive: mockSetActive,
      }));

      render(<SignInFactorOne />);

      expect(mockPrepareFirstFactor).toHaveBeenCalledTimes(1);
      expect(mockPrepareFirstFactor).toHaveBeenCalledWith({
        strategy: 'phone_code',
        safeIdentifier: '+1********9',
        phoneNumberId: 'deadbeef',
      } as SignInFactor);

      const text = '123456';
      const inputs = screen.getAllByRole('textbox');
      for (const [i, input] of inputs.entries()) {
        await userEvent.type(input, text[i]);
      }

      await waitFor(() => {
        expect(mockAttemptFirstFactor).toHaveBeenCalledTimes(1);
        expect(mockAttemptFirstFactor).toHaveBeenCalledWith({
          strategy: 'phone_code',
          code: '123456',
        });

        expect(mockSetActive).toHaveBeenCalledTimes(0);
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('../factor-two');
      });
    });
  });

  describe('successful alternate method selection', () => {
    it('renders the sign in screen and chooses an alternate strategy', async () => {
      const mockAttemptFirstFactor = jest.fn();
      const mockPrepareFirstFactor = jest.fn();
      const mockSetActive = jest.fn();

      mocked(useEnvironment as jest.Mock<PartialDeep<EnvironmentResource>>, true).mockImplementation(() => ({
        authConfig: { singleSessionMode: false },
        displayConfig: {
          preferredSignInStrategy: 'otp',
        },
      }));

      mocked(useCoreSignIn as jest.Mock<SignInResource>, true).mockImplementation(
        () =>
          ({
            prepareFirstFactor: mockPrepareFirstFactor,
            supportedFirstFactors: [
              {
                strategy: 'email_code',
                safeIdentifier: 'ccoe@example.com',
                emailAddressId: 'deadbeef',
              } as SignInFactor,
              {
                strategy: 'email_code',
                safeIdentifier: 'jdoe@example.com',
                emailAddressId: 'cafebabe',
              } as SignInFactor,
            ],
            attemptFirstFactor: mockAttemptFirstFactor.mockReturnValue({
              status: 'complete',
              createdSessionId: 'new-id',
            }),
            firstFactorVerification: {
              status: null,
              verifiedAtClient: '',
              verifiedFromTheSameClient: jest.fn(() => false),
            },
          } as unknown as SignInResource),
      );

      mocked(
        // @ts-ignore
        useCoreClerk as jest.Mock<PartialDeep<LoadedClerk>>,
        true,
      ).mockImplementation(() => ({
        setActive: mockSetActive,
      }));

      render(<SignInFactorOne />);

      await userEvent.click(screen.getByText('Try another method'));
      await userEvent.click(screen.getByText('Email code to jdoe@example.com'));

      await waitFor(() => {
        expect(mockPrepareFirstFactor).toHaveBeenNthCalledWith(1, {
          strategy: 'email_code',
          safeIdentifier: 'ccoe@example.com',
          emailAddressId: 'deadbeef',
        } as SignInFactor);
        expect(mockPrepareFirstFactor).toHaveBeenNthCalledWith(2, {
          strategy: 'email_code',
          safeIdentifier: 'jdoe@example.com',
          emailAddressId: 'cafebabe',
        } as SignInFactor);
      });
    });

    it('goes back to default factorOne screen after hitting back on alternate strategy screen', async () => {
      const mockAttemptFirstFactor = jest.fn();
      const mockSetActive = jest.fn();

      (useEnvironment as jest.Mock<PartialDeep<EnvironmentResource>>).mockImplementation(() => ({
        authConfig: { singleSessionMode: false },
        displayConfig: {
          preferredSignInStrategy: 'otp',
        },
      }));

      (useCoreSignIn as jest.Mock<SignInResource>).mockImplementation(
        () =>
          ({
            prepareFirstFactor: mockPrepareFirstFactor,
            supportedFirstFactors: [
              {
                strategy: 'email_code',
                safeIdentifier: 'ccoe@example.com',
                emailAddressId: 'deadbeef',
              } as SignInFactor,
            ],
            attemptFirstFactor: mockAttemptFirstFactor.mockReturnValue({
              status: 'complete',
              createdSessionId: 'new-id',
            }),
            firstFactorVerification: {
              status: null,
              verifiedAtClient: '',
              verifiedFromTheSameClient: jest.fn(() => false),
            },
          } as unknown as SignInResource),
      );

      (useCoreClerk as jest.Mock<PartialDeep<LoadedClerk>>).mockImplementation(() => ({
        setActive: mockSetActive,
      }));

      render(<SignInFactorOne />);
      await userEvent.click(screen.getByText('Try another method'));
      screen.getByText('Email code to ccoe@example.com');

      expect(screen.queryByText('Try another method')).toBeNull();
      const backButton = screen.getByLabelText(/Back Button/);
      expect(backButton).toBeDefined();
      await userEvent.click(backButton);
      screen.getByText('Try another method');
    });

    it('renders all available strategies when sso sign is available and no other first factor', () => {
      const mockSetActive = jest.fn();
      mocked(useEnvironment as jest.Mock<PartialDeep<EnvironmentResource>>, true).mockImplementation(() => ({
        authConfig: { singleSessionMode: false },
        displayConfig: {
          preferredSignInStrategy: 'otp',
        },
      }));

      const mockPrepareFirstFactor = jest.fn();
      (useCoreSignIn as jest.Mock<SignInResource>).mockImplementation(
        () =>
          ({
            prepareFirstFactor: mockPrepareFirstFactor,
            supportedFirstFactors: [
              {
                strategy: 'oauth_google',
              } as SignInFactor,
            ],
            firstFactorVerification: {
              status: null,
              verifiedFromTheSameClient: jest.fn(() => false),
            },
          } as unknown as SignInResource),
      );

      mocked(
        // @ts-ignore
        useCoreClerk as jest.Mock<PartialDeep<LoadedClerk>>,
        true,
      ).mockImplementation(() => ({
        setActive: mockSetActive,
      }));

      const { container } = render(<SignInFactorOne />);
      expect(container.querySelector('.cl-otp-input')).toBeNull();
      expect(screen.queryByText('Try another method')).not.toBeInTheDocument();
      expect(screen.queryByText('Sign in with Google')).toBeInTheDocument();
    });
  });

  describe('error cases', () => {
    it('renders the loading screen', async () => {
      (useEnvironment as jest.Mock<PartialDeep<EnvironmentResource>>).mockImplementation(() => ({
        authConfig: { singleSessionMode: false },
        displayConfig: {
          preferredSignInStrategy: undefined,
        },
      }));

      (useCoreSignIn as jest.Mock<SignInResource>).mockImplementation(
        () =>
          ({
            supportedFirstFactors: [],
            status: null,
          } as unknown as SignInResource),
      );

      const { container } = render(<SignInFactorOne />);
      expect(container.querySelector('.cl-auth-form-spinner')).toBeDefined();
    });

    it('renders the fallback screen', () => {
      (useEnvironment as jest.Mock<PartialDeep<EnvironmentResource>>).mockImplementation(() => ({
        authConfig: { singleSessionMode: false },
        displayConfig: {
          preferredSignInStrategy: undefined,
        },
      }));

      (useCoreSignIn as jest.Mock<SignInResource>).mockImplementation(
        () =>
          ({
            supportedFirstFactors: [],
            status: 'needs_first_factor',
          } as unknown as SignInResource),
      );

      render(<SignInFactorOne />);

      screen.getByText(/no available authentication factor/);
    });
  });
});

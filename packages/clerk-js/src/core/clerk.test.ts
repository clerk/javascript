import { SignInJSON, SignUpJSON } from '@clerk/types';
import { waitFor } from '@testing-library/dom';
import Clerk from 'core/clerk';
import {
  Client,
  DisplayConfig,
  Environment,
  MagicLinkErrorCode,
  SignIn,
  SignUp,
} from 'core/resources/internal';

const mockClientFetch = jest.fn();
const mockEnvironmentFetch = jest.fn();

jest.mock('core/resources/Client');
jest.mock('core/resources/Environment');

Client.getInstance = jest.fn().mockImplementation(() => {
  return { fetch: mockClientFetch };
});
Environment.getInstance = jest.fn().mockImplementation(() => {
  return { fetch: mockEnvironmentFetch };
});

const oldWindowLocation = window.location;
const setWindowQueryParams = (params: Array<[string, string]>) => {
  // @ts-ignore
  delete window.location;
  const u = new URL(oldWindowLocation.href);
  params.forEach(([k, v]) => u.searchParams.append(k, v));
  (window.location as any) = u;
};

describe('Clerk singleton', () => {
  const { location } = window;
  // Use a FAPI value for local production instances to avoid triggering the devInit flow during testing
  const frontendApi = 'clerk.abcef.12345.prod.lclclerk.com';

  let mockNavigate = jest.fn();

  const mockDisplayConfig = {
    signInUrl: 'signInUrl',
    signUpUrl: 'signUpUrl',
    userProfileUrl: 'userProfileUrl',
  } as DisplayConfig;

  afterAll(() => {
    global.window.location = location;
  });

  beforeEach(() => {
    const mockAddEventListener = (type: string, callback: (e: any) => void) => {
      if (type === 'message') {
        callback({
          origin: 'https://' + frontendApi,
          data: {
            browserToken: 'hey',
          },
        });
      }
    };

    Object.defineProperty(global.window, 'addEventListener', {
      value: mockAddEventListener,
    });

    mockEnvironmentFetch.mockReturnValue(
      Promise.resolve({
        authConfig: {},
        displayConfig: mockDisplayConfig,
        isSingleSession: () => false,
      }),
    );

    mockClientFetch.mockReturnValue(
      Promise.resolve({
        activeSessions: [],
      }),
    );

    mockNavigate = jest.fn((to: string) => Promise.resolve(to));
  });

  describe('.redirectTo(SignUp|SignIn|UserProfile)', () => {
    let sut: Clerk;

    beforeEach(async () => {
      sut = new Clerk(frontendApi);
      await sut.load({
        navigate: mockNavigate,
      });
    });

    it('redirects to signInUrl', () => {
      sut.redirectToSignIn({ redirectUrl: 'https://www.example.com/' });
      expect(mockNavigate).toHaveBeenCalledWith(
        '/signInUrl#/?redirect_url=https%3A%2F%2Fwww.example.com%2F',
      );
    });

    it('redirects to signUpUrl', () => {
      sut.redirectToSignUp({ redirectUrl: 'https://www.example.com/' });
      expect(mockNavigate).toHaveBeenCalledWith(
        '/signUpUrl#/?redirect_url=https%3A%2F%2Fwww.example.com%2F',
      );
    });

    it('redirects to userProfileUrl', () => {
      sut.redirectToUserProfile();
      expect(mockNavigate).toHaveBeenCalledWith('/userProfileUrl');
    });
  });

  describe('.load()', () => {
    it('gracefully handles an incorrect value returned from the user provided selectInitialSession', async () => {
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          onWindowLocationHost: () => false,
        }),
      );

      mockClientFetch.mockReturnValue(
        Promise.resolve({
          activeSessions: [],
        }),
      );

      // any is intentional here. We simulate a runtime value that should not exist
      const mockSelectInitialSession = jest.fn(() => undefined) as any;
      const sut = new Clerk(frontendApi);
      await sut.load({
        selectInitialSession: mockSelectInitialSession,
      });

      await waitFor(() => {
        expect(sut.session).not.toBe(undefined);
        expect(sut.session).toBe(null);
      });
    });
  });

  describe('.signOut()', () => {
    const mockClientDestroy = jest.fn();
    const mockSession1 = { id: '1', remove: jest.fn(), status: 'active' };
    const mockSession2 = { id: '2', remove: jest.fn(), status: 'active' };

    beforeEach(() => {
      mockClientDestroy.mockReset();
      mockSession1.remove.mockReset();
      mockSession2.remove.mockReset();
    });

    it('has no effect if called when no active sessions exist', async () => {
      const sut = new Clerk(frontendApi);
      mockClientFetch.mockReturnValue(
        Promise.resolve({
          activeSessions: [],
          destroy: mockClientDestroy,
        }),
      );
      await sut.load();
      await sut.signOut();
      await waitFor(() => {
        expect(mockClientDestroy).not.toHaveBeenCalled();
        expect(mockSession1.remove).not.toHaveBeenCalled();
      });
    });

    it('signs out all sessions if no sessionId is passed and multiple sessions are active', async () => {
      mockClientFetch.mockReturnValue(
        Promise.resolve({
          activeSessions: [mockSession1, mockSession2],
          destroy: mockClientDestroy,
        }),
      );

      const sut = new Clerk(frontendApi);
      sut.setSession = jest.fn();
      await sut.load();
      await sut.signOut();
      await waitFor(() => {
        expect(mockClientDestroy).toHaveBeenCalled();
        expect(sut.setSession).toHaveBeenCalledWith(null, undefined);
      });
    });

    it('signs out all sessions if no sessionId is passed and only one session is active', async () => {
      mockClientFetch.mockReturnValue(
        Promise.resolve({
          activeSessions: [mockSession1],
          destroy: mockClientDestroy,
        }),
      );

      const sut = new Clerk(frontendApi);
      sut.setSession = jest.fn();
      await sut.load();
      await sut.signOut();
      await waitFor(() => {
        expect(mockClientDestroy).toHaveBeenCalled();
        expect(mockSession1.remove).not.toHaveBeenCalled();
        expect(sut.setSession).toHaveBeenCalledWith(null, undefined);
      });
    });

    it('only removes the session that corresponds to the passed sessionId if it is not the current', async () => {
      mockClientFetch.mockReturnValue(
        Promise.resolve({
          activeSessions: [mockSession1, mockSession2],
          destroy: mockClientDestroy,
        }),
      );

      const sut = new Clerk(frontendApi);
      sut.setSession = jest.fn();
      await sut.load();
      await sut.signOut({ sessionId: '2' });
      await waitFor(() => {
        expect(mockSession2.remove).toHaveBeenCalled();
        expect(mockClientDestroy).not.toHaveBeenCalled();
        expect(sut.setSession).not.toHaveBeenCalledWith(null, undefined);
      });
    });

    it('removes and signs out the session that corresponds to the passed sessionId if it is the current', async () => {
      mockClientFetch.mockReturnValue(
        Promise.resolve({
          activeSessions: [mockSession1, mockSession2],
          destroy: mockClientDestroy,
        }),
      );

      const sut = new Clerk(frontendApi);
      sut.setSession = jest.fn();
      await sut.load();
      await sut.signOut({ sessionId: '1' });
      await waitFor(() => {
        expect(mockSession1.remove).toHaveBeenCalled();
        expect(mockClientDestroy).not.toHaveBeenCalled();
        expect(sut.setSession).toHaveBeenCalledWith(null, undefined);
      });
    });
  });

  describe('.navigate(to)', () => {
    let mockWindowLocation;
    let mockHref: jest.Mock;
    let sut: Clerk;

    beforeEach(() => {
      mockHref = jest.fn();
      mockWindowLocation = {
        host: 'www.origin1.com',
        hostname: 'www.origin1.com',
        origin: 'https://www.origin1.com',
        get href() {
          return 'https://www.origin1.com';
        },
        set href(v: string) {
          mockHref(v);
        },
      } as any;

      Object.defineProperty(global.window, 'location', {
        value: mockWindowLocation,
      });

      sut = new Clerk(frontendApi);
    });

    it('uses window location if a custom navigate is not defined', async () => {
      await sut.load();
      const toUrl = 'https://www.origin1.com/';
      await sut.navigate(toUrl);
      expect(mockHref).toHaveBeenCalledWith(toUrl);
    });

    it('uses window location if a custom navigate is defined but destination has different origin', async () => {
      await sut.load({ navigate: mockNavigate });
      const toUrl = 'https://www.origindifferent.com/';
      await sut.navigate(toUrl);
      expect(mockHref).toHaveBeenCalledWith(toUrl);
    });

    it('wraps custom navigate method in a promise if provided and it sync', async () => {
      await sut.load({ navigate: mockNavigate });
      const toUrl = 'https://www.origin1.com/path#hash';
      const res = sut.navigate(toUrl);
      expect(res.then).toBeDefined();
      expect(mockHref).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/path#hash');
    });
  });

  describe('.handleRedirectCallback()', () => {
    beforeEach(() => {
      mockClientFetch.mockReset();
      mockEnvironmentFetch.mockReset();
    });

    it('creates a new user and calls setSession if the user was not found during sso signup', async () => {
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          onWindowLocationHost: () => false,
        }),
      );

      mockClientFetch.mockReturnValue(
        Promise.resolve({
          activeSessions: [],
          signIn: new SignIn({
            status: 'needs_identifier',
            first_factor_verification: {
              status: 'transferable',
              strategy: 'oauth_google',
              external_verification_redirect_url: '',
              error: {
                code: 'external_account_not_found',
                long_message: 'The External Account was not found.',
                message: 'Invalid external account',
              },
            },
            second_factor_verification: null,
            identifier: '',
            user_data: null,
            created_session_id: null,
          } as any as SignInJSON),
          signUp: new SignUp(null),
        }),
      );

      const mockSetSession = jest.fn();
      const mockSignUpCreate = jest
        .fn()
        .mockReturnValue(
          Promise.resolve({ status: 'complete', createdSessionId: '123' }),
        );

      const sut = new Clerk(frontendApi);
      await sut.load({
        navigate: mockNavigate,
      });
      if (!sut.client) {
        fail('we should always have a client');
      }
      sut.client.signUp.create = mockSignUpCreate;
      sut.setSession = mockSetSession;

      sut.handleRedirectCallback();

      await waitFor(() => {
        expect(mockSignUpCreate).toHaveBeenCalledWith({ transfer: true });
        expect(mockSetSession).toHaveBeenCalled();
      });
    });

    it('signs the user in if the user was found during sign up', async () => {
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          onWindowLocationHost: () => false,
        }),
      );

      mockClientFetch.mockReturnValue(
        Promise.resolve({
          activeSessions: [],
          signIn: new SignIn(null),
          signUp: new SignUp({
            status: 'missing_requirements',
            verifications: {
              external_account: {
                status: 'transferable',
                strategy: 'oauth_google',
                external_verification_redirect_url: null,
                error: {
                  code: 'external_account_exists',
                  long_message: 'This external account already exists.',
                  message: 'already exists',
                },
              },
            },
            external_account: null,
            external_account_verification: {
              status: 'transferable',
              strategy: 'oauth_google',
              external_verification_redirect_url: null,
              error: {
                code: 'external_account_exists',
                long_message: 'This external account already exists.',
                message: 'already exists',
              },
            },
          } as any as SignUpJSON),
        }),
      );

      const mockSetSession = jest.fn();
      const mockSignInCreate = jest
        .fn()
        .mockReturnValue(
          Promise.resolve({ status: 'complete', createdSessionId: '123' }),
        );

      const sut = new Clerk(frontendApi);
      await sut.load({
        navigate: mockNavigate,
      });
      if (!sut.client) {
        fail('we should always have a client');
      }
      sut.client.signIn.create = mockSignInCreate;
      sut.setSession = mockSetSession;

      sut.handleRedirectCallback();

      await waitFor(() => {
        expect(mockSignInCreate).toHaveBeenCalledWith({ transfer: true });
        expect(mockSetSession).toHaveBeenCalled();
      });
    });

    it('signs the user by calling setSession if the user was already signed in during sign up', async () => {
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          onWindowLocationHost: () => false,
        }),
      );

      mockClientFetch.mockReturnValue(
        Promise.resolve({
          activeSessions: [],
          signIn: new SignIn(null),
          signUp: new SignUp({
            status: 'missing_requirements',
            verifications: {
              external_account: {
                status: 'unverified',
                strategy: 'oauth_google',
                external_verification_redirect_url: '',
                error: {
                  code: 'identifier_already_signed_in',
                  long_message: "You're already signed in",
                  message: "You're already signed in",
                  meta: {
                    session_id: 'sess_1yDceUR8SIKtQ0gIOO8fNsW7nhe',
                  },
                },
              },
            },
          } as any as SignUpJSON),
        }),
      );

      const mockSetSession = jest.fn();
      const sut = new Clerk(frontendApi);
      await sut.load({
        navigate: mockNavigate,
      });
      sut.setSession = mockSetSession;

      sut.handleRedirectCallback();

      await waitFor(() => {
        expect(mockSetSession).toHaveBeenCalled();
      });
    });

    it('creates a new user and calls setSession in if the user was found during sign in', async () => {
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          onWindowLocationHost: () => false,
        }),
      );

      mockClientFetch.mockReturnValue(
        Promise.resolve({
          activeSessions: [],
          signIn: new SignIn({
            status: 'needs_identifier',
            first_factor_verification: {
              status: 'transferable',
              strategy: 'oauth_google',
              external_verification_redirect_url: null,
              error: {
                code: 'external_account_not_found',
                long_message: 'The External Account was not found.',
                message: 'Invalid external account',
              },
            },
            second_factor_verification: null,
          } as any as SignInJSON),
          signUp: new SignUp(null),
        }),
      );

      const mockSetSession = jest.fn();
      const mockSignUpCreate = jest
        .fn()
        .mockReturnValue(
          Promise.resolve({ status: 'complete', createdSessionId: '123' }),
        );

      const sut = new Clerk(frontendApi);
      await sut.load({
        navigate: mockNavigate,
      });
      if (!sut.client) {
        fail('we should always have a client');
      }
      sut.client.signUp.create = mockSignUpCreate;
      sut.setSession = mockSetSession;

      sut.handleRedirectCallback();

      await waitFor(() => {
        expect(mockSignUpCreate).toHaveBeenCalledWith({ transfer: true });
        expect(mockSetSession).toHaveBeenCalled();
      });
    });

    it('redirects an existing user to the default 2fa page if 2fa is enabled during sign in', async () => {
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          onWindowLocationHost: () => false,
        }),
      );

      mockClientFetch.mockReturnValue(
        Promise.resolve({
          activeSessions: [],
          signIn: new SignIn({
            status: 'needs_second_factor',
            first_factor_verification: {
              status: 'verified',
              strategy: 'oauth_google',
              external_verification_redirect_url: null,
              error: null,
            },
            second_factor_verification: null,
          } as any as SignInJSON),
          signUp: new SignUp(null),
        }),
      );

      const sut = new Clerk(frontendApi);
      await sut.load({
        navigate: mockNavigate,
      });

      sut.handleRedirectCallback();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          '/' + mockDisplayConfig.signInUrl + '#/factor-two',
        );
      });
    });

    it('redirects an existing user to a custom 2fa page if 2fa is enabled and secondFactorUrl is passed during sign in', async () => {
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          onWindowLocationHost: () => false,
        }),
      );

      mockClientFetch.mockReturnValue(
        Promise.resolve({
          activeSessions: [],
          signIn: new SignIn({
            status: 'needs_second_factor',
            first_factor_verification: {
              status: 'verified',
              strategy: 'oauth_google',
              external_verification_redirect_url: null,
              error: null,
              expire_at: 1631777672389,
            },
            second_factor_verification: null,
          } as any as SignInJSON),
          signUp: new SignUp(null),
        }),
      );

      const sut = new Clerk(frontendApi);
      await sut.load({
        navigate: mockNavigate,
      });

      sut.handleRedirectCallback({
        secondFactorUrl: '/custom-2fa',
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/custom-2fa');
      });
    });

    it('redirects the user to the afterSignInUrl if one was provider', async () => {
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          onWindowLocationHost: () => false,
        }),
      );

      mockClientFetch.mockReturnValue(
        Promise.resolve({
          activeSessions: [],
          signIn: new SignIn(null),
          signUp: new SignUp({
            status: 'missing_requirements',
            verifications: {
              external_account: {
                status: 'unverified',
                strategy: 'oauth_google',
                external_verification_redirect_url: '',
                error: {
                  code: 'identifier_already_signed_in',
                  long_message: "You're already signed in",
                  message: "You're already signed in",
                  meta: {
                    session_id: 'sess_1yDceUR8SIKtQ0gIOO8fNsW7nhe',
                  },
                },
              },
            },
          } as any as SignUpJSON),
        }),
      );

      const mockSetSession = jest.fn(async (_: any, callback: () => any) => {
        await callback();
      });

      const sut = new Clerk(frontendApi);
      await sut.load({
        navigate: mockNavigate,
      });
      sut.setSession = mockSetSession as any;

      sut.handleRedirectCallback({
        redirectUrl: '/custom-sign-in',
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/custom-sign-in');
      });
    });

    it('gives priority to afterSignInUrl if afterSignInUrl and redirectUrl were provided ', async () => {
      mockEnvironmentFetch.mockReturnValue(
        Promise.resolve({
          authConfig: {},
          displayConfig: mockDisplayConfig,
          isSingleSession: () => false,
          isProduction: () => false,
          onWindowLocationHost: () => false,
        }),
      );

      mockClientFetch.mockReturnValue(
        Promise.resolve({
          activeSessions: [],
          signIn: new SignIn(null),
          signUp: new SignUp({
            status: 'missing_requirements',
            verifications: {
              external_account: {
                status: 'unverified',
                strategy: 'oauth_google',
                external_verification_redirect_url: '',
                error: {
                  code: 'identifier_already_signed_in',
                  long_message: "You're already signed in",
                  message: "You're already signed in",
                  meta: {
                    session_id: 'sess_1yDceUR8SIKtQ0gIOO8fNsW7nhe',
                  },
                },
              },
            },
          } as any as SignUpJSON),
        }),
      );

      const mockSetSession = jest.fn(async (_: any, callback: () => any) => {
        await callback();
      });

      const sut = new Clerk(frontendApi);
      await sut.load({
        navigate: mockNavigate,
      });
      sut.setSession = mockSetSession as any;

      sut.handleRedirectCallback({
        afterSignInUrl: '/custom-sign-in',
        redirectUrl: '/redirect-to',
      } as any);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/custom-sign-in');
      });
    });
  });

  describe('.handleMagicLinkVerification()', () => {
    beforeEach(async () => {
      mockClientFetch.mockReset();
      mockEnvironmentFetch.mockReset();
    });

    it('completes the sign in flow if a session was created on this client', async () => {
      const createdSessionId = 'sess_123';
      setWindowQueryParams([
        ['__clerk_status', 'verified'],
        ['__clerk_created_session', createdSessionId],
      ]);
      mockClientFetch.mockReturnValue(
        Promise.resolve({
          activeSessions: [],
          sessions: [{ id: createdSessionId }],
          signIn: new SignIn({
            status: 'completed',
          } as any as SignInJSON),
          signUp: new SignUp(null),
        }),
      );
      const mockSetSession = jest.fn();

      const sut = new Clerk(frontendApi);
      await sut.load({
        navigate: mockNavigate,
      });
      sut.setSession = mockSetSession;

      const redirectUrlComplete = '/redirect-to';
      sut.handleMagicLinkVerification({ redirectUrlComplete });

      await waitFor(() => {
        expect(mockSetSession).toHaveBeenCalledWith(
          createdSessionId,
          expect.any(Function),
        );
      });
    });

    it("continues to redirectUrl for sign in that's not completed", async () => {
      setWindowQueryParams([['__clerk_status', 'verified']]);
      mockClientFetch.mockReturnValue(
        Promise.resolve({
          activeSessions: [],
          sessions: [],
          signIn: new SignIn({
            status: 'needs_second_factor',
          } as any as SignInJSON),
          signUp: new SignUp(null),
        }),
      );
      const mockSetSession = jest.fn();

      const sut = new Clerk(frontendApi);
      await sut.load({
        navigate: mockNavigate,
      });
      sut.setSession = mockSetSession;

      const redirectUrl = '/2fa';
      sut.handleMagicLinkVerification({ redirectUrl });

      await waitFor(() => {
        expect(mockSetSession).not.toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith(redirectUrl);
      });
    });

    it('completes the sign up flow if a session was created on this client', async () => {
      const createdSessionId = 'sess_123';
      setWindowQueryParams([
        ['__clerk_status', 'verified'],
        ['__clerk_created_session', createdSessionId],
      ]);
      mockClientFetch.mockReturnValue(
        Promise.resolve({
          activeSessions: [],
          sessions: [{ id: createdSessionId }],
          signUp: new SignUp({
            status: 'completed',
          } as any as SignUpJSON),
          signIn: new SignIn(null),
        }),
      );
      const mockSetSession = jest.fn();

      const sut = new Clerk(frontendApi);
      await sut.load({
        navigate: mockNavigate,
      });
      sut.setSession = mockSetSession;

      const redirectUrlComplete = '/redirect-to';
      sut.handleMagicLinkVerification({ redirectUrlComplete });

      await waitFor(() => {
        expect(mockSetSession).toHaveBeenCalledWith(
          createdSessionId,
          expect.any(Function),
        );
      });
    });

    it("continues the sign up flow for a sign up that's not completed", async () => {
      setWindowQueryParams([['__clerk_status', 'verified']]);
      mockClientFetch.mockReturnValue(
        Promise.resolve({
          activeSessions: [],
          sessions: [],
          signUp: new SignUp({
            status: 'missing_requirements',
          } as any as SignUpJSON),
          signIn: new SignIn(null),
        }),
      );
      const mockSetSession = jest.fn();

      const sut = new Clerk(frontendApi);
      await sut.load({
        navigate: mockNavigate,
      });
      sut.setSession = mockSetSession;

      const redirectUrl = '/next-up';
      sut.handleMagicLinkVerification({ redirectUrl });

      await waitFor(() => {
        expect(mockSetSession).not.toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith(redirectUrl);
      });
    });

    it('throws an error for expired verification status parameter', async () => {
      setWindowQueryParams([['__clerk_status', 'expired']]);
      mockClientFetch.mockReturnValue(
        Promise.resolve({
          activeSessions: [],
          sessions: [],
          signUp: new SignUp(null),
          signIn: new SignIn(null),
        }),
      );
      const mockSetSession = jest.fn();

      const sut = new Clerk(frontendApi);
      await sut.load({
        navigate: mockNavigate,
      });
      sut.setSession = mockSetSession;

      await expect(async () => {
        await sut.handleMagicLinkVerification({});
      }).rejects.toThrow(MagicLinkErrorCode.Expired);
      expect(mockSetSession).not.toHaveBeenCalled();
    });

    it('throws an error for failed verification status parameter', async () => {
      setWindowQueryParams([['__clerk_status', 'failed']]);
      mockClientFetch.mockReturnValue(
        Promise.resolve({
          activeSessions: [],
          sessions: [],
          signUp: new SignUp(null),
          signIn: new SignIn(null),
        }),
      );
      const mockSetSession = jest.fn();

      const sut = new Clerk(frontendApi);
      await sut.load({
        navigate: mockNavigate,
      });
      sut.setSession = mockSetSession;

      await expect(async () => {
        await sut.handleMagicLinkVerification({});
      }).rejects.toThrow(MagicLinkErrorCode.Failed);
      expect(mockSetSession).not.toHaveBeenCalled();
    });

    it('runs a callback when verified on other device', async () => {
      setWindowQueryParams([
        ['__clerk_status', 'verified'],
        ['__clerk_created_session', 'sess_123'],
      ]);
      mockClientFetch.mockReturnValue(
        Promise.resolve({
          activeSessions: [],
          sessions: [],
          signUp: new SignUp(null),
          signIn: new SignIn(null),
        }),
      );
      const mockSetSession = jest.fn();
      const sut = new Clerk(frontendApi);
      await sut.load({
        navigate: mockNavigate,
      });
      sut.setSession = mockSetSession;
      const res = { ping: 'ping' };
      const cb = () => {
        res.ping = 'pong';
      };
      await sut.handleMagicLinkVerification({ onVerifiedOnOtherDevice: cb });
      expect(res.ping).toEqual('pong');
      expect(mockSetSession).not.toHaveBeenCalled();
    });

    it('throws an error with no status query parameter', async () => {
      setWindowQueryParams([['__clerk_created_session', 'sess_123']]);
      mockClientFetch.mockReturnValue(
        Promise.resolve({
          activeSessions: [],
          sessions: [],
          signUp: new SignUp(null),
          signIn: new SignIn(null),
        }),
      );
      const mockSetSession = jest.fn();
      const sut = new Clerk(frontendApi);
      await sut.load({
        navigate: mockNavigate,
      });
      sut.setSession = mockSetSession;
      await expect(async () => {
        await sut.handleMagicLinkVerification({});
      }).rejects.toThrow(MagicLinkErrorCode.Failed);
      expect(mockSetSession).not.toHaveBeenCalled();
    });

    it('throws an error for invalid status query parameter', async () => {
      setWindowQueryParams([
        ['__clerk_status', 'whatever'],
        ['__clerk_created_session', 'sess_123'],
      ]);
      mockClientFetch.mockReturnValue(
        Promise.resolve({
          activeSessions: [],
          sessions: [{ id: 'sess_123' }],
          signIn: new SignIn({
            status: 'completed',
          } as any as SignInJSON),
          signUp: new SignUp(null),
        }),
      );
      const mockSetSession = jest.fn();
      const sut = new Clerk(frontendApi);
      await sut.load({
        navigate: mockNavigate,
      });
      sut.setSession = mockSetSession;

      await expect(async () => {
        await sut.handleMagicLinkVerification({});
      }).rejects.toThrow(MagicLinkErrorCode.Failed);
      expect(mockSetSession).not.toHaveBeenCalled();
    });
  });
});

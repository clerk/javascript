import { render, renderJSON, screen, userEvent, waitFor } from '@clerk/shared/testUtils';
import { titleize } from '@clerk/shared/utils/string';
import { UserSettingsJSON } from '@clerk/types';
import { Session, UserSettings } from 'core/resources/internal';
import React from 'react';
import { useCoreSignUp } from 'ui/contexts';

import { SignUpStart } from './SignUpStart';

const navigateMock = jest.fn();
const mockCreateRequest = jest.fn();
const mockSetSession = jest.fn();
const mockAuthenticateWithRedirect = jest.fn();
let mockUserSettings: UserSettings;

const oldWindowLocation = window.location;
const setWindowQueryParams = (params: Array<[string, string]>) => {
  // @ts-ignore
  delete window.location;
  const u = new URL(oldWindowLocation.href);
  params.forEach(([k, v]) => u.searchParams.append(k, v));
  (window.location as any) = u;
};

jest.mock('ui/router/RouteContext');

jest.mock('ui/contexts', () => {
  return {
    useCoreSession: () => {
      return {
        id: 'sess_id',
      } as Partial<Session>;
    },
    useSignUpContext: () => {
      return {
        signInUrl: 'http://test.host/sign-in',
        navigateAfterSignUp: jest.fn(),
      };
    },
    useCoreClerk: jest.fn(() => ({
      frontendAPI: 'clerk.clerk.dev',
      setSession: mockSetSession,
    })),
    useCoreSignUp: jest.fn(() => ({
      create: mockCreateRequest,
      authenticateWithRedirect: mockAuthenticateWithRedirect,
      verifications: {
        emailAddress: {},
        phoneNumber: {},
        externalAccount: {},
      },
    })),
    useEnvironment: jest.fn(() => ({
      displayConfig: {
        applicationName: 'My test app',
        afterSignUpUrl: 'http://test.host',
      },
      userSettings: mockUserSettings,
      authConfig: { singleSessionMode: false },
    })),
  };
});

jest.mock('ui/hooks', () => ({
  useNavigate: () => {
    return {
      navigate: navigateMock,
    };
  },
}));

describe('<SignUpStart/>', () => {
  const { location } = window;

  beforeEach(() => {
    // mockIdentificationRequirements.mockImplementation(() => [
    //   ['email_address', 'oauth_google', 'oauth_facebook'],
    // ]);

    mockCreateRequest.mockImplementation(() =>
      Promise.resolve({
        emailAddress: 'jdoe@example.com',
        status: 'missing_requirements',
        unverifiedFields: ['email_address'],
      }),
    );

    mockUserSettings = new UserSettings({
      attributes: {
        username: {
          enabled: true,
          required: true,
        },
        first_name: {
          enabled: true,
          required: true,
        },
        last_name: {
          enabled: true,
          required: true,
        },
        password: {
          enabled: true,
          required: true,
        },
        email_address: {
          enabled: true,
          required: true,
          used_for_first_factor: true,
        },
        phone_number: {
          enabled: true,
          required: false,
        },
      },
      social: {
        oauth_google: {
          enabled: true,
          strategy: 'oauth_google',
        },
        oauth_facebook: {
          enabled: true,
          strategy: 'oauth_facebook',
        },
      },
      sign_up: {
        progressive: false,
      },
    } as UserSettingsJSON);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.window.location = location;
  });

  it('renders the sign up start screen', () => {
    const tree = renderJSON(<SignUpStart />);
    expect(tree).toMatchSnapshot();
  });

  it('renders the start screen, types the name, email, and password and creates a sign up attempt', async () => {
    render(<SignUpStart />);

    await userEvent.type(screen.getByLabelText('First name'), 'John');
    await userEvent.type(screen.getByLabelText('Last name'), 'Doe');
    await userEvent.type(screen.getByLabelText('Username'), 'jdoe');
    await userEvent.type(screen.getByLabelText('Email address'), 'jdoe@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'p@ssW0rd');

    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    await waitFor(() => {
      expect(mockCreateRequest).toHaveBeenCalledTimes(1);
      expect(mockCreateRequest).toHaveBeenCalledWith({
        email_address: 'jdoe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        password: 'p@ssW0rd',
        username: 'jdoe',
      });
      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('verify-email-address');
    });
  });

  it.each(['google', 'facebook'])(
    'renders the start screen, presses the %s button and starts an oauth flow',
    async (provider: string) => {
      const providerTitle = titleize(provider);

      render(<SignUpStart />);

      const regex = new RegExp(`Sign up with ${providerTitle}`, 'i');

      await userEvent.click(
        screen.getByRole('button', {
          name: regex,
        }),
      );

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

  it('renders the external account verification error if available', () => {
    const errorMsg = 'You cannot sign up with sokratis.vidros@gmail.com since this is an invitation-only application';

    (useCoreSignUp as jest.Mock).mockImplementation(() => {
      return {
        create: mockCreateRequest,
        verifications: {
          externalAccount: {
            error: {
              code: 'not_allowed_to_sign_up',
              longMessage: errorMsg,
            },
          },
        },
      };
    });

    render(<SignUpStart />);

    expect(screen.getByText(errorMsg)).toBeInTheDocument();
    expect(mockCreateRequest).toHaveBeenNthCalledWith(1, {});
  });

  it('only renders the SSO buttons if no other method is supported', () => {
    mockUserSettings = new UserSettings({
      attributes: {
        username: {
          enabled: false,
          required: false,
        },
        first_name: {
          enabled: false,
          required: false,
        },
        last_name: {
          enabled: false,
          required: false,
        },
        email_address: {
          enabled: true,
          required: false,
        },
        phone_number: {
          enabled: true,
          required: false,
        },
        password: {
          enabled: true,
          required: false,
        },
      },
      social: {
        oauth_google: {
          enabled: true,
          strategy: 'oauth_google',
        },
        oauth_facebook: {
          enabled: true,
          strategy: 'oauth_facebook',
        },
      },
      sign_up: {
        progressive: false,
      },
    } as UserSettingsJSON);

    render(<SignUpStart />);
    screen.getByRole('button', { name: /Google/ });
    screen.getByRole('button', { name: /Facebook/ });
    expect(screen.queryByRole('button', { name: 'Sign up' })).not.toBeInTheDocument();
    expect(screen.queryByText('Password')).not.toBeInTheDocument();
  });

  describe('when the user does not grant access to their Facebook account', () => {
    it('renders the external account verification error if available', () => {
      const errorMsg = 'You did not grant access to your Facebook account';

      (useCoreSignUp as jest.Mock).mockImplementation(() => {
        return {
          create: mockCreateRequest,
          verifications: {
            externalAccount: {
              error: {
                code: 'oauth_access_denied',
                longMessage: errorMsg,
              },
            },
          },
        };
      });

      render(<SignUpStart />);

      expect(screen.getByText(errorMsg)).toBeInTheDocument();
      expect(mockCreateRequest).toHaveBeenNthCalledWith(1, {});
    });
  });

  describe('when a miscellaneous oauth error occurs', () => {
    it('renders a generic error message', () => {
      const genericErrorMsg = 'Unable to complete action at this time. If the problem persists please contact support.';

      (useCoreSignUp as jest.Mock).mockImplementation(() => {
        return {
          create: mockCreateRequest,
          verifications: {
            externalAccount: {
              error: {
                code: 'omg_they_killed_kenny',
                longMessage: 'All hope is lost',
              },
            },
          },
        };
      });

      render(<SignUpStart />);

      expect(screen.getByText(genericErrorMsg)).toBeInTheDocument();
      expect(mockCreateRequest).toHaveBeenNthCalledWith(1, {});
    });
  });

  describe('with ticket parameter', () => {
    function runTokenTests(tokenType: string) {
      describe(`with ${tokenType}`, () => {
        beforeEach(() => {
          setWindowQueryParams([[tokenType, '123456']]);

          mockUserSettings = new UserSettings({
            attributes: {
              email_address: {
                enabled: true,
                required: true,
                used_for_first_factor: true,
              },
              phone_number: {
                enabled: false,
                required: false,
              },
              username: {
                enabled: false,
                required: false,
              },
              first_name: {
                enabled: false,
                required: false,
              },
              last_name: {
                enabled: false,
                required: false,
              },
              password: {
                enabled: true,
                required: false,
              },
            },
            sign_up: {
              progressive: false,
            },
          } as UserSettingsJSON);
        });

        afterEach(() => {
          setWindowQueryParams([]);
        });

        it('it auto-completes sign up flow if sign-up is complete after create', async () => {
          mockCreateRequest.mockImplementation(() =>
            Promise.resolve({
              status: 'complete',
              emailAddress: 'jdoe@example.com',
            }),
          );

          render(<SignUpStart />);

          await waitFor(() => {
            expect(mockSetSession).toHaveBeenCalled();
          });
        });

        it('it does not auto-complete sign up flow if sign up requirements are missing', async () => {
          // Require extra fields, like username and password
          mockUserSettings = new UserSettings({
            attributes: {
              email_address: {
                enabled: true,
                required: true,
                used_for_first_factor: true,
              },
              phone_number: {
                enabled: false,
                required: false,
              },
              username: {
                enabled: true,
                required: true,
              },
              first_name: {
                enabled: true,
                required: false,
              },
              last_name: {
                enabled: true,
                required: false,
              },
              password: {
                enabled: true,
                required: true,
              },
            },
            sign_up: {
              progressive: false,
            },
          } as UserSettingsJSON);

          mockCreateRequest.mockImplementation(() =>
            Promise.resolve({
              status: 'missing_requirements',
              emailAddress: 'jdoe@example.com',
              verifications: {
                emailAddress: {
                  status: 'unverified',
                },
              },
            }),
          );
          render(<SignUpStart />);
          await waitFor(() => {
            expect(mockSetSession).not.toHaveBeenCalled();
            // Required and optional fields are rendered
            screen.getByText(/First name/);
            screen.getByText(/Last name/);
            screen.getByText(/Password/);
            screen.getByText(/Username/);
          });
        });

        it('it displays email and waits for input if sign up is not complete', async () => {
          mockCreateRequest.mockImplementation(() =>
            Promise.resolve({
              status: 'missing_requirements',
              emailAddress: 'jdoe@example.com',
              verifications: {
                emailAddress: {
                  status: 'unverified',
                },
              },
            }),
          );
          render(<SignUpStart />);
          await waitFor(() => {
            const emailInput = screen.getByDisplayValue('jdoe@example.com');
            expect(emailInput).toBeDisabled();
          });
        });

        it('allows the user to submit optional fields before signing up', async () => {
          // First and last name are optional
          mockUserSettings = new UserSettings({
            attributes: {
              email_address: {
                enabled: true,
                required: true,
                used_for_first_factor: true,
              },
              phone_number: {
                enabled: false,
                required: false,
              },
              username: {
                enabled: false,
                required: false,
              },
              first_name: {
                enabled: true,
                required: false,
              },
              last_name: {
                enabled: true,
                required: false,
              },
              password: {
                enabled: true,
                required: false,
              },
            },
            sign_up: {
              progressive: false,
            },
          } as UserSettingsJSON);

          mockCreateRequest.mockImplementation(() =>
            Promise.resolve({
              status: 'complete',
              emailAddress: 'jdoe@example.com',
            }),
          );

          render(<SignUpStart />);

          await waitFor(() => {
            expect(mockSetSession).not.toHaveBeenCalled();
            screen.getByText(/First name/);
            screen.getByText(/Last name/);
            expect(screen.queryByText('Password')).not.toBeInTheDocument();
          });

          // Submit the form
          await userEvent.click(screen.getByRole('button', { name: 'Sign up' }));
          await waitFor(() => {
            expect(mockSetSession).toHaveBeenCalled();
          });
        });

        it('does not render the phone number field', async () => {
          mockUserSettings = new UserSettings({
            attributes: {
              email_address: {
                used_for_first_factor: false,
              },
              phone_number: {
                enabled: true,
                required: true,
                used_for_first_factor: true,
              },
              username: {
                enabled: false,
                required: false,
              },
              first_name: {
                enabled: false,
                required: false,
              },
              last_name: {
                enabled: false,
                required: false,
              },
              password: {
                enabled: true,
                required: false,
              },
            },
            sign_up: {
              progressive: false,
            },
          } as UserSettingsJSON);

          const { container } = render(<SignUpStart />);
          const labels = container.querySelectorAll('label');
          await waitFor(() => {
            expect(
              Array.from(labels)
                .map(l => l.htmlFor)
                .includes('phoneNumber'),
            ).toBeFalsy();
          });
        });
      });
    }

    runTokenTests('__clerk_invitation_token');
    runTokenTests('__clerk_ticket');
  });

  it('hides sign up form when no at least an oauth is enabled and no auth factor is enabled', () => {
    mockUserSettings = new UserSettings({
      attributes: {
        phone_number: {
          enabled: true,
          required: true,
          used_for_first_factor: false,
        },
        email_address: {
          used_for_first_factor: false,
        },
        password: {
          enabled: true,
          required: false,
        },
        username: {
          enabled: true,
          required: true,
        },
        first_name: {
          enabled: true,
          required: true,
        },
        last_name: {
          enabled: true,
          required: true,
        },
      },
      social: {
        oauth_google: {
          authenticatable: true,
          enabled: true,
          required: false,
          strategy: 'oauth_google',
        },
      },
      sign_up: {
        progressive: false,
      },
    } as UserSettingsJSON);

    render(<SignUpStart />);
    expect(screen.queryByRole('button', { name: 'Sign up' })).not.toBeInTheDocument();
    expect(screen.queryByText('Password')).not.toBeInTheDocument();
  });
});

describe('<SignUpStart/> Progressive Sign Up', () => {
  const mockUserSettingsProgressive = {
    attributes: {
      password: {
        enabled: true,
        required: false,
      },
      username: {
        enabled: false,
        required: false,
      },
      first_name: {
        enabled: false,
        required: false,
      },
      last_name: {
        enabled: false,
        required: false,
      },
    },
    sign_up: {
      progressive: true,
    },
  } as UserSettingsJSON;

  it('renders email input if required', () => {
    mockUserSettings = new UserSettings({
      ...mockUserSettingsProgressive,
      attributes: {
        ...mockUserSettingsProgressive.attributes,
        email_address: {
          enabled: true,
          required: true,
          used_for_first_factor: false,
        },
        phone_number: {
          enabled: false,
          required: false,
          used_for_first_factor: true,
        },
      },
    } as UserSettingsJSON);

    render(<SignUpStart />);

    expect(screen.getByText('Email address')).toBeInTheDocument();
    expect(screen.queryByText('Phone number')).not.toBeInTheDocument();
  });

  it('renders phone input if required', () => {
    mockUserSettings = new UserSettings({
      ...mockUserSettingsProgressive,
      attributes: {
        ...mockUserSettingsProgressive.attributes,
        email_address: {
          enabled: false,
          required: false,
          used_for_first_factor: true,
        },
        phone_number: {
          enabled: true,
          required: true,
          used_for_first_factor: false,
        },
      },
    } as UserSettingsJSON);

    render(<SignUpStart />);

    expect(screen.queryByText('Email address')).not.toBeInTheDocument();
    expect(screen.getByText('Phone number')).toBeInTheDocument();
  });

  it('renders both email & phone inputs if required', () => {
    mockUserSettings = new UserSettings({
      ...mockUserSettingsProgressive,
      attributes: {
        ...mockUserSettingsProgressive.attributes,
        email_address: {
          enabled: true,
          required: true,
          used_for_first_factor: false,
        },
        phone_number: {
          enabled: true,
          required: true,
          used_for_first_factor: false,
        },
      },
    } as UserSettingsJSON);

    render(<SignUpStart />);

    expect(screen.getByText('Email address')).toBeInTheDocument();
    expect(screen.getByText('Phone number')).toBeInTheDocument();
  });

  it('renders optional email/phone input if email OR phone', async () => {
    mockUserSettings = new UserSettings({
      ...mockUserSettingsProgressive,
      attributes: {
        ...mockUserSettingsProgressive.attributes,
        email_address: {
          enabled: true,
          required: false,
          used_for_first_factor: true,
        },
        phone_number: {
          enabled: true,
          required: false,
          used_for_first_factor: true,
        },
      },
    } as UserSettingsJSON);

    render(<SignUpStart />);

    expect(screen.getByText('Email address')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Use phone instead'));
    expect(screen.getByText('Phone number')).toBeInTheDocument();
  });
  it('renders required phone & optional email inputs', () => {
    mockUserSettings = new UserSettings({
      ...mockUserSettingsProgressive,
      attributes: {
        ...mockUserSettingsProgressive.attributes,
        email_address: {
          enabled: true,
          required: false,
          used_for_first_factor: true,
        },
        phone_number: {
          enabled: true,
          required: true,
          used_for_first_factor: true,
        },
      },
    } as UserSettingsJSON);

    render(<SignUpStart />);

    expect(screen.getByText('Email address')).toBeInTheDocument();
    expect(screen.getByText('Optional')).toBeInTheDocument();
    expect(screen.getByText('Phone number')).toBeInTheDocument();
  });
});

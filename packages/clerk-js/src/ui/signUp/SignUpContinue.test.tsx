import { render, renderJSON, screen, userEvent, waitFor } from '@clerk/shared/testUtils';
import { UserSettingsJSON } from '@clerk/types';
import { Session, UserSettings } from 'core/resources/internal';
import React from 'react';
import { useCoreSignUp } from 'ui/contexts';

import { SignUpContinue } from './SignUpContinue';

const navigateMock = jest.fn();
const mockUpdateRequest = jest.fn();
const mockSetSession = jest.fn();
let mockUserSettings: UserSettings;

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
      verifications: {
        emailAddress: {},
        phoneNumber: {},
        externalAccount: {},
      },
    })),
    useEnvironment: jest.fn(() => ({
      displayConfig: {
        applicationName: 'My test app',
        afterSignUpUrl: 'http://test.host/welcome',
        signUpUrl: 'http://test.host/sign-up',
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

describe('<SignUpContinue/>', () => {
  const { location } = window;

  beforeEach(() => {
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

  beforeEach(() => {
    (useCoreSignUp as jest.Mock).mockImplementation(() => {
      return {
        id: 'su_perman',
        update: mockUpdateRequest,
        verifications: {
          externalAccount: {
            status: 'verified',
          },
          emailAddress: {
            status: 'unverified',
          },
        },
        firstName: null,
        lastName: null,
        emailAddress: 'bryan@taken.com',
        phoneNumber: '+12125551001',
        username: 'bryanmills',
      };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.window.location = location;
  });

  it('renders the sign up continue screen', () => {
    const tree = renderJSON(<SignUpContinue />);
    expect(tree).toMatchSnapshot();
  });

  it('redirects to sign-up if no current sign-up exists', () => {
    (useCoreSignUp as jest.Mock).mockImplementation(() => {
      return {};
    });

    render(<SignUpContinue />);
    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('http://test.host/sign-up');
  });

  it('pre-fills form with unverified email', () => {
    render(<SignUpContinue />);

    expect(screen.getByLabelText('Email address')).toHaveValue('bryan@taken.com');
  });

  it('does not show oauth providers if we already have a verified external account', () => {
    render(<SignUpContinue />);

    expect(screen.queryByRole('button', { name: 'Sign up with Facebook' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sign up with Google' })).not.toBeInTheDocument();
  });

  it('patches the existing signup when user submits the form', async () => {
    (useCoreSignUp as jest.Mock).mockImplementation(() => {
      return {
        id: 'su_perman',
        update: mockUpdateRequest,
        verifications: {
          externalAccount: {
            status: 'verified',
          },
          emailAddress: {
            status: 'unverified',
          },
          phoneNumber: {
            status: 'verified',
          },
        },
        firstName: null,
        lastName: null,
        emailAddress: 'bryan@taken.com',
        phoneNumber: '+12125551001',
        username: 'bryanmills',
      };
    });

    mockUpdateRequest.mockImplementation(() =>
      Promise.resolve({
        firstName: 'Bryan',
        lastName: 'Mills',
        emailAddress: 'bryan@taken.com',
        status: 'missing_requirements',
        unverifiedFields: ['email_address'],
      }),
    );

    render(<SignUpContinue />);

    const firstNameInput = screen.getByLabelText('First name');
    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, 'Bryan');

    const lastNameInput = screen.getByLabelText('Last name');
    await userEvent.clear(lastNameInput);
    await userEvent.type(lastNameInput, 'Mills');

    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    await waitFor(() => {
      expect(mockUpdateRequest).toHaveBeenCalledTimes(1);
      expect(mockUpdateRequest).toHaveBeenCalledWith({
        first_name: 'Bryan',
        last_name: 'Mills',
        email_address: 'bryan@taken.com',
      });
      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('../verify-email-address');
    });
  });

  it('skips the email input if the email is already verified', () => {
    (useCoreSignUp as jest.Mock).mockImplementation(() => {
      return {
        id: 'su_perman',
        update: mockUpdateRequest,
        verifications: {
          externalAccount: {
            status: 'verified',
          },
          emailAddress: {
            status: 'verified',
          },
        },
        firstName: null,
        lastName: null,
        emailAddress: 'bryan@taken.com',
        phoneNumber: '+12125551001',
        username: 'bryanmills',
      };
    });

    render(<SignUpContinue />);

    expect(screen.queryByText('Email address')).not.toBeInTheDocument();
  });

  it('redirects to the phone verification step if the user completes their sign up by providing their phone', async () => {
    mockUserSettings = new UserSettings({
      attributes: {
        username: {
          enabled: true,
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
          required: true,
        },
        email_address: {
          enabled: true,
          required: false,
          used_for_first_factor: false,
        },
        phone_number: {
          enabled: true,
          required: true,
          used_for_first_factor: true,
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

    mockUpdateRequest.mockImplementation(() =>
      Promise.resolve({
        phoneNumber: '+15615551001',
        status: 'missing_requirements',
        unverifiedFields: ['phone_number'],
      }),
    );

    (useCoreSignUp as jest.Mock).mockImplementation(() => {
      return {
        id: 'su_perman',
        update: mockUpdateRequest,
        verifications: {
          externalAccount: {
            status: 'verified',
          },
          emailAddress: {
            status: 'verified',
          },
          phoneNumber: {
            status: 'unverified',
          },
        },
        emailAddress: 'bryan@taken.com',
        phoneNumber: '+15615551001',
        username: 'bryanmills',
      };
    });

    render(<SignUpContinue />);

    const phoneNumberInput = screen.getByRole('textbox');
    await userEvent.clear(phoneNumberInput);
    await userEvent.type(phoneNumberInput, '5615551001');

    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    await waitFor(() => {
      expect(mockUpdateRequest).toHaveBeenCalledTimes(1);
      expect(mockUpdateRequest).toHaveBeenCalledWith({
        phone_number: '+15615551001',
      });
      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith('../verify-phone-number');
    });
  });

  it('skips the password input if there is a verified external account', () => {
    render(<SignUpContinue />);

    expect(screen.queryByText('Password')).not.toBeInTheDocument();
  });

  it('skips already collected fields if they need no verification', () => {
    (useCoreSignUp as jest.Mock).mockImplementation(() => {
      return {
        id: 'su_perman',
        update: mockUpdateRequest,
        verifications: {
          externalAccount: {
            status: 'verified',
          },
          emailAddress: {
            status: 'unverified',
          },
        },
        firstName: 'Bryan',
        lastName: 'Mills',
        emailAddress: 'bryan@taken.com',
        phoneNumber: '+12125551001',
        username: 'bryanmills',
      };
    });

    render(<SignUpContinue />);

    expect(screen.queryByText('First name')).not.toBeInTheDocument();
    expect(screen.queryByText('Last name')).not.toBeInTheDocument();
    expect(screen.queryByText('Username')).not.toBeInTheDocument();
  });

  it('skips non-required fields', () => {
    mockUserSettings = new UserSettings({
      attributes: {
        username: {
          enabled: true,
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

    render(<SignUpContinue />);

    expect(screen.queryByText('Phone number')).not.toBeInTheDocument();
    expect(screen.queryByText('First name')).not.toBeInTheDocument();
    expect(screen.queryByText('Last name')).not.toBeInTheDocument();
    expect(screen.queryByText('Username')).not.toBeInTheDocument();
  });
});

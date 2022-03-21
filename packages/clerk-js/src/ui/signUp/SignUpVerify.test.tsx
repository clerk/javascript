import { render, renderJSON } from '@clerk/shared/testUtils';
import { AttributeData, SessionResource, SignUpResource, UserSettingsJSON } from '@clerk/types';
import { UserSettings } from 'core/resources/internal';
import React from 'react';

import { SignUpVerifyEmailAddress, SignUpVerifyPhoneNumber } from './SignUpVerify';

const navigateMock = jest.fn();
const mockSetSession = jest.fn();
const mockAttemptVerification = jest.fn();
const mockStartMagicLinkFlow = jest.fn(() => {
  return Promise.resolve({
    status: 'complete',
    verifications: {
      emailAddress: {
        verifiedFromTheSameClient: jest.fn(() => false),
        verifiedAtClient: '',
      },
    },
  } as any as SignUpResource);
});
let mockEmailAddressAttribute: Partial<AttributeData>;
let mockDisabledStrategies: string[] = [];

jest.mock('ui/router/RouteContext');

jest.mock('ui/contexts', () => {
  return {
    useEnvironment: jest.fn(() => ({
      displayConfig: {
        applicationName: 'My test app',
        afterSignUpUrl: 'http://test.host',
      },
      userSettings: new UserSettings({
        attributes: {
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
          username: {
            enabled: true,
            required: false,
          },
          email_address: mockEmailAddressAttribute,
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
      } as unknown as UserSettingsJSON),
      authConfig: { singleSessionMode: false },
    })),
    useCoreSession: () => {
      return { id: 'sess_id' } as SessionResource;
    },
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
        disabledStrategies: mockDisabledStrategies,
      };
    },
    useCoreSignUp: () => {
      return {
        emailAddress: 'jdoe@example.com',
        phoneNumber: '+123456789',
        verifications: {
          emailAddress: {
            status: 'unverified',
            verifiedFromTheSameClient: jest.fn(() => false),
          },
          phoneNumber: {
            status: 'unverified',
          },
        },
        attemptVerification: mockAttemptVerification,
        createMagicLinkFlow: () => ({
          startMagicLinkFlow: mockStartMagicLinkFlow,
          cancelMagicLinkFlow: () => {
            return;
          },
        }),
      };
    },
  };
});

jest.mock('ui/hooks', () => ({
  // @ts-ignore
  ...jest.requireActual('ui/hooks'),
  useNavigate: () => {
    return {
      navigate: navigateMock,
    };
  },
}));

describe('<SignUpVerify/>', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verify email address', () => {
    it('renders the OTP sign up verification form', () => {
      mockEmailAddressAttribute = {
        enabled: true,
        verifications: ['email_code'],
      };
      const tree = renderJSON(<SignUpVerifyEmailAddress />);
      expect(tree).toMatchSnapshot();
    });

    it('renders the magic link sign up verification form ', () => {
      mockEmailAddressAttribute = {
        enabled: true,
        verifications: ['email_link'],
      };
      const tree = renderJSON(<SignUpVerifyEmailAddress />);
      expect(tree).toMatchSnapshot();
    });

    it('can skip disabled verification strategies', () => {
      mockEmailAddressAttribute = {
        enabled: true,
        verifications: ['email_link'],
      };
      mockDisabledStrategies = ['email_link'];
      const { container } = render(<SignUpVerifyEmailAddress />);
      expect(container.querySelector('.cl-otp-input')).not.toBeNull();
    });
  });

  describe('verify phone number', () => {
    it('renders the OTP sign up verification form', () => {
      const tree = renderJSON(<SignUpVerifyPhoneNumber />);
      expect(tree).toMatchSnapshot();
    });
  });
});

import { noop, render, renderJSON } from '@clerk/shared/testUtils';
import {
  SessionResource,
  SignInStrategyName,
  SignUpResource,
} from '@clerk/types';
import React from 'react';

import {
  SignUpVerifyEmailAddress,
  SignUpVerifyPhoneNumber,
} from './SignUpVerify';

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
let mockFirstFactors: SignInStrategyName[];
let mockDisabledStrategies: string[] = [];

jest.mock('ui/router/RouteContext');

jest.mock('ui/contexts', () => {
  return {
    useEnvironment: jest.fn(() => ({
      displayConfig: {
        applicationName: 'My test app',
        afterSignUpUrl: 'http://test.host',
      },
      authConfig: {
        username: 'on',
        firstName: 'required',
        lastName: 'required',
        password: 'required',
        firstFactors: mockFirstFactors,
        identificationRequirements: [
          ['email_address', 'phone_address', 'oauth_google', 'oauth_facebook'],
        ],
      },
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
    it('renders the sign up verification form', async () => {
      mockFirstFactors = ['email_code', 'phone_code', 'password'];
      const tree = renderJSON(<SignUpVerifyEmailAddress />);
      expect(tree).toMatchSnapshot();
    });

    it('renders the sign up verification form but prefers email_link if exists', async () => {
      mockFirstFactors = ['email_code', 'phone_code', 'password', 'email_link'];
      const tree = renderJSON(<SignUpVerifyEmailAddress />);
      expect(tree).toMatchSnapshot();
    });

    it('can skip disabled verification strategies', async () => {
      mockFirstFactors = ['email_code', 'phone_code', 'password', 'email_link'];
      mockDisabledStrategies = ['email_link'];
      const { container } = render(<SignUpVerifyEmailAddress />);
      expect(container.querySelector('.cl-otp-input')).not.toBeNull();
    });

    xit(
      'renders the verifiation screen, types the OTP and attempts an email address verification',
      noop,
    );
  });

  describe('verify phone number', () => {
    it('renders the sign up verification form', async () => {
      const tree = renderJSON(<SignUpVerifyPhoneNumber />);
      expect(tree).toMatchSnapshot();
    });

    xit(
      'renders the verifiation screen, types the OTP and attempts a phone number verification',
      noop,
    );
  });
});

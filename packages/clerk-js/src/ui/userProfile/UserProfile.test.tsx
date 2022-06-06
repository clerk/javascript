import { renderJSONAfterFirstAct } from '@clerk/shared/testUtils';
import {
  Clerk,
  EmailAddressResource,
  ExternalAccountJSON,
  PhoneNumberResource,
  SessionActivity,
  SessionResource,
  SessionWithActivitiesResource,
  SignInResource,
  SignUpResource,
  VerificationJSON,
  Web3WalletResource,
} from '@clerk/types';
import { AuthConfig, ExternalAccount, UserSettings } from 'core/resources/internal';
import React from 'react';
import ReactDOM from 'react-dom';

import { UserProfile } from './UserProfile';

const mockNavigate = jest.fn();
const mockUseCoreSignIn = jest.fn(
  () =>
    ({
      status: null,
    } as SignInResource),
);
const mockUseCoreSignUp = jest.fn(
  () =>
    ({
      status: null,
    } as SignUpResource),
);

const mockUseCoreSessionList = jest.fn(() => [] as SessionResource[]);

jest.mock('ui/router/RouteContext');

jest.mock('ui/hooks', () => ({
  useNavigate: jest.fn(() => {
    return {
      navigate: mockNavigate,
    };
  }),
}));

const sessionWithActivities: Partial<SessionWithActivitiesResource> = {
  id: 'sess_id',
  lastActiveAt: new Date(),
  latestActivity: {
    id: 'session_activity_1/',
    country: 'greece',
    isMobile: false,
  } as any as SessionActivity,
};

const externalAccount = new ExternalAccount(
  {
    id: 'fbac_yolo',
    provider: 'facebook',
    approved_scopes: 'email',
    email_address: 'peter@gmail.com',
    first_name: 'Peter',
    last_name: 'Smith',
    provider_user_id: '10147951078263327',
    verification: { status: 'verified' } as VerificationJSON,
  } as unknown as ExternalAccountJSON,
  '/path',
);

jest.mock('ui/contexts', () => ({
  useCoreSignIn: () => mockUseCoreSignIn(),
  useCoreSignUp: () => mockUseCoreSignUp(),
  useCoreSessionList: () => mockUseCoreSessionList(),
  useCoreSession: jest.fn(),
  useEnvironment: jest.fn(() => ({
    displayConfig: {
      theme: {
        general: {
          color: '#000000',
        },
      },
    },
    userSettings: {
      attributes: {
        phone_number: {
          // this should be true since it is a first factor but keeping it false for the needs of the test case
          enabled: false,
          used_for_second_factor: true,
          second_factors: ['phone_code'],
        },
        email_address: {
          // this should be true since it is a first factor but keeping it false for the needs of the test case
          enabled: false,
          used_for_first_factor: true,
          first_factors: ['email_code'],
        },
        first_name: {
          enabled: true,
        },
        last_name: {
          enabled: true,
        },
        username: {
          enabled: false,
        },
        password: {
          enabled: false,
        },
        web3_wallet: {
          enabled: false,
        },
      },
      social: {
        oauth_google: {
          enabled: true,
          required: false,
          authenticatable: true,
          strategy: 'oauth_google',
        },
        oauth_facebook: {
          enabled: true,
          required: false,
          authenticatable: true,
          strategy: 'oauth_facebook',
        },
      },
    } as Partial<UserSettings>,
    authConfig: {
      singleSessionMode: true,
    } as Partial<AuthConfig>,
  })),
  withCoreUserGuard: (a: any) => a,
  useCoreUser: () => {
    return {
      twoFactorEnabled: () => true,
      externalAccounts: [externalAccount],
      verifiedExternalAccounts: [externalAccount],
      unverifiedExternalAccounts: [],
      phoneNumbers: [
        {
          id: '1',
          phoneNumber: '1234',
          verification: { status: 'verified' },
          linkedTo: [],
        } as any as PhoneNumberResource,
        {
          id: '2',
          phoneNumber: '5678',
          verification: { status: 'unverified' },
          linkedTo: [],
        } as any as PhoneNumberResource,
      ],
      emailAddresses: [
        {
          id: 1,
          emailAddress: 'clerk@clerk.dev',
          verification: { status: 'verified' },
          linkedTo: [],
        } as any as EmailAddressResource,
        {
          id: 2,
          emailAddress: 'clerk-unverified@clerk.dev',
          verification: { status: 'unverified' },
          linkedTo: [],
        } as any as EmailAddressResource,
      ],
      web3Wallets: [
        {
          web3Wallet: '0x0000000000000000000000000000000000000000',
          verification: { status: 'verified' },
        } as Web3WalletResource,
      ],
      getSessions: () => {
        return Promise.resolve([sessionWithActivities]);
      },
    };
  },
  useCoreClerk: () => {
    return {
      navigate: (to: string) => {
        mockNavigate(to);
        if (to) {
          // @ts-ignore
          window.location = new URL(to, window.location.origin);
        }
        return Promise.resolve();
      },
    } as Clerk;
  },
}));

// import { Link } from 'ui/router';

jest.mock('ui/router', () => {
  return {
    // TODO add real Route/Link
    // eslint-disable-next-line react/display-name
    Route: ({ children }: any) => <>{children}</>,
    // eslint-disable-next-line react/display-name
    Link: ({ children }: any) => <>{children}</>,
    useRouter: () => {
      return {
        params: { social_account_id: 'fbac_yolo' },
        resolve: () => {
          return {
            toURL: {
              href: 'http://www.ssddd.com',
            },
          };
        },
      };
    },
  };
});

// @ts-ignore
ReactDOM.createPortal = node => node;

describe('<UserProfileContent />', () => {
  it('renders the UserProfileContent', async () => {
    const tree = renderJSONAfterFirstAct(<UserProfile />);
    expect(tree).toMatchSnapshot();
  });
});

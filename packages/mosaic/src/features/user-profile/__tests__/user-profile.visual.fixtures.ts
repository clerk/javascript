import { serveFapi } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEmailAddress,
  fapiEnvironment,
  fapiExternalAccount,
  fapiPhoneNumber,
  fapiSession,
  fapiUser,
  fapiVerification,
  fapiWeb3Wallet,
} from '../../../__tests__/feature/fapi';

type VisualProfile = {
  firstName: string;
  lastName: string;
  username: string;
  emails: string[];
  phones: string[];
};

export const shortProfile: VisualProfile = {
  firstName: 'Alex',
  lastName: 'Morgan',
  username: 'alexmorgan',
  emails: ['alex@example.com', 'alex.work@example.com'],
  phones: ['+14155550123'],
};

export const longProfile: VisualProfile = {
  firstName: 'Alexandria',
  lastName: 'Montgomery-Wellington',
  username: 'alexandria.montgomery',
  emails: [
    'alexandria.montgomery@longcompanydomain.example',
    'alexandria.montgomery.personal@example.com',
    'alexandria.montgomery.notifications@example.com',
  ],
  phones: ['+14155550123', '+14155550456'],
};

export function serveVisualProfile(profile: VisualProfile) {
  const user = fapiUser({
    id: 'user_alex',
    first_name: profile.firstName,
    last_name: profile.lastName,
    username: profile.username,
    email_addresses: profile.emails.map((email_address, index) =>
      fapiEmailAddress({ id: `email_${index}`, email_address }),
    ),
    phone_numbers: profile.phones.map((phone_number, index) => fapiPhoneNumber({ id: `phone_${index}`, phone_number })),
    primary_phone_number_id: 'phone_0',
    web3_wallets: [
      fapiWeb3Wallet({
        id: 'wallet_primary',
        web3_wallet: '0x1234567890abcdef1234567890abcdef12345678',
        verification: fapiVerification('admin', { status: 'verified' }),
      }),
    ],
    primary_web3_wallet_id: 'wallet_primary',
    external_accounts: [
      fapiExternalAccount({ id: 'idn_google', provider: 'google', email_address: profile.emails[0] }),
    ],
  });
  serveFapi({
    environment: fapiEnvironment({
      attributes: {
        phone_number: { enabled: true },
        web3_wallet: { enabled: true },
      },
      user_settings: {
        social: {
          oauth_google: {
            enabled: true,
            required: false,
            authenticatable: true,
            strategy: 'oauth_google',
            name: 'Google',
            logo_url: null,
          },
        },
      },
    }),
    client: fapiClient([fapiSession({ id: 'session_alex', user })]),
  });
}

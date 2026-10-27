import { serveFapi } from '../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEmailAddress,
  fapiEnvironment,
  fapiPhoneNumber,
  fapiSession,
  fapiUser,
  fapiVerification,
  fapiWeb3Wallet,
} from '../../../__tests__/feature/fapi';
import { Dialog } from '../../../components/dialog';
import { UserProfileProvider } from '../user-profile.provider';
import { UserProfileView } from '../user-profile.view';
import { UserProfileBillingPanelView } from '../user-profile-billing-panel.view';
import { UserProfileConnectedAccountsSectionView } from '../user-profile-connected-accounts-section/user-profile-connected-accounts-section.view';
import { UserProfileDangerSection } from '../user-profile-danger-section/user-profile-danger-section';
import { UserProfileEmailSection } from '../user-profile-email-section/user-profile-email-section';
import { UserProfilePhoneSection } from '../user-profile-phone-section/user-profile-phone-section';
import { UserProfileProfilePanel } from '../user-profile-profile-panel';
import { UserProfileProfileSection } from '../user-profile-profile-section/user-profile-profile-section';
import { UserProfileSecurityPanelView } from '../user-profile-security-panel.view';
import { UserProfileWeb3WalletsSection } from '../user-profile-web3-wallets-section/user-profile-web3-wallets-section';

export function serveVisualProfile(longContent = false) {
  const emails = longContent
    ? [
        fapiEmailAddress({ id: 'email_primary', email_address: 'alexandria.montgomery@longcompanydomain.example' }),
        fapiEmailAddress({ id: 'email_secondary', email_address: 'alexandria.montgomery.personal@example.com' }),
        fapiEmailAddress({ id: 'email_tertiary', email_address: 'alexandria.montgomery.notifications@example.com' }),
      ]
    : [
        fapiEmailAddress({ id: 'email_primary', email_address: 'alex@example.com' }),
        fapiEmailAddress({ id: 'email_secondary', email_address: 'alex.work@example.com' }),
      ];
  const phones = longContent
    ? [
        fapiPhoneNumber({ id: 'phone_primary', phone_number: '+14155550123' }),
        fapiPhoneNumber({ id: 'phone_secondary', phone_number: '+14155550456' }),
      ]
    : [fapiPhoneNumber({ id: 'phone_primary', phone_number: '+14155550123' })];
  const user = fapiUser({
    id: 'user_alex',
    first_name: longContent ? 'Alexandria' : 'Alex',
    last_name: longContent ? 'Montgomery-Wellington' : 'Morgan',
    username: longContent ? 'alexandria.montgomery' : 'alexmorgan',
    email_addresses: emails,
    phone_numbers: phones,
    primary_phone_number_id: 'phone_primary',
    web3_wallets: [
      fapiWeb3Wallet({
        id: 'wallet_primary',
        web3_wallet: '0x1234567890abcdef1234567890abcdef12345678',
        verification: fapiVerification('admin', { status: 'verified' }),
      }),
    ],
    primary_web3_wallet_id: 'wallet_primary',
  });
  return serveFapi({
    environment: fapiEnvironment({
      attributes: {
        phone_number: { enabled: true },
        web3_wallet: { enabled: true },
      },
    }),
    client: fapiClient([fapiSession({ id: 'session_alex', user })]),
  });
}

export function VisualProfileOverlay() {
  return (
    <UserProfileProvider mode='modal'>
      <Dialog.Root defaultOpen>
        <Dialog.Popup variant='profile'>
          <UserProfileView
            activePage='account'
            onPageChange={() => {}}
            pages={{
              account: (
                <UserProfileProfilePanel>
                  <UserProfileProfileSection />
                  <UserProfileEmailSection />
                  <UserProfilePhoneSection />
                  <UserProfileConnectedAccountsSectionView
                    accounts={[
                      {
                        id: 'account_google',
                        provider: 'Google',
                        identifier: 'alex@example.com',
                        status: 'connected',
                      },
                    ]}
                    registerTrigger={() => null}
                  />
                  <UserProfileWeb3WalletsSection />
                  <UserProfileDangerSection />
                </UserProfileProfilePanel>
              ),
              security: <UserProfileSecurityPanelView />,
              billing: (
                <UserProfileBillingPanelView
                  subscription={{
                    planName: 'Pro',
                    priceLabel: '$24 / Month',
                    totalDueLabel: '$24.00',
                    renewsAtLabel: 'Renews November 26',
                  }}
                  paymentMethods={[]}
                  historyItems={[]}
                />
              ),
            }}
          />
        </Dialog.Popup>
      </Dialog.Root>
    </UserProfileProvider>
  );
}

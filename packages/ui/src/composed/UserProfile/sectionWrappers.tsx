import { useUser } from '@clerk/shared/react';
import { useContext, type ReactNode } from 'react';

import { getSecondFactors } from '@/ui/utils/mfa';

import { useEnvironment, useUserProfileContext } from '../../contexts';
import { assertContextExists } from '../../contexts/utils';
import { ActiveDevicesSection } from '../../components/UserProfile/ActiveDevicesSection';
import { ConnectedAccountsSection } from '../../components/UserProfile/ConnectedAccountsSection';
import { DeleteSection } from '../../components/UserProfile/DeleteSection';
import { EmailsSection } from '../../components/UserProfile/EmailsSection';
import { EnterpriseAccountsSection } from '../../components/UserProfile/EnterpriseAccountsSection';
import { MfaSection } from '../../components/UserProfile/MfaSection';
import { PasskeySection } from '../../components/UserProfile/PasskeySection';
import { PasswordSection } from '../../components/UserProfile/PasswordSection';
import { PhoneSection } from '../../components/UserProfile/PhoneSection';
import { UsernameSection } from '../../components/UserProfile/UsernameSection';
import { UserProfileSection } from '../../components/UserProfile/UserProfileSection';
import { Web3Section } from '../../components/UserProfile/Web3Section';
import { PageContext } from '../PageContext';

function useAssertPage(componentName: string) {
  const page = useContext(PageContext);
  assertContextExists(page, componentName);
  return page;
}

// --- Account sections ---

export function AccountProfile(): ReactNode {
  useAssertPage('AccountProfile');
  return <UserProfileSection />;
}

export function AccountUsername(): ReactNode {
  useAssertPage('AccountUsername');

  const { attributes } = useEnvironment().userSettings;
  const { immutableAttributes } = useUserProfileContext();

  if (!attributes.username?.enabled) return null;

  const isImmutable = immutableAttributes.has('username');
  return <UsernameSection isImmutable={isImmutable} />;
}

export function AccountEmails(): ReactNode {
  useAssertPage('AccountEmails');

  const { attributes } = useEnvironment().userSettings;
  const { shouldAllowIdentificationCreation, immutableAttributes } = useUserProfileContext();

  if (!attributes.email_address?.enabled) return null;

  const isImmutable = immutableAttributes.has('email_address');
  return (
    <EmailsSection
      shouldAllowCreation={shouldAllowIdentificationCreation && !isImmutable}
      shouldAllowDeletion={!isImmutable}
    />
  );
}

export function AccountPhone(): ReactNode {
  useAssertPage('AccountPhone');

  const { attributes } = useEnvironment().userSettings;
  const { shouldAllowIdentificationCreation, immutableAttributes } = useUserProfileContext();

  if (!attributes.phone_number?.enabled) return null;

  const isImmutable = immutableAttributes.has('phone_number');
  return (
    <PhoneSection
      shouldAllowCreation={shouldAllowIdentificationCreation && !isImmutable}
      shouldAllowDeletion={!isImmutable}
    />
  );
}

export function AccountConnectedAccounts(): ReactNode {
  useAssertPage('AccountConnectedAccounts');

  const { social } = useEnvironment().userSettings;
  const { shouldAllowIdentificationCreation } = useUserProfileContext();

  if (!social || Object.values(social).filter(p => p.enabled).length === 0) return null;

  return <ConnectedAccountsSection shouldAllowCreation={shouldAllowIdentificationCreation} />;
}

export function AccountEnterpriseAccounts(): ReactNode {
  useAssertPage('AccountEnterpriseAccounts');

  const { enterpriseSSO } = useEnvironment().userSettings;
  const { user } = useUser();

  if (!user || !enterpriseSSO.enabled) return null;

  return <EnterpriseAccountsSection />;
}

export function AccountWeb3(): ReactNode {
  useAssertPage('AccountWeb3');

  const { attributes } = useEnvironment().userSettings;
  const { shouldAllowIdentificationCreation } = useUserProfileContext();

  if (!attributes.web3_wallet?.enabled) return null;

  return <Web3Section shouldAllowCreation={shouldAllowIdentificationCreation} />;
}

// --- Security sections ---

export function SecurityPassword(): ReactNode {
  useAssertPage('SecurityPassword');

  const { instanceIsPasswordBased } = useEnvironment().userSettings;

  if (!instanceIsPasswordBased) return null;

  return <PasswordSection />;
}

export function SecurityPasskeys(): ReactNode {
  useAssertPage('SecurityPasskeys');

  const { attributes } = useEnvironment().userSettings;
  const { shouldAllowIdentificationCreation } = useUserProfileContext();

  if (!attributes.passkey?.enabled || !shouldAllowIdentificationCreation) return null;

  return <PasskeySection />;
}

export function SecurityMfa(): ReactNode {
  useAssertPage('SecurityMfa');

  const { attributes } = useEnvironment().userSettings;

  if (getSecondFactors(attributes).length === 0) return null;

  return <MfaSection />;
}

export function SecurityActiveDevices(): ReactNode {
  useAssertPage('SecurityActiveDevices');
  return <ActiveDevicesSection />;
}

export function SecurityDelete(): ReactNode {
  useAssertPage('SecurityDelete');

  const { user } = useUser();

  if (!user?.deleteSelfEnabled) return null;

  return <DeleteSection />;
}

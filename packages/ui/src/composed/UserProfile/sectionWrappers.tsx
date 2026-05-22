import { useUser } from '@clerk/shared/react';
import { useContext } from 'react';

import { getSecondFactors } from '@/ui/utils/mfa';

import { useEnvironment, useUserProfileContext } from '../../contexts';
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

function useRequirePage(componentName: string): boolean {
  const page = useContext(PageContext);
  if (!page) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn(`${componentName} must be used inside a page component (e.g. UserProfile.Account)`);
    }
    return false;
  }
  return true;
}

// --- Account sections ---

export function AccountProfile() {
  if (!useRequirePage('AccountProfile')) return null;
  return <UserProfileSection />;
}

export function AccountUsername() {
  if (!useRequirePage('AccountUsername')) return null;

  const { attributes } = useEnvironment().userSettings;
  const { immutableAttributes } = useUserProfileContext();

  if (!attributes.username?.enabled) return null;

  const isImmutable = immutableAttributes.has('username');
  return <UsernameSection isImmutable={isImmutable} />;
}

export function AccountEmails() {
  if (!useRequirePage('AccountEmails')) return null;

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

export function AccountPhone() {
  if (!useRequirePage('AccountPhone')) return null;

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

export function AccountConnectedAccounts() {
  if (!useRequirePage('AccountConnectedAccounts')) return null;

  const { social } = useEnvironment().userSettings;
  const { shouldAllowIdentificationCreation } = useUserProfileContext();

  if (!social || Object.values(social).filter(p => p.enabled).length === 0) return null;

  return <ConnectedAccountsSection shouldAllowCreation={shouldAllowIdentificationCreation} />;
}

export function AccountEnterpriseAccounts() {
  if (!useRequirePage('AccountEnterpriseAccounts')) return null;

  const { enterpriseSSO } = useEnvironment().userSettings;
  const { user } = useUser();

  if (!user || !enterpriseSSO.enabled) return null;

  return <EnterpriseAccountsSection />;
}

export function AccountWeb3() {
  if (!useRequirePage('AccountWeb3')) return null;

  const { attributes } = useEnvironment().userSettings;
  const { shouldAllowIdentificationCreation } = useUserProfileContext();

  if (!attributes.web3_wallet?.enabled) return null;

  return <Web3Section shouldAllowCreation={shouldAllowIdentificationCreation} />;
}

// --- Security sections ---

export function SecurityPassword() {
  if (!useRequirePage('SecurityPassword')) return null;

  const { instanceIsPasswordBased } = useEnvironment().userSettings;

  if (!instanceIsPasswordBased) return null;

  return <PasswordSection />;
}

export function SecurityPasskeys() {
  if (!useRequirePage('SecurityPasskeys')) return null;

  const { attributes } = useEnvironment().userSettings;
  const { shouldAllowIdentificationCreation } = useUserProfileContext();

  if (!attributes.passkey?.enabled || !shouldAllowIdentificationCreation) return null;

  return <PasskeySection />;
}

export function SecurityMfa() {
  if (!useRequirePage('SecurityMfa')) return null;

  const { attributes } = useEnvironment().userSettings;

  if (getSecondFactors(attributes).length === 0) return null;

  return <MfaSection />;
}

export function SecurityActiveDevices() {
  if (!useRequirePage('SecurityActiveDevices')) return null;
  return <ActiveDevicesSection />;
}

export function SecurityDelete() {
  if (!useRequirePage('SecurityDelete')) return null;

  const { user } = useUser();

  if (!user?.deleteSelfEnabled) return null;

  return <DeleteSection />;
}

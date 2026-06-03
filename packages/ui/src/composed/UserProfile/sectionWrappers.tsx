import type { ReactNode } from 'react';

import { UserProfileSection } from '../../components/UserProfile/UserProfileSection';
import {
  AccountUsername as _AccountUsername,
  AccountEmails as _AccountEmails,
  AccountPhone as _AccountPhone,
  AccountConnectedAccounts as _AccountConnectedAccounts,
  AccountEnterpriseAccounts as _AccountEnterpriseAccounts,
  AccountWeb3 as _AccountWeb3,
} from '../../components/UserProfile/AccountSections';
import {
  SecurityPassword as _SecurityPassword,
  SecurityPasskeys as _SecurityPasskeys,
  SecurityMfa as _SecurityMfa,
  SecurityDelete as _SecurityDelete,
} from '../../components/UserProfile/SecuritySections';
import { ActiveDevicesSection } from '../../components/UserProfile/ActiveDevicesSection';
import { useRequirePage } from '../useRequirePage';

// --- Account sections ---

export function AccountProfile(): ReactNode {
  if (!useRequirePage('AccountProfile')) return null;
  return <UserProfileSection />;
}

export function AccountUsername(): ReactNode {
  if (!useRequirePage('AccountUsername')) return null;
  return <_AccountUsername />;
}

export function AccountEmails(): ReactNode {
  if (!useRequirePage('AccountEmails')) return null;
  return <_AccountEmails />;
}

export function AccountPhone(): ReactNode {
  if (!useRequirePage('AccountPhone')) return null;
  return <_AccountPhone />;
}

export function AccountConnectedAccounts(): ReactNode {
  if (!useRequirePage('AccountConnectedAccounts')) return null;
  return <_AccountConnectedAccounts />;
}

export function AccountEnterpriseAccounts(): ReactNode {
  if (!useRequirePage('AccountEnterpriseAccounts')) return null;
  return <_AccountEnterpriseAccounts />;
}

export function AccountWeb3(): ReactNode {
  if (!useRequirePage('AccountWeb3')) return null;
  return <_AccountWeb3 />;
}

// --- Security sections ---

export function SecurityPassword(): ReactNode {
  if (!useRequirePage('SecurityPassword')) return null;
  return <_SecurityPassword />;
}

export function SecurityPasskeys(): ReactNode {
  if (!useRequirePage('SecurityPasskeys')) return null;
  return <_SecurityPasskeys />;
}

export function SecurityMfa(): ReactNode {
  if (!useRequirePage('SecurityMfa')) return null;
  return <_SecurityMfa />;
}

export function SecurityActiveDevices(): ReactNode {
  if (!useRequirePage('SecurityActiveDevices')) return null;
  return <ActiveDevicesSection />;
}

export function SecurityDelete(): ReactNode {
  if (!useRequirePage('SecurityDelete')) return null;
  return <_SecurityDelete />;
}

import { useUser } from '@clerk/shared/react';
import type { ReactNode } from 'react';

import { useEnvironment, useUserProfileContext } from '../../contexts';
import { ConnectedAccountsSection } from './ConnectedAccountsSection';
import { EmailsSection } from './EmailsSection';
import { EnterpriseAccountsSection } from './EnterpriseAccountsSection';
import { PhoneSection } from './PhoneSection';
import { UsernameSection } from './UsernameSection';
import { Web3Section } from './Web3Section';

export function AccountUsername(): ReactNode {
  const { attributes } = useEnvironment().userSettings;
  const { immutableAttributes } = useUserProfileContext();

  if (!attributes.username?.enabled) return null;

  const isImmutable = immutableAttributes.has('username');
  return <UsernameSection isImmutable={isImmutable} />;
}

export function AccountEmails(): ReactNode {
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
  const { social } = useEnvironment().userSettings;
  const { shouldAllowIdentificationCreation } = useUserProfileContext();

  if (!social || Object.values(social).filter(p => p.enabled).length === 0) return null;

  return <ConnectedAccountsSection shouldAllowCreation={shouldAllowIdentificationCreation} />;
}

export function AccountEnterpriseAccounts(): ReactNode {
  const { enterpriseSSO } = useEnvironment().userSettings;
  const { user } = useUser();

  if (!user || !enterpriseSSO.enabled) return null;

  return <EnterpriseAccountsSection />;
}

export function AccountWeb3(): ReactNode {
  const { attributes } = useEnvironment().userSettings;
  const { shouldAllowIdentificationCreation } = useUserProfileContext();

  if (!attributes.web3_wallet?.enabled) return null;

  return <Web3Section shouldAllowCreation={shouldAllowIdentificationCreation} />;
}

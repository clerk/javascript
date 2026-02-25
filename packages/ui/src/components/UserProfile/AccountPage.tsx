import { useUser } from '@clerk/shared/react';

import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';

import { useEnvironment, useUserProfileContext } from '../../contexts';
import { Col, descriptors, localizationKeys } from '../../customizables';
import { ConnectedAccountsSection } from './ConnectedAccountsSection';
import { EmailsSection } from './EmailsSection';
import { EnterpriseAccountsSection } from './EnterpriseAccountsSection';
import { PhoneSection } from './PhoneSection';
import { UsernameSection } from './UsernameSection';
import { UserProfileSection } from './UserProfileSection';
import { Web3Section } from './Web3Section';

export const AccountPage = withCardStateProvider(() => {
  const { attributes, social, enterpriseSSO } = useEnvironment().userSettings;
  const card = useCardState();
  const { user } = useUser();
  const { shouldAllowIdentificationCreation, immutableAttributes } = useUserProfileContext();

  const showUsername = attributes.username?.enabled;
  const showEmail = attributes.email_address?.enabled;
  const showPhone = attributes.phone_number?.enabled;
  const showConnectedAccounts = social && Object.values(social).filter(p => p.enabled).length > 0;
  const showEnterpriseAccounts = user && enterpriseSSO.enabled;
  const showWeb3 = attributes.web3_wallet?.enabled;

  const isEmailImmutable = immutableAttributes.has('email_address');
  const isPhoneImmutable = immutableAttributes.has('phone_number');
  const isUsernameImmutable = immutableAttributes.has('username');

  console.log('[clerk-ui] immutableAttributes:', [...immutableAttributes]);

  return (
    <Col
      elementDescriptor={descriptors.page}
      sx={t => ({ gap: t.space.$8, color: t.colors.$colorForeground })}
    >
      <Col
        elementDescriptor={descriptors.profilePage}
        elementId={descriptors.profilePage.setId('account')}
      >
        <Header.Root>
          <Header.Title
            localizationKey={localizationKeys('userProfile.start.headerTitle__account')}
            sx={t => ({ marginBottom: t.space.$4 })}
            textVariant='h2'
          />
        </Header.Root>

        <Card.Alert>{card.error}</Card.Alert>

        <UserProfileSection />
        {showUsername && <UsernameSection isImmutable={isUsernameImmutable} />}
        {showEmail && (
          <EmailsSection
            shouldAllowCreation={shouldAllowIdentificationCreation && !isEmailImmutable}
            shouldAllowDeletion={!isEmailImmutable}
          />
        )}
        {showPhone && (
          <PhoneSection
            shouldAllowCreation={shouldAllowIdentificationCreation && !isPhoneImmutable}
            shouldAllowDeletion={!isPhoneImmutable}
          />
        )}
        {showConnectedAccounts && <ConnectedAccountsSection shouldAllowCreation={shouldAllowIdentificationCreation} />}

        {/*TODO-STEP-UP: Verify that these work as expected*/}
        {showEnterpriseAccounts && <EnterpriseAccountsSection />}
        {showWeb3 && <Web3Section shouldAllowCreation={shouldAllowIdentificationCreation} />}
      </Col>
    </Col>
  );
});

import { useUser } from '@clerk/shared/react';

import { useEnvironment } from '../../contexts';
import { Col, descriptors, localizationKeys } from '../../customizables';
import { Card, Header, useCardState, withCardStateProvider } from '../../elements';
import { ConnectedAccountsSection } from './ConnectedAccountsSection';
import { EmailsSection } from './EmailsSection';
import { EnterpriseAccountsSection } from './EnterpriseAccountsSection';
import { PhoneSection } from './PhoneSection';
import { UsernameSection } from './UsernameSection';
import { UserProfileSection } from './UserProfileSection';
import { Web3Section } from './Web3Section';

export const AccountPage = withCardStateProvider(() => {
  const { attributes, social } = useEnvironment().userSettings;
  const card = useCardState();
  const { user } = useUser();

  const showUsername = attributes.username.enabled;
  const showEmail = attributes.email_address.enabled;
  const showPhone = attributes.phone_number.enabled;
  const showConnectedAccounts = social && Object.values(social).filter(p => p.enabled).length > 0;
  const showEnterpriseAccounts = user && user.enterpriseAccounts.length > 0;
  const showWeb3 = attributes.web3_wallet.enabled;

  const shouldAllowIdentificationCreation =
    !showEnterpriseAccounts ||
    !user?.samlAccounts?.some(
      samlAccount => samlAccount.active && samlAccount.samlConnection?.disableAdditionalIdentifications,
    );

  return (
    <Col
      elementDescriptor={descriptors.page}
      sx={t => ({ gap: t.space.$8, color: t.colors.$colorText })}
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
        {showUsername && <UsernameSection />}
        {showEmail && <EmailsSection shouldAllowCreation={shouldAllowIdentificationCreation} />}
        {showPhone && <PhoneSection shouldAllowCreation={shouldAllowIdentificationCreation} />}
        {showConnectedAccounts && <ConnectedAccountsSection shouldAllowCreation={shouldAllowIdentificationCreation} />}

        {/*TODO-STEP-UP: Verify that these work as expected*/}
        {showEnterpriseAccounts && <EnterpriseAccountsSection />}
        {showWeb3 && <Web3Section shouldAllowCreation={shouldAllowIdentificationCreation} />}
      </Col>
    </Col>
  );
});

import { useUser } from '@clerk/shared/react';

import { useEnvironment } from '../../contexts';
import { Col, descriptors, localizationKeys } from '../../customizables';
import { Card, Header, useCardState, withCardStateProvider } from '../../elements';
import { NavbarMenuButtonRow } from '../../elements/Navbar';
import { ActiveDevicesSection } from './ActiveDevicesSection';
import { ConnectedAccountsSection } from './ConnectedAccountsSection';
import { DeleteSection } from './DeleteSection';
import { EmailsSection } from './EmailSection';
import { EnterpriseAccountsSection } from './EnterpriseAccountsSection';
import { MfaSection } from './MfaSection';
import { PasswordSection } from './PasswordSection';
import { PhoneSection } from './PhoneSection';
import { UsernameSection } from './UsernameSection';
import { UserProfileSection } from './UserProfileSection';
import { getSecondFactors } from './utils';
import { Web3Section } from './Web3Section';

export const RootPage = withCardStateProvider(() => {
  const { attributes, saml, social, instanceIsPasswordBased } = useEnvironment().userSettings;
  const card = useCardState();
  const { user } = useUser();
  const showUsername = attributes.username.enabled;
  const showEmail = attributes.email_address.enabled;
  const showPhone = attributes.phone_number.enabled;
  const showConnectedAccounts = social && Object.values(social).filter(p => p.enabled).length > 0;
  const showSamlAccounts = saml && saml.enabled && user && user.samlAccounts.length > 0;
  const showWeb3 = attributes.web3_wallet.enabled;
  const showPassword = instanceIsPasswordBased;
  const showMfa = getSecondFactors(attributes).length > 0;
  const showDelete = user?.deleteSelfEnabled;

  return (
    <Col
      elementDescriptor={descriptors.page}
      sx={t => ({ gap: t.space.$8 })}
    >
      <NavbarMenuButtonRow />
      <Card.Alert>{card.error}</Card.Alert>
      <Col
        elementDescriptor={descriptors.profilePage}
        elementId={descriptors.profilePage.setId('account')}
      >
        <Header.Root id='cl-section-account'>
          <Header.Title
            localizationKey={localizationKeys('userProfile.start.headerTitle__account')}
            sx={t => ({ marginBottom: t.space.$4 })}
            textVariant='h2'
          />
        </Header.Root>

        <UserProfileSection />
        {showUsername && <UsernameSection />}
        {showEmail && <EmailsSection />}
        {showPhone && <PhoneSection />}
        {showConnectedAccounts && <ConnectedAccountsSection />}
        {showSamlAccounts && <EnterpriseAccountsSection />}
        {showWeb3 && <Web3Section />}
      </Col>
      <Col
        elementDescriptor={descriptors.profilePage}
        elementId={descriptors.profilePage.setId('security')}
        gap={8}
      >
        <Header.Root id='cl-section-security'>
          <Header.Title
            localizationKey={localizationKeys('userProfile.start.headerTitle__security')}
            textVariant='h1'
          />
        </Header.Root>
        {showPassword && <PasswordSection />}
        {showMfa && <MfaSection />}
        <ActiveDevicesSection />
        {showDelete && <DeleteSection />}
      </Col>
    </Col>
  );
});

import { useUser } from '@clerk/shared/react';

import { useEnvironment } from '../../contexts';
import { Col, descriptors, localizationKeys } from '../../customizables';
import { Card, Header, useCardState, withCardStateProvider } from '../../elements';
import { ActiveDevicesSection } from './ActiveDevicesSection';
import { DeleteSection } from './DeleteSection';
import { MfaSection } from './MfaSection';
import { PasswordSection } from './PasswordSection';
import { getSecondFactors } from './utils';

export const SecurityPage = withCardStateProvider(() => {
  const { attributes, instanceIsPasswordBased } = useEnvironment().userSettings;
  const card = useCardState();
  const { user } = useUser();
  const showPassword = instanceIsPasswordBased;
  const showMfa = getSecondFactors(attributes).length > 0;
  const showDelete = user?.deleteSelfEnabled;

  return (
    <Col
      elementDescriptor={descriptors.page}
      sx={t => ({ gap: t.space.$8 })}
    >
      <Card.Alert>{card.error}</Card.Alert>
      <Col
        elementDescriptor={descriptors.profilePage}
        elementId={descriptors.profilePage.setId('security')}
      >
        <Header.Root>
          <Header.Title
            localizationKey={localizationKeys('userProfile.headerTitle__security')}
            sx={t => ({ marginBottom: t.space.$4 })}
            textVariant='h2'
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

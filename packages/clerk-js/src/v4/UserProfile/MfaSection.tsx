import { PhoneNumberResource } from '@clerk/types';
import React from 'react';

import { useCoreUser, useEnvironment } from '../../ui/contexts';
import { useNavigate } from '../../ui/hooks';
import { Badge, Col, Icon } from '../customizables';
import { FormattedPhoneNumberText, useCardState } from '../elements';
import { AuthenticatorApp, Mobile } from '../icons';
import { handleError } from '../utils';
import { LinkButtonWithDescription } from './LinkButtonWithDescription';
import { ProfileSection } from './Section';
import { UserProfileAccordion } from './UserProfileAccordion';
import { AddBlockButton } from './UserProfileBlockButtons';
import { defaultFirst, getSecondFactors } from './utils';

export const MfaSection = () => {
  const { navigate } = useNavigate();
  const {
    userSettings: { attributes },
  } = useEnvironment();
  const user = useCoreUser();

  const secondFactors = getSecondFactors(attributes);

  const mfaPhones = user.phoneNumbers
    .filter(ph => ph.verification.status === 'verified')
    .filter(ph => ph.reservedForSecondFactor)
    .sort(defaultFirst);

  return (
    <ProfileSection
      title='Multifactor authentication'
      id='mfa'
    >
      {secondFactors.includes('totp') && user.totpEnabled && <MfaTOTPAccordion />}

      {secondFactors.includes('phone_code') &&
        mfaPhones.map(phone => (
          <MfaPhoneCodeAccordion
            key={phone.id}
            phone={phone}
          />
        ))}
      <AddBlockButton onClick={() => navigate('multi-factor')}>Add multifactor method</AddBlockButton>
    </ProfileSection>
  );
};

const MfaTOTPAccordion = () => {
  const { navigate } = useNavigate();

  return (
    <UserProfileAccordion
      icon={
        <Icon
          icon={AuthenticatorApp}
          sx={theme => ({ color: theme.colors.$blackAlpha700 })}
        />
      }
      title='Authenticator application'
    >
      <Col gap={4}>
        <LinkButtonWithDescription
          title='Remove'
          subtitle='Remove authenticator application from the multifactor authentication methods'
          actionLabel='Remove authenticator application'
          colorScheme='danger'
          onClick={() => navigate(`multi-factor/totp/remove`)}
        />
      </Col>
    </UserProfileAccordion>
  );
};

const MfaPhoneCodeAccordion = (props: { phone: PhoneNumberResource }) => {
  const { phone } = props;
  const { navigate } = useNavigate();
  const card = useCardState();
  const isDefault = phone.defaultSecondFactor;

  return (
    <UserProfileAccordion
      icon={
        <Icon
          icon={Mobile}
          sx={theme => ({ color: theme.colors.$blackAlpha700 })}
        />
      }
      title={
        <>
          SMS Code <FormattedPhoneNumberText value={phone.phoneNumber} />
        </>
      }
      badge={isDefault ? <Badge>Default</Badge> : undefined}
    >
      <Col gap={4}>
        <LinkButtonWithDescription
          title={isDefault ? 'Default factor' : 'Set as Default factor'}
          subtitle={
            isDefault
              ? 'This factor will be used as the default multifactor authentication method when signing in.'
              : 'Set this factor as the default factor to use it as the default multifactor authentication method when signing in.'
          }
          actionLabel={!isDefault ? 'Set as primary' : undefined}
          onClick={() => phone.makeDefaultSecondFactor().catch(err => handleError(err, [], card.setError))}
        />

        <LinkButtonWithDescription
          title='Remove'
          subtitle='Remove this phone number from the multifactor authentication methods'
          actionLabel='Remove phone number'
          colorScheme='danger'
          onClick={() => navigate(`multi-factor/${phone.id}/remove`)}
        />
      </Col>
    </UserProfileAccordion>
  );
};

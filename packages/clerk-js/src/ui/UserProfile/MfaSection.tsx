import React from 'react';

import { useCoreUser, useEnvironment } from '../contexts';
import { localizationKeys } from '../customizables';
import { useNavigate } from '../hooks';
import { MfaPhoneCodeAccordion } from './MfaPhoneCodeAccordion';
import { MfaTOTPAccordion } from './MfaTOTPAccordion';
import { ProfileSection } from './Section';
import { AddBlockButton } from './UserProfileBlockButtons';
import { defaultFirst, getSecondFactors, getSecondFactorsAvailableToAdd } from './utils';

export const MfaSection = () => {
  const { navigate } = useNavigate();
  const {
    userSettings: { attributes },
  } = useEnvironment();
  const user = useCoreUser();

  const secondFactors = getSecondFactors(attributes);
  const secondFactorsAvailableToAdd = getSecondFactorsAvailableToAdd(attributes, user);

  const showTOTP = secondFactors.includes('totp') && user.totpEnabled;

  const mfaPhones = user.phoneNumbers
    .filter(ph => ph.verification.status === 'verified')
    .filter(ph => ph.reservedForSecondFactor)
    .sort(defaultFirst);

  return (
    <ProfileSection
      title={localizationKeys('userProfile.start.mfaSection.title')}
      id='mfa'
    >
      {showTOTP && <MfaTOTPAccordion />}

      {secondFactors.includes('phone_code') &&
        mfaPhones.map(phone => (
          <MfaPhoneCodeAccordion
            key={phone.id}
            phone={phone}
            showTOTP={showTOTP}
          />
        ))}

      {secondFactorsAvailableToAdd.length > 0 && (
        <AddBlockButton
          textLocalizationKey={localizationKeys('userProfile.start.mfaSection.primaryButton')}
          id='mfa'
          onClick={() => navigate('multi-factor')}
        />
      )}
    </ProfileSection>
  );
};

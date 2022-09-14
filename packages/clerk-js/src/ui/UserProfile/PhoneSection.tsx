import { PhoneNumberResource } from '@clerk/types';
import React from 'react';

import { useCoreUser } from '../contexts';
import { Badge, Col, localizationKeys, Text } from '../customizables';
import { useCardState } from '../elements';
import { useNavigate } from '../hooks';
import { getFlagEmojiFromCountryIso, handleError, parsePhoneString, stringToFormattedPhoneString } from '../utils';
import { LinkButtonWithDescription } from './LinkButtonWithDescription';
import { ProfileSection } from './Section';
import { UserProfileAccordion } from './UserProfileAccordion';
import { AddBlockButton } from './UserProfileBlockButtons';
import { primaryIdentificationFirst } from './utils';

export const PhoneSection = () => {
  const user = useCoreUser();
  const { navigate } = useNavigate();

  return (
    <ProfileSection
      title={localizationKeys('userProfile.sectionTitle__phoneNumbers')}
      id='phoneNumbers'
    >
      {user.phoneNumbers.sort(primaryIdentificationFirst(user.primaryPhoneNumberId)).map(phone => (
        <PhoneAccordion
          key={phone.id}
          phone={phone}
        />
      ))}

      <AddBlockButton
        textLocalizationKey={localizationKeys('userProfile.sectionPrimaryButton__phoneNumbers')}
        id='password'
        onClick={() => navigate('phone-number')}
      />
    </ProfileSection>
  );
};

const PhoneAccordion = ({ phone }: { phone: PhoneNumberResource }) => {
  const card = useCardState();
  const user = useCoreUser();
  const { navigate } = useNavigate();
  const isPrimary = user.primaryPhoneNumberId === phone.id;
  const isVerified = phone.verification.status === 'verified';
  const setPrimary = () => {
    return user.update({ primaryPhoneNumberId: phone.id }).catch(e => handleError(e, [], card.setError));
  };

  const formattedPhone = stringToFormattedPhoneString(phone.phoneNumber);
  const flag = getFlagEmojiFromCountryIso(parsePhoneString(phone.phoneNumber).iso);

  return (
    <UserProfileAccordion
      icon={
        <Text
          as='span'
          sx={theme => ({ fontSize: theme.fontSizes.$sm })}
        >
          {flag}
        </Text>
      }
      title={formattedPhone}
      badge={isPrimary ? <Badge localizationKey={localizationKeys('badge__primary')} /> : undefined}
    >
      <Col gap={4}>
        {isPrimary && isVerified && (
          <LinkButtonWithDescription
            title='Primary phone number'
            subtitle='This phone number is the primary phone number'
          />
        )}
        {isPrimary && !isVerified && (
          <LinkButtonWithDescription
            title='Primary phone number'
            titleLabel={<Badge colorScheme='warning'>Unverified</Badge>}
            subtitle='This phone number is the primary phone number'
            actionLabel='Complete verification'
            onClick={() => navigate(`phone-number/${phone.id}`)}
          />
        )}
        {!isPrimary && isVerified && (
          <LinkButtonWithDescription
            title='Set as primary phone number'
            subtitle='Set this phone number as the primary to receive communications regarding your account.'
            actionLabel='Set as primary'
            onClick={setPrimary}
          />
        )}
        {!isPrimary && !isVerified && (
          <LinkButtonWithDescription
            title='Unverified phone number'
            titleLabel={
              <Badge
                localizationKey={localizationKeys('badge__unverified')}
                colorScheme='warning'
              />
            }
            subtitle='This phone number has not been verified and may be limited in functionality'
            actionLabel='Complete verification'
            onClick={() => navigate(`phone-number/${phone.id}`)}
          />
        )}
        <LinkButtonWithDescription
          title='Remove'
          subtitle='Delete this phone number and remove it from your account'
          actionLabel='Remove phone number'
          colorScheme='danger'
          onClick={() => navigate(`phone-number/${phone.id}/remove`)}
        />
      </Col>
    </UserProfileAccordion>
  );
};

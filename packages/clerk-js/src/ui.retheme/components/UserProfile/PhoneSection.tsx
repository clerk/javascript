import { useUser } from '@clerk/shared/react';
import type { PhoneNumberResource } from '@clerk/types';

import { Badge, Col, localizationKeys, Text } from '../../customizables';
import { ProfileSection, useCardState } from '../../elements';
import { useRouter } from '../../router';
import { getFlagEmojiFromCountryIso, handleError, parsePhoneString, stringToFormattedPhoneString } from '../../utils';
import { LinkButtonWithDescription } from './LinkButtonWithDescription';
import { UserProfileAccordion } from './UserProfileAccordion';
import { AddBlockButton } from './UserProfileBlockButtons';
import { primaryIdentificationFirst } from './utils';

export const PhoneSection = () => {
  const { user } = useUser();
  const { navigate } = useRouter();

  return (
    <ProfileSection
      title={localizationKeys('userProfile.start.phoneNumbersSection.title')}
      id='phoneNumbers'
    >
      {user?.phoneNumbers.sort(primaryIdentificationFirst(user.primaryPhoneNumberId)).map(phone => (
        <PhoneAccordion
          key={phone.id}
          phone={phone}
        />
      ))}

      <AddBlockButton
        textLocalizationKey={localizationKeys('userProfile.start.phoneNumbersSection.primaryButton')}
        id='password'
        onClick={() => navigate('phone-number')}
      />
    </ProfileSection>
  );
};

const PhoneAccordion = ({ phone }: { phone: PhoneNumberResource }) => {
  const card = useCardState();
  const { user } = useUser();
  const { navigate } = useRouter();

  if (!user) {
    return null;
  }

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
      badge={
        <>
          {isPrimary && <Badge localizationKey={localizationKeys('badge__primary')} />}
          {!isVerified && (
            <Badge
              localizationKey={localizationKeys('badge__unverified')}
              colorScheme='danger'
            />
          )}
        </>
      }
    >
      <Col gap={4}>
        {isPrimary && isVerified && (
          <LinkButtonWithDescription
            title={localizationKeys('userProfile.start.phoneNumbersSection.detailsTitle__primary')}
            subtitle={localizationKeys('userProfile.start.phoneNumbersSection.detailsSubtitle__primary')}
          />
        )}
        {isPrimary && !isVerified && (
          <LinkButtonWithDescription
            title={localizationKeys('userProfile.start.phoneNumbersSection.detailsTitle__primary')}
            subtitle={localizationKeys('userProfile.start.phoneNumbersSection.detailsSubtitle__primary')}
            actionLabel={localizationKeys('userProfile.start.phoneNumbersSection.detailsAction__primary')}
            onClick={() => navigate(`phone-number/${phone.id}`)}
          />
        )}
        {!isPrimary && isVerified && (
          <LinkButtonWithDescription
            title={localizationKeys('userProfile.start.phoneNumbersSection.detailsTitle__nonPrimary')}
            subtitle={localizationKeys('userProfile.start.phoneNumbersSection.detailsSubtitle__nonPrimary')}
            actionLabel={localizationKeys('userProfile.start.phoneNumbersSection.detailsAction__nonPrimary')}
            onClick={setPrimary}
          />
        )}
        {!isPrimary && !isVerified && (
          <LinkButtonWithDescription
            title={localizationKeys('userProfile.start.phoneNumbersSection.detailsTitle__unverified')}
            subtitle={localizationKeys('userProfile.start.phoneNumbersSection.detailsSubtitle__unverified')}
            actionLabel={localizationKeys('userProfile.start.phoneNumbersSection.detailsAction__unverified')}
            onClick={() => navigate(`phone-number/${phone.id}`)}
          />
        )}
        <LinkButtonWithDescription
          title={localizationKeys('userProfile.start.phoneNumbersSection.destructiveActionTitle')}
          subtitle={localizationKeys('userProfile.start.phoneNumbersSection.destructiveActionSubtitle')}
          actionLabel={localizationKeys('userProfile.start.phoneNumbersSection.destructiveAction')}
          variant='linkDanger'
          onClick={() => navigate(`phone-number/${phone.id}/remove`)}
        />
      </Col>
    </UserProfileAccordion>
  );
};

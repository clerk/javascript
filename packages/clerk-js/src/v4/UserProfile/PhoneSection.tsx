import { PhoneNumberResource } from '@clerk/types';
import React from 'react';

import { useCoreUser } from '../../ui/contexts';
import { Col } from '../customizables';
import { AccordionItem, FormattedPhoneNumber } from '../elements';
import { LinkButtonWithDescription } from './LinkButtonWithDescription';
import { ProfileSection } from './Section';
import { AddBlockButton } from './UserProfileBlockButtons';
import { primaryIdentificationFirst } from './utils';

export const PhoneSection = () => {
  const user = useCoreUser();
  const phones = [...user.phoneNumbers];

  return (
    <ProfileSection
      title='Phone numbers'
      id='phoneNumbers'
    >
      {phones.sort(primaryIdentificationFirst(user.primaryPhoneNumberId)).map(phone => (
        <PhoneAccordion
          key={phone.id}
          {...phone}
        />
      ))}

      <AddBlockButton>Add a phone number</AddBlockButton>
    </ProfileSection>
  );
};

const PhoneAccordion = (phone: PhoneNumberResource) => {
  const user = useCoreUser();
  const isPrimary = user.primaryPhoneNumberId === phone.id;

  return (
    <AccordionItem title={<FormattedPhoneNumber value={phone.phoneNumber} />}>
      <Col gap={4}>
        <LinkButtonWithDescription
          title='Primary phone number'
          subtitle={
            isPrimary
              ? 'This phone number is the primary phone number'
              : 'Set this phone number as the primary to receive communications regarding your account.'
          }
          actionLabel={!isPrimary ? 'Set as primary' : undefined}
        />
        <LinkButtonWithDescription
          title='Remove'
          subtitle='Delete this phone number and remove it from your account'
          actionLabel='Remove phone number'
          colorScheme='danger'
        />
      </Col>
    </AccordionItem>
  );
};

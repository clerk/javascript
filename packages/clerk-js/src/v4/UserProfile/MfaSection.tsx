import { PhoneNumberResource } from '@clerk/types/src';
import React from 'react';

import { useCoreUser } from '../../ui/contexts';
import { Col, Flex, Icon, Text } from '../customizables';
import { AccordionItem, FormattedPhoneNumberText } from '../elements';
import { Mobile } from '../icons';
import { LinkButtonWithDescription } from './LinkButtonWithDescription';
import { ProfileSection } from './Section';
import { AddBlockButton } from './UserProfileBlockButtons';

export const MfaSection = () => {
  const user = useCoreUser();
  const mfaPhones = user.phoneNumbers
    .filter(ph => ph.verification.status === 'verified')
    .filter(ph => ph.reservedForSecondFactor);

  return (
    <ProfileSection
      title='Multi-factor authentication'
      id='mfa'
    >
      {mfaPhones.map(phone => (
        <MfaAccordion
          key={phone.id}
          phone={phone}
        />
      ))}
      <AddBlockButton>Add multi-factor</AddBlockButton>
    </ProfileSection>
  );
};

const MfaAccordion = (props: { phone: PhoneNumberResource }) => {
  const { phone } = props;
  const isPrimary = false;

  return (
    <AccordionItem
      title={
        <Flex
          gap={2}
          align='center'
        >
          <Icon
            icon={Mobile}
            sx={theme => ({ color: theme.colors.$blackAlpha700 })}
          />
          <Text>SMS Code</Text>
          <FormattedPhoneNumberText value={phone.phoneNumber} />
        </Flex>
      }
    >
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

import { EmailAddressResource } from '@clerk/types';
import React from 'react';

import { useCoreUser } from '../../ui/contexts';
import { Col } from '../customizables';
import { AccordionItem } from '../elements';
import { LinkButtonWithDescription } from './LinkButtonWithDescription';
import { ProfileSection } from './Section';
import { AddBlockButton } from './UserProfileBlockButtons';
import { primaryIdentificationFirst } from './utils';

export const EmailsSection = () => {
  const user = useCoreUser();
  const emails = [...user.emailAddresses];

  return (
    <ProfileSection
      title='Email addresses'
      id='emailAddresses'
    >
      {emails.sort(primaryIdentificationFirst(user.primaryEmailAddressId)).map(email => (
        <EmailAccordion
          key={email.id}
          {...email}
        />
      ))}

      <AddBlockButton>Add an email address</AddBlockButton>
    </ProfileSection>
  );
};

const EmailAccordion = (emailAddress: EmailAddressResource) => {
  const user = useCoreUser();
  const isPrimary = user.primaryEmailAddressId === emailAddress.id;

  return (
    <AccordionItem title={emailAddress.emailAddress}>
      <Col gap={4}>
        <LinkButtonWithDescription
          title='Primary email address'
          subtitle={
            isPrimary
              ? 'This email address is the primary email address'
              : 'Set this email address as the primary to receive communications regarding your account.'
          }
          label={!isPrimary ? 'Set as primary' : undefined}
        />
        <LinkButtonWithDescription
          title='Remove'
          subtitle='Delete this email address and remove it from your account'
          label={'Remove email address'}
          colorScheme='danger'
        />
      </Col>
    </AccordionItem>
  );
};

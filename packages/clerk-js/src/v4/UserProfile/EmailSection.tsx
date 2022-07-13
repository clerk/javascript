import { EmailAddressResource } from '@clerk/types';
import React from 'react';

import { useCoreUser } from '../../ui/contexts';
import { useNavigate } from '../../ui/hooks/useNavigate';
import { Badge, Col } from '../customizables';
import { useCardState } from '../elements';
import { handleError } from '../utils';
import { LinkButtonWithDescription } from './LinkButtonWithDescription';
import { ProfileSection } from './Section';
import { UserProfileAccordion } from './UserProfileAccordion';
import { AddBlockButton } from './UserProfileBlockButtons';
import { primaryIdentificationFirst } from './utils';

export const EmailsSection = () => {
  const { navigate } = useNavigate();
  const user = useCoreUser();

  return (
    <ProfileSection
      title='Email addresses'
      id='emailAddresses'
    >
      {user.emailAddresses.sort(primaryIdentificationFirst(user.primaryEmailAddressId)).map(email => (
        <EmailAccordion
          key={email.id}
          email={email}
        />
      ))}

      <AddBlockButton onClick={() => navigate('email-address')}>Add an email address</AddBlockButton>
    </ProfileSection>
  );
};

const EmailAccordion = ({ email }: { email: EmailAddressResource }) => {
  const card = useCardState();
  const user = useCoreUser();
  const { navigate } = useNavigate();
  const isPrimary = user.primaryEmailAddressId === email.id;
  const isVerified = email.verification.status === 'verified';
  const setPrimary = () => {
    return user.update({ primaryEmailAddressId: email.id }).catch(e => handleError(e, [], card.setError));
  };

  return (
    <UserProfileAccordion title={email.emailAddress}>
      <Col gap={4}>
        {isPrimary && (
          <LinkButtonWithDescription
            title='Primary email address'
            titleLabel={<Badge>Primary</Badge>}
            subtitle='This email address is the primary email address'
          />
        )}
        {!isPrimary && isVerified && (
          <LinkButtonWithDescription
            title='Set as primary email address'
            subtitle='Set this email address as the primary to receive communications regarding your account.'
            actionLabel='Set as primary'
            onClick={setPrimary}
          />
        )}
        {!isPrimary && !isVerified && (
          <LinkButtonWithDescription
            title='Unverified email address'
            titleLabel={<Badge colorScheme='warning'>Unverified</Badge>}
            subtitle='This email address has not been verified and may be limited in functionality'
            actionLabel='Complete verification'
            onClick={() => navigate(`email-address/${email.id}`)}
          />
        )}
        <LinkButtonWithDescription
          title='Remove'
          subtitle='Delete this email address and remove it from your account'
          actionLabel='Remove email address'
          colorScheme='danger'
          onClick={() => navigate(`email-address/${email.id}/remove`)}
        />
      </Col>
    </UserProfileAccordion>
  );
};

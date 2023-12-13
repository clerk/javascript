import { useUser } from '@clerk/shared/react';
import type { EmailAddressResource } from '@clerk/types';

import { Badge, Col, localizationKeys } from '../../customizables';
import { ProfileSection, useCardState } from '../../elements';
import { useRouter } from '../../router';
import { handleError } from '../../utils';
import { LinkButtonWithDescription } from './LinkButtonWithDescription';
import { UserProfileAccordion } from './UserProfileAccordion';
import { AddBlockButton } from './UserProfileBlockButtons';
import { primaryIdentificationFirst } from './utils';

export const EmailsSection = () => {
  const { navigate } = useRouter();
  const { user } = useUser();

  return (
    <ProfileSection
      title={localizationKeys('userProfile.start.emailAddressesSection.title')}
      id='emailAddresses'
    >
      {user?.emailAddresses.sort(primaryIdentificationFirst(user.primaryEmailAddressId)).map(email => (
        <EmailAccordion
          key={email.id}
          email={email}
        />
      ))}

      <AddBlockButton
        textLocalizationKey={localizationKeys('userProfile.start.emailAddressesSection.primaryButton')}
        id='emailAddresses'
        onClick={() => navigate('email-address')}
      />
    </ProfileSection>
  );
};

const EmailAccordion = ({ email }: { email: EmailAddressResource }) => {
  const card = useCardState();
  const { user } = useUser();
  const { navigate } = useRouter();
  const isPrimary = user?.primaryEmailAddressId === email.id;
  const isVerified = email.verification.status === 'verified';
  const setPrimary = () => {
    return user.update({ primaryEmailAddressId: email.id }).catch(e => handleError(e, [], card.setError));
  };

  return (
    <UserProfileAccordion
      title={email.emailAddress}
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
            title={localizationKeys('userProfile.start.emailAddressesSection.detailsTitle__primary')}
            subtitle={localizationKeys('userProfile.start.emailAddressesSection.detailsSubtitle__primary')}
          />
        )}
        {isPrimary && !isVerified && (
          <LinkButtonWithDescription
            title={localizationKeys('userProfile.start.emailAddressesSection.detailsTitle__primary')}
            subtitle={localizationKeys('userProfile.start.emailAddressesSection.detailsSubtitle__primary')}
            actionLabel={localizationKeys('userProfile.start.emailAddressesSection.detailsAction__primary')}
            onClick={() => navigate(`email-address/${email.id}`)}
          />
        )}
        {!isPrimary && isVerified && (
          <LinkButtonWithDescription
            title={localizationKeys('userProfile.start.emailAddressesSection.detailsTitle__nonPrimary')}
            subtitle={localizationKeys('userProfile.start.emailAddressesSection.detailsSubtitle__nonPrimary')}
            actionLabel={localizationKeys('userProfile.start.emailAddressesSection.detailsAction__nonPrimary')}
            onClick={setPrimary}
          />
        )}
        {!isPrimary && !isVerified && (
          <LinkButtonWithDescription
            title={localizationKeys('userProfile.start.emailAddressesSection.detailsTitle__unverified')}
            subtitle={localizationKeys('userProfile.start.emailAddressesSection.detailsSubtitle__unverified')}
            actionLabel={localizationKeys('userProfile.start.emailAddressesSection.detailsAction__unverified')}
            onClick={() => navigate(`email-address/${email.id}`)}
          />
        )}
        <LinkButtonWithDescription
          title={localizationKeys('userProfile.start.emailAddressesSection.destructiveActionTitle')}
          subtitle={localizationKeys('userProfile.start.emailAddressesSection.destructiveActionSubtitle')}
          actionLabel={localizationKeys('userProfile.start.emailAddressesSection.destructiveAction')}
          variant='linkDanger'
          onClick={() => navigate(`email-address/${email.id}/remove`)}
        />
      </Col>
    </UserProfileAccordion>
  );
};

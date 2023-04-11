import type { SamlAccountResource } from '@clerk/types/src';

import { useRouter } from '../../../ui/router';
import { useCoreUser } from '../../contexts';
import { Badge, Col, descriptors, Flex, Image, localizationKeys } from '../../customizables';
import { ProfileSection, UserPreview } from '../../elements';
import { useNavigate } from '../../hooks/useNavigate';
import { LinkButtonWithDescription } from './LinkButtonWithDescription';
import { UserProfileAccordion } from './UserProfileAccordion';
import { getSamlProviderIconURL } from './utils';

export const SamlAccountsSection = () => {
  const user = useCoreUser();

  return (
    <ProfileSection
      title={localizationKeys('userProfile.start.enterpriseAccountsSection.title')}
      id='samlAccounts'
    >
      {user.samlAccounts.map(account => (
        <SamlAccountAccordion
          key={account.id}
          account={account}
        />
      ))}
    </ProfileSection>
  );
};

const SamlAccountAccordion = ({ account }: { account: SamlAccountResource }) => {
  const { navigate } = useNavigate();
  const router = useRouter();
  const error = account.verification?.error?.longMessage;
  const label = account.emailAddress;

  // TODO correlate SAML account with connection to obtain connection name
  const connectionName = 'CONNECTION NAME';

  return (
    <UserProfileAccordion
      onCloseCallback={router.urlStateParam?.clearUrlStateParam}
      icon={
        <Image
          elementDescriptor={[descriptors.providerIcon]}
          elementId={descriptors.samlButtonsProviderIcon.setId(account.provider)} // may be more than one
          alt={connectionName}
          src={getSamlProviderIconURL(account.provider)}
          sx={theme => ({ width: theme.sizes.$4 })}
        />
      }
      title={
        <Flex
          gap={2}
          center
        >
          {`${connectionName} ${label ? `(${label})` : ''}`}
          {error && (
            <Badge
              colorScheme='danger'
              localizationKey={localizationKeys('badge__requiresAction')}
            />
          )}
        </Flex>
      }
    >
      <Col gap={4}>
        <UserPreview
          // externalAccount={account}
          size='lg'
          icon={
            <Image
              alt={''}
              src={''}
              sx={theme => ({ width: theme.sizes.$4 })}
            />
          }
        />

        <LinkButtonWithDescription
          title={localizationKeys('userProfile.start.enterpriseAccountsSection.destructiveActionTitle')}
          subtitle={localizationKeys('userProfile.start.enterpriseAccountsSection.destructiveActionSubtitle')}
          actionLabel={localizationKeys(
            'userProfile.start.enterpriseAccountsSection.destructiveActionAccordionSubtitle',
          )}
          colorScheme='danger'
          onClick={() => navigate(`enteprise-account/${account.id}/remove`)}
        />
      </Col>
    </UserProfileAccordion>
  );
};

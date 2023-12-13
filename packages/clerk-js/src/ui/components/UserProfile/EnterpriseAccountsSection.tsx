import { useUser } from '@clerk/shared/react';
import type { SamlAccountResource } from '@clerk/types';

import { Badge, Col, descriptors, Flex, Image, localizationKeys } from '../../customizables';
import { ProfileSection, UserPreview } from '../../elements';
import { useSaml } from '../../hooks';
import { useRouter } from '../../router';
import { UserProfileAccordion } from './UserProfileAccordion';

export const EnterpriseAccountsSection = () => {
  const { user } = useUser();

  return (
    <ProfileSection
      title={localizationKeys('userProfile.start.enterpriseAccountsSection.title')}
      id='enterpriseAccounts'
    >
      {user?.samlAccounts.map(account => (
        <EnterpriseAccountAccordion
          key={account.id}
          account={account}
        />
      ))}
    </ProfileSection>
  );
};

const EnterpriseAccountAccordion = ({ account }: { account: SamlAccountResource }) => {
  const router = useRouter();
  const { getSamlProviderLogoUrl, getSamlProviderName } = useSaml();
  const error = account.verification?.error?.longMessage;
  const label = account.emailAddress;
  const providerName = getSamlProviderName(account.provider);
  const providerLogoUrl = getSamlProviderLogoUrl(account.provider);

  return (
    <UserProfileAccordion
      onCloseCallback={router.urlStateParam?.clearUrlStateParam}
      icon={
        <Image
          elementDescriptor={[descriptors.providerIcon]}
          elementId={descriptors.enterpriseButtonsProviderIcon.setId(account.provider)}
          alt={providerName}
          src={providerLogoUrl}
          sx={theme => ({ width: theme.sizes.$4 })}
        />
      }
      title={
        <Flex
          gap={2}
          center
        >
          {`${providerName} ${label ? `(${label})` : ''}`}
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
          samlAccount={account}
          icon={
            <Image
              alt={providerName}
              src={providerLogoUrl}
              sx={theme => ({ width: theme.sizes.$4 })}
            />
          }
        />
      </Col>
    </UserProfileAccordion>
  );
};

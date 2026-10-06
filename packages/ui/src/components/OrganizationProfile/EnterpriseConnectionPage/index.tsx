import type { EnterpriseConnectionResource } from '@clerk/shared/types';

import { Header } from '@/elements/Header';
import { ProfileCard } from '@/elements/ProfileCard';

import { Badge, Col, descriptors, Flex, Text } from '../../../customizables';
import { isOidcProvider } from '../../ConfigureSSO/domain/organizationEnterpriseConnection';
import { providerLabel, toProviderCard } from '../../ConfigureSSO/domain/providers';
import type { EnterpriseConnectionMutations } from '../../ConfigureSSO/hooks/useOrganizationEnterpriseConnection';
import { useOrganizationEnterpriseConnectionStatus } from '../../ConfigureSSO/hooks/useOrganizationEnterpriseConnectionStatus';
import type { EnterpriseConnectionProviderType } from '../../ConfigureSSO/types';
import { EnterpriseConnectionIcon } from '../EnterpriseConnectionIcon';
import { STATUS_BADGES } from '../enterpriseConnectionStatusBadges';
import { SecurityBackControl } from '../SecurityBackControl';
import { DomainsSection } from './DomainsSection';
import { IdentityProviderSection } from './IdentityProviderSection';
import { NameSection } from './NameSection';
import { OidcServiceProviderSection, SamlServiceProviderSection } from './ServiceProviderSection';
import { SettingsSection } from './SettingsSection';

export type EnterpriseConnectionPageProps = {
  connection: EnterpriseConnectionResource;
  enterpriseConnectionMutations: EnterpriseConnectionMutations;
  onBack: () => void;
};

export const EnterpriseConnectionPage = ({
  connection,
  enterpriseConnectionMutations: { updateConnection },
  onBack,
}: EnterpriseConnectionPageProps): JSX.Element => {
  const isOidc = isOidcProvider(connection.provider);

  return (
    <ProfileCard.Page>
      <Col
        elementDescriptor={[descriptors.page, descriptors.organizationProfileSecuritySsoConnectionPage]}
        sx={t => ({ gap: t.space.$8 })}
      >
        <Col
          elementDescriptor={descriptors.profilePage}
          elementId={descriptors.profilePage.setId('organizationSecurity')}
        >
          <ConnectionHeader
            connection={connection}
            onBack={onBack}
          />

          <NameSection
            connection={connection}
            updateConnection={updateConnection}
          />

          <DomainsSection connection={connection} />

          {isOidc ? (
            <OidcServiceProviderSection connection={connection} />
          ) : (
            <SamlServiceProviderSection connection={connection} />
          )}

          <IdentityProviderSection
            connection={connection}
            updateConnection={updateConnection}
          />

          <SettingsSection
            connection={connection}
            family={isOidc ? 'oidc' : 'saml'}
            updateConnection={updateConnection}
          />
        </Col>
      </Col>
    </ProfileCard.Page>
  );
};

type ConnectionHeaderProps = Pick<EnterpriseConnectionPageProps, 'connection' | 'onBack'>;

const ConnectionHeader = ({ connection, onBack }: ConnectionHeaderProps): JSX.Element => {
  const { status } = useOrganizationEnterpriseConnectionStatus(connection);

  const badge = STATUS_BADGES[status];
  const label = providerLabel(toProviderCard(connection.provider as EnterpriseConnectionProviderType));

  return (
    <Col sx={t => ({ gap: t.space.$4, marginBottom: t.space.$4 })}>
      <Flex>
        <SecurityBackControl onClick={onBack} />
      </Flex>

      <Flex
        align='center'
        wrap='wrap'
        sx={t => ({ gap: t.space.$2 })}
      >
        <EnterpriseConnectionIcon connection={connection} />

        <Col sx={{ minWidth: 0 }}>
          <Header.Title textVariant='h2'>{connection.name}</Header.Title>
          {label && (
            <Text
              colorScheme='secondary'
              variant='caption'
              localizationKey={label}
            />
          )}
        </Col>

        <Badge
          elementDescriptor={descriptors.organizationProfileSecuritySsoBadge}
          elementId={descriptors.organizationProfileSecuritySsoBadge.setId(badge.id)}
          colorScheme={badge.colorScheme}
          localizationKey={badge.label}
        />
      </Flex>
    </Col>
  );
};

import type { EnterpriseConnectionResource } from '@clerk/shared/types';

import { Card } from '@/elements/Card';
import { useCardState, withCardStateProvider } from '@/elements/contexts';
import { Header } from '@/elements/Header';
import { ProfileCard } from '@/elements/ProfileCard';
import { handleError } from '@/utils/errorHandler';

import { getEnterpriseProviderIconId, ProviderIcon } from '../../../common';
import { Badge, Button, Col, descriptors, Flex, localizationKeys, Text } from '../../../customizables';
import { isOidcProvider } from '../../ConfigureSSO/domain/organizationEnterpriseConnection';
import { providerLabel, toProviderCard } from '../../ConfigureSSO/domain/providers';
import type { EnterpriseConnectionMutations } from '../../ConfigureSSO/hooks/useOrganizationEnterpriseConnection';
import { useOrganizationEnterpriseConnectionStatus } from '../../ConfigureSSO/hooks/useOrganizationEnterpriseConnectionStatus';
import type { EnterpriseConnectionProviderType } from '../../ConfigureSSO/types';
import { STATUS_BADGES } from '../enterpriseConnectionStatusBadges';
import { SecurityBackControl } from '../SecurityBackControl';
import { DangerZoneSection } from './DangerZoneSection';
import { DomainsSection } from './DomainsSection';
import { IdentityProviderSection } from './IdentityProviderSection';
import { NameSection } from './NameSection';
import { OidcServiceProviderSection, SamlServiceProviderSection } from './ServiceProviderSection';
import { SettingsSection } from './SettingsSection';

export type EnterpriseConnectionPageProps = {
  connection: EnterpriseConnectionResource;
  enterpriseConnectionMutations: EnterpriseConnectionMutations;
  organizationName: string;
  contentRef: React.RefObject<HTMLDivElement>;
  onBack: () => void;
  /** Opens the wizard scoped to this connection, resuming at its furthest-reachable step. */
  onOpenWizard: () => void;
};

export const EnterpriseConnectionPage = withCardStateProvider(
  ({
    connection,
    enterpriseConnectionMutations,
    organizationName,
    contentRef,
    onBack,
    onOpenWizard,
  }: EnterpriseConnectionPageProps): JSX.Element => {
    const { updateConnection } = enterpriseConnectionMutations;
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
              enterpriseConnectionMutations={enterpriseConnectionMutations}
              onBack={onBack}
              onOpenWizard={onOpenWizard}
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

            <DangerZoneSection
              connection={connection}
              enterpriseConnectionMutations={enterpriseConnectionMutations}
              organizationName={organizationName}
              contentRef={contentRef}
              onBack={onBack}
            />
          </Col>
        </Col>
      </ProfileCard.Page>
    );
  },
);

type ConnectionHeaderProps = Pick<
  EnterpriseConnectionPageProps,
  'connection' | 'enterpriseConnectionMutations' | 'onBack' | 'onOpenWizard'
>;

const ConnectionHeader = ({
  connection,
  enterpriseConnectionMutations: { setConnectionActive },
  onBack,
  onOpenWizard,
}: ConnectionHeaderProps): JSX.Element => {
  const card = useCardState();
  const { status } = useOrganizationEnterpriseConnectionStatus(connection);

  const badge = STATUS_BADGES[status];
  const label = providerLabel(toProviderCard(connection.provider as EnterpriseConnectionProviderType));

  const onActivate = async () => {
    if (card.isLoading) {
      return;
    }

    card.setError(undefined);
    card.setLoading();

    try {
      // The mutation revalidates before resolving, so the refreshed entity drives the settled UI.
      await setConnectionActive(connection.id, true);
    } catch (err) {
      handleError(err as Error, [], card.setError);
    } finally {
      card.setIdle();
    }
  };

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
        <ProviderIcon
          id={getEnterpriseProviderIconId(connection.provider)}
          iconUrl={connection.logoPublicUrl?.trim() || undefined}
          name={connection.name}
          elementDescriptor={descriptors.organizationProfileSecuritySsoProviderIcon}
        />

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

        {status === 'active' ? null : status === 'inactive' ? (
          <Button
            variant='solid'
            size='sm'
            isDisabled={card.isLoading}
            onClick={() => void onActivate()}
            localizationKey={localizationKeys('organizationProfile.securityPage.connectionPage.actions.activate')}
            sx={{ marginInlineStart: 'auto' }}
          />
        ) : (
          <Button
            variant='bordered'
            colorScheme='secondary'
            size='sm'
            onClick={onOpenWizard}
            localizationKey={localizationKeys('organizationProfile.securityPage.connectionPage.actions.continueSetup')}
            sx={{ marginInlineStart: 'auto' }}
          />
        )}
      </Flex>

      <Card.Alert>{card.error}</Card.Alert>
    </Col>
  );
};

import type { EnterpriseConnectionResource, OAuthProvider } from '@clerk/shared/types';
import { useState } from 'react';

import { Card } from '@/elements/Card';
import { useCardState, withCardStateProvider } from '@/elements/contexts';
import { Header } from '@/elements/Header';
import { ProfileCard } from '@/elements/ProfileCard';
import { handleError } from '@/utils/errorHandler';

import { ProviderIcon } from '../../../common';
import { Badge, Button, Col, descriptors, Flex, localizationKeys, Text } from '../../../customizables';
import { isOidcProvider } from '../../ConfigureSSO/domain/organizationEnterpriseConnection';
import { providerLabel, toProviderCard } from '../../ConfigureSSO/domain/providers';
import type { EnterpriseConnectionMutations } from '../../ConfigureSSO/hooks/useOrganizationEnterpriseConnection';
import { useOrganizationEnterpriseConnectionStatus } from '../../ConfigureSSO/hooks/useOrganizationEnterpriseConnectionStatus';
import { ResetConnectionDialog } from '../../ConfigureSSO/ResetConnectionDialog';
import type { EnterpriseConnectionProviderType } from '../../ConfigureSSO/types';
import { STATUS_BADGES } from '../enterpriseConnectionStatusBadges';
import { SecurityBackControl } from '../SecurityBackControl';
import { GeneralSection } from './GeneralSection';
import { IdentityProviderSection } from './IdentityProviderSection';
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
              organizationName={organizationName}
              contentRef={contentRef}
              onBack={onBack}
              onOpenWizard={onOpenWizard}
            />

            <GeneralSection
              connection={connection}
              updateConnection={updateConnection}
            />

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
  },
);

const ConnectionHeader = ({
  connection,
  enterpriseConnectionMutations: { setConnectionActive, deleteConnection },
  organizationName,
  contentRef,
  onBack,
  onOpenWizard,
}: EnterpriseConnectionPageProps): JSX.Element => {
  const card = useCardState();
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const { status } = useOrganizationEnterpriseConnectionStatus(connection);

  const badge = STATUS_BADGES[status];
  const label = providerLabel(toProviderCard(connection.provider as EnterpriseConnectionProviderType));

  const onSetActive = async (active: boolean) => {
    if (card.isLoading) {
      return;
    }

    card.setError(undefined);
    card.setLoading();

    try {
      // The mutation revalidates before resolving, so the refreshed entity drives the settled UI.
      await setConnectionActive(connection.id, active);
    } catch (err) {
      handleError(err as Error, [], card.setError);
    } finally {
      card.setIdle();
    }
  };

  return (
    <Col sx={t => ({ gap: t.space.$4, marginBottom: t.space.$4 })}>
      <SecurityBackControl onClick={onBack} />

      <Flex
        align='center'
        wrap='wrap'
        sx={t => ({ gap: t.space.$2 })}
      >
        <ProviderIcon
          id={connection.provider.replace(/(oauth_|saml_)/, '').trim() as OAuthProvider}
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
      </Flex>

      <Flex
        wrap='wrap'
        sx={t => ({ gap: t.space.$2 })}
      >
        {status === 'active' && (
          <Button
            variant='bordered'
            colorScheme='secondary'
            size='sm'
            isDisabled={card.isLoading}
            onClick={() => void onSetActive(false)}
            localizationKey={localizationKeys('organizationProfile.securityPage.connectionPage.actions.deactivate')}
          />
        )}

        {status === 'inactive' && (
          <Button
            variant='solid'
            size='sm'
            isDisabled={card.isLoading}
            onClick={() => void onSetActive(true)}
            localizationKey={localizationKeys('organizationProfile.securityPage.connectionPage.actions.activate')}
          />
        )}

        {(status === 'in_progress' || status === 'unconfigured') && (
          <Button
            variant='bordered'
            colorScheme='secondary'
            size='sm'
            onClick={onOpenWizard}
            localizationKey={localizationKeys('organizationProfile.securityPage.connectionPage.actions.openWizard')}
          />
        )}

        <Button
          variant='bordered'
          colorScheme='danger'
          size='sm'
          onClick={() => setIsRemoveDialogOpen(true)}
          localizationKey={localizationKeys('organizationProfile.securityPage.connectionPage.actions.remove')}
        />
      </Flex>

      <Card.Alert>{card.error}</Card.Alert>

      <ResetConnectionDialog
        isOpen={isRemoveDialogOpen}
        onClose={() => setIsRemoveDialogOpen(false)}
        confirmationValue={organizationName}
        title={localizationKeys('organizationProfile.securityPage.removeDialog.title')}
        subtitle={localizationKeys('organizationProfile.securityPage.removeDialog.subtitle', {
          name: connection.name,
        })}
        confirmButtonLabel={localizationKeys('organizationProfile.securityPage.removeDialog.confirmButton')}
        onDelete={async () => {
          await deleteConnection(connection.id);
          onBack();
        }}
        contentRef={contentRef}
      />
    </Col>
  );
};

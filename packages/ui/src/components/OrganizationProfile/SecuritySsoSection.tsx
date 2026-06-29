import type { EnterpriseConnectionResource } from '@clerk/shared/types';
import { useState } from 'react';

import { Card } from '@/ui/elements/Card';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { Tooltip } from '@/ui/elements/Tooltip';
import { handleError } from '@/utils/errorHandler';

import { useEnvironment } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import {
  Badge,
  Button,
  Col,
  descriptors,
  Flex,
  Icon,
  localizationKeys,
  Text,
  useLocalizations,
} from '../../customizables';
import { useFetchRoles, useLocalizeCustomRoles } from '../../hooks/useFetchRoles';
import { InformationCircle } from '../../icons';
import type {
  OrganizationEnterpriseConnection,
  OrganizationEnterpriseConnectionStatus,
} from '../ConfigureSSO/domain/organizationEnterpriseConnection';
import type { EnterpriseConnectionMutations } from '../ConfigureSSO/hooks/useOrganizationEnterpriseConnection';
import { ResetConnectionDialog } from '../ConfigureSSO/ResetConnectionDialog';

type SecuritySsoSectionProps = {
  connection: OrganizationEnterpriseConnection;
  enterpriseConnection: EnterpriseConnectionResource | undefined;
  setConnectionActive: EnterpriseConnectionMutations['setConnectionActive'];
  deleteConnection: EnterpriseConnectionMutations['deleteConnection'];
  organizationName: string;
  contentRef: React.RefObject<HTMLDivElement>;
  onConfigure: (forceInitialStep?: boolean) => void;
};

const STATUS_BADGES: Record<
  OrganizationEnterpriseConnectionStatus,
  { id: string; colorScheme?: 'primary' | 'danger' | 'warning' | 'success'; label: LocalizationKey }
> = {
  unconfigured: {
    id: 'unconfigured',
    colorScheme: 'primary',
    label: localizationKeys('organizationProfile.securityPage.ssoSection.badge__unconfigured'),
  },
  in_progress: {
    id: 'inProgress',
    colorScheme: 'warning',
    label: localizationKeys('organizationProfile.securityPage.ssoSection.badge__inProgress'),
  },
  active: {
    id: 'active',
    colorScheme: 'success',
    label: localizationKeys('organizationProfile.securityPage.ssoSection.badge__active'),
  },
  inactive: {
    id: 'inactive',
    colorScheme: 'danger',
    label: localizationKeys('organizationProfile.securityPage.ssoSection.badge__inactive'),
  },
};

export const SecuritySsoSection = (props: SecuritySsoSectionProps): JSX.Element => {
  const { connection, onConfigure } = props;

  const isConfigured = connection.status === 'active' || connection.status === 'inactive';

  // The badge and menu read straight from the entity; revalidation drives the settled state.
  const status: OrganizationEnterpriseConnectionStatus = connection.status;
  const badge = STATUS_BADGES[status];

  return (
    <ProfileSection.Root
      title={localizationKeys('organizationProfile.securityPage.ssoSection.title')}
      id='sso'
      centered={false}
      badge={
        <Badge
          elementDescriptor={descriptors.organizationProfileSecuritySsoBadge}
          elementId={descriptors.organizationProfileSecuritySsoBadge.setId(badge.id)}
          colorScheme={badge.colorScheme}
          localizationKey={badge.label}
        />
      }
    >
      {status === 'unconfigured' && (
        <NotConfiguredContent
          primaryButtonKey={localizationKeys(
            'organizationProfile.securityPage.ssoSection.primaryButton__startConfiguration',
          )}
          primaryButtonId='start'
          onConfigure={() => onConfigure(true)}
        />
      )}

      {status === 'in_progress' && (
        <NotConfiguredContent
          primaryButtonKey={localizationKeys(
            'organizationProfile.securityPage.ssoSection.primaryButton__continueConfiguration',
          )}
          primaryButtonId='continue'
          onConfigure={() => onConfigure()}
        />
      )}

      {isConfigured && (
        <CardStateProvider>
          <ConfiguredContent
            {...props}
            isActive={status === 'active'}
          />
        </CardStateProvider>
      )}
    </ProfileSection.Root>
  );
};

type NotConfiguredContentProps = {
  primaryButtonKey: LocalizationKey;
  primaryButtonId: string;
  onConfigure: () => void;
};

const NotConfiguredContent = ({
  primaryButtonKey,
  primaryButtonId,
  onConfigure,
}: NotConfiguredContentProps): JSX.Element => (
  <Col
    align='start'
    gap={4}
  >
    <SsoDescription />

    <Button
      elementDescriptor={descriptors.organizationProfileSecuritySsoConfigureButton}
      elementId={descriptors.organizationProfileSecuritySsoConfigureButton.setId(primaryButtonId)}
      variant='bordered'
      colorScheme='secondary'
      size='sm'
      onClick={onConfigure}
      localizationKey={primaryButtonKey}
    />
  </Col>
);

type ConfiguredContentProps = SecuritySsoSectionProps & {
  isActive: boolean;
};

const ConfiguredContent = (props: ConfiguredContentProps): JSX.Element => {
  const {
    enterpriseConnection,
    setConnectionActive,
    deleteConnection,
    organizationName,
    contentRef,
    onConfigure,
    isActive,
  } = props;
  const card = useCardState();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const domains = enterpriseConnection?.domains ?? [];

  const onSetActive = async (active: boolean) => {
    if (card.isLoading) {
      return;
    }

    card.setError(undefined);
    card.setLoading();

    try {
      // A configured (active / inactive) connection guarantees the resource is set.
      // The mutation revalidates before resolving, so the refreshed entity drives the settled UI.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await setConnectionActive(enterpriseConnection!.id, active);
    } catch (err) {
      handleError(err as Error, [], card.setError);
    } finally {
      card.setIdle();
    }
  };

  return (
    <Col gap={4}>
      <Flex
        align='start'
        justify='between'
        gap={3}
      >
        <SsoDescription />

        <ThreeDotsMenu
          elementId='sso'
          actions={[
            {
              label: localizationKeys('organizationProfile.securityPage.ssoSection.menuAction__edit'),
              onClick: () => onConfigure(true),
            },
            isActive
              ? {
                  label: localizationKeys('organizationProfile.securityPage.ssoSection.menuAction__deactivate'),
                  isDisabled: card.isLoading,
                  onClick: () => void onSetActive(false),
                }
              : {
                  label: localizationKeys('organizationProfile.securityPage.ssoSection.menuAction__activate'),
                  isDisabled: card.isLoading,
                  onClick: () => void onSetActive(true),
                },
            {
              label: localizationKeys('organizationProfile.securityPage.ssoSection.menuAction__remove'),
              isDestructive: true,
              onClick: () => setIsResetDialogOpen(true),
            },
          ]}
        />
      </Flex>

      <Card.Alert>{card.error}</Card.Alert>

      {domains.length > 0 && (
        <Flex sx={t => ({ gap: t.space.$1x5 })}>
          <Text
            elementDescriptor={descriptors.organizationProfileSecuritySsoDetailRowLabel}
            elementId={descriptors.organizationProfileSecuritySsoDetailRowLabel.setId('domain')}
            colorScheme='secondary'
            localizationKey={localizationKeys('organizationProfile.securityPage.ssoSection.domainLabel')}
          />

          <Flex
            align='center'
            wrap='wrap'
            sx={t => ({ minWidth: 0, gap: t.space.$1x5 })}
          >
            {domains.map(domain => (
              <Badge
                key={domain}
                elementDescriptor={descriptors.organizationProfileSecuritySsoDetailRowChip}
              >
                {domain}
              </Badge>
            ))}
          </Flex>
        </Flex>
      )}

      <ResetConnectionDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        confirmationValue={organizationName}
        title={localizationKeys('organizationProfile.securityPage.removeDialog.title')}
        subtitle={localizationKeys('organizationProfile.securityPage.removeDialog.subtitle')}
        confirmButtonLabel={localizationKeys('organizationProfile.securityPage.removeDialog.confirmButton')}
        // A configured (active / inactive) connection guarantees the resource is set.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        onDelete={() => deleteConnection(enterpriseConnection!.id)}
        contentRef={contentRef}
      />
    </Col>
  );
};

const SsoDescription = (): JSX.Element => {
  const roleName = useEnrollmentRoleName();
  const { t } = useLocalizations();

  return (
    <Text as='p'>
      <Text
        as='span'
        elementDescriptor={descriptors.organizationProfileSecuritySsoDescription}
        colorScheme='secondary'
        localizationKey={localizationKeys('organizationProfile.securityPage.ssoSection.descriptionLine1')}
      />

      <Tooltip.Root>
        <Tooltip.Trigger>
          <Button
            variant='unstyled'
            aria-label={t(localizationKeys('organizationProfile.securityPage.ssoSection.tooltipLabel'))}
            sx={t => ({
              display: 'inline-flex',
              alignItems: 'center',
              verticalAlign: 'middle',
              padding: 0,
              height: 'fit-content',
              borderRadius: t.radii.$sm,
              color: t.colors.$colorMutedForeground,
              marginInlineStart: t.space.$1,
            })}
          >
            <Icon
              icon={InformationCircle}
              aria-hidden
              sx={t => ({ width: t.sizes.$4, height: t.sizes.$4 })}
            />
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content
          text={
            roleName
              ? localizationKeys('organizationProfile.securityPage.ssoSection.tooltip', { role: roleName })
              : localizationKeys('organizationProfile.securityPage.ssoSection.tooltip__noRole')
          }
        />
      </Tooltip.Root>
    </Text>
  );
};

/**
 * The display name of the role SSO-enrolled members are assigned — the environment's
 * default member role, name-mapped when the roles list is readable.
 */
const useEnrollmentRoleName = (): string | undefined => {
  const { organizationSettings } = useEnvironment();
  const { options } = useFetchRoles();
  const { localizeCustomRole } = useLocalizeCustomRoles();

  // Mirrors the invite form's default-role resolution.
  let roleKey = organizationSettings.domains.defaultRole ?? undefined;
  if (!roleKey && options?.length === 1) {
    roleKey = options[0].value;
  }

  if (!roleKey) {
    return undefined;
  }

  return (
    localizeCustomRole(roleKey) || options?.find(option => option.value === roleKey)?.label || humanizeRoleKey(roleKey)
  );
};

/** `org:billing_admin` → `billing admin`. */
const humanizeRoleKey = (roleKey: string): string => {
  const lastSegment = roleKey.split(':').pop() ?? roleKey;
  return lastSegment.replace(/[_-]+/g, ' ').trim() || roleKey;
};

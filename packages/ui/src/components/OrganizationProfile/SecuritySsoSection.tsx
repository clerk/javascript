import { iconImageUrl } from '@clerk/shared/constants';
import type { EnterpriseConnectionResource } from '@clerk/shared/types';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';

import { Card } from '@/ui/elements/Card';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { handleError } from '@/utils/errorHandler';

import { useEnvironment } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import { Badge, Button, Col, descriptors, Flex, Link, localizationKeys, Span, Text } from '../../customizables';
import { useFetchRoles, useLocalizeCustomRoles } from '../../hooks/useFetchRoles';
import type {
  OrganizationEnterpriseConnection,
  OrganizationEnterpriseConnectionStatus,
} from '../ConfigureSSO/domain/organizationEnterpriseConnection';
import type { EnterpriseConnectionMutations } from '../ConfigureSSO/hooks/useOrganizationEnterpriseConnection';
import { ResetConnectionDialog } from '../ConfigureSSO/ResetConnectionDialog';
import type { ProviderType } from '../ConfigureSSO/types';

/** Props-driven: the Security page owns the data — no wizard context below the page. */
type SecuritySsoSectionProps = {
  connection: OrganizationEnterpriseConnection;
  enterpriseConnection: EnterpriseConnectionResource | undefined;
  setConnectionActive: EnterpriseConnectionMutations['setConnectionActive'];
  deleteConnection: EnterpriseConnectionMutations['deleteConnection'];
  organizationName: string;
  contentRef: React.RefObject<HTMLDivElement>;
  onConfigure: () => void;
};

const STATUS_BADGES: Record<
  OrganizationEnterpriseConnectionStatus,
  { id: string; colorScheme: 'danger' | 'warning' | 'success'; label: LocalizationKey }
> = {
  unconfigured: {
    id: 'unconfigured',
    colorScheme: 'danger',
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

/** Keep in sync with the select-provider step's MONOCHROMATIC_PROVIDER_ICONS. */
const MONOCHROMATIC_PROVIDER_ICONS: ReadonlySet<string> = new Set(['okta']);

const PROVIDER_PRESENTATION: Record<ProviderType, { label: LocalizationKey; iconId: string }> = {
  saml_okta: { label: localizationKeys('configureSSO.selectProviderStep.saml.okta'), iconId: 'okta' },
  saml_microsoft: { label: localizationKeys('configureSSO.selectProviderStep.saml.microsoft'), iconId: 'microsoft' },
  saml_google: { label: localizationKeys('configureSSO.selectProviderStep.saml.google'), iconId: 'google' },
  saml_custom: { label: localizationKeys('configureSSO.selectProviderStep.saml.customSaml'), iconId: 'saml' },
};

export const SecuritySsoSection = (props: SecuritySsoSectionProps): JSX.Element => {
  const { connection, onConfigure } = props;

  // Mirrors an in-flight Activate / Deactivate so the badge and menu flip optimistically; cleared on settle.
  const [optimisticActive, setOptimisticActive] = useState<boolean>();

  const isConfigured = connection.status === 'active' || connection.status === 'inactive';
  const status: OrganizationEnterpriseConnectionStatus =
    isConfigured && optimisticActive !== undefined ? (optimisticActive ? 'active' : 'inactive') : connection.status;
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
          onConfigure={onConfigure}
        />
      )}

      {status === 'in_progress' && (
        <NotConfiguredContent
          primaryButtonKey={localizationKeys(
            'organizationProfile.securityPage.ssoSection.primaryButton__continueConfiguration',
          )}
          primaryButtonId='continue'
          onConfigure={onConfigure}
        />
      )}

      {isConfigured && (
        <CardStateProvider>
          <ConfiguredContent
            {...props}
            isActive={status === 'active'}
            onOptimisticActiveChange={setOptimisticActive}
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
      variant='outline'
      size='sm'
      onClick={onConfigure}
      localizationKey={primaryButtonKey}
    />
  </Col>
);

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

const SsoDescription = (): JSX.Element => {
  const roleName = useEnrollmentRoleName();

  return (
    <Col
      gap={4}
      sx={{ minWidth: 0 }}
    >
      <Text
        elementDescriptor={descriptors.organizationProfileSecuritySsoDescription}
        colorScheme='secondary'
        localizationKey={localizationKeys('organizationProfile.securityPage.ssoSection.descriptionLine1')}
      />
      <Text
        elementDescriptor={descriptors.organizationProfileSecuritySsoDescription}
        colorScheme='secondary'
        localizationKey={
          roleName
            ? localizationKeys('organizationProfile.securityPage.ssoSection.descriptionLine2', { role: roleName })
            : localizationKeys('organizationProfile.securityPage.ssoSection.descriptionLine2__noRole')
        }
      />
    </Col>
  );
};

type ConfiguredContentProps = SecuritySsoSectionProps & {
  /** Effective activation — an in-flight optimistic flip included. */
  isActive: boolean;
  onOptimisticActiveChange: (active: boolean | undefined) => void;
};

const ConfiguredContent = (props: ConfiguredContentProps): JSX.Element => {
  const {
    connection,
    enterpriseConnection,
    setConnectionActive,
    deleteConnection,
    organizationName,
    contentRef,
    onConfigure,
    isActive,
    onOptimisticActiveChange,
  } = props;
  const card = useCardState();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const provider = connection.provider ? PROVIDER_PRESENTATION[connection.provider] : undefined;
  const domains = enterpriseConnection?.domains ?? [];
  const samlConnection = enterpriseConnection?.samlConnection;

  const onSetActive = async (active: boolean) => {
    if (card.isLoading) {
      return;
    }

    card.setError(undefined);
    card.setLoading();
    onOptimisticActiveChange(active);

    try {
      // A configured (active / inactive) connection guarantees the resource is set.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await setConnectionActive(enterpriseConnection!.id, active);
    } catch (err) {
      handleError(err as Error, [], card.setError);
    } finally {
      // The mutation revalidates before resolving, so the settled entity drives the UI from here.
      onOptimisticActiveChange(undefined);
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
              onClick: onConfigure,
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

      <Col
        elementDescriptor={descriptors.organizationProfileSecuritySsoDetailRows}
        gap={2}
        sx={t => ({
          padding: t.space.$4,
          backgroundColor: t.colors.$colorBackground,
          borderWidth: t.borderWidths.$normal,
          borderStyle: t.borderStyles.$solid,
          borderColor: t.colors.$borderAlpha150,
          borderRadius: t.radii.$lg,
        })}
      >
        {provider && (
          <DetailRow
            id='provider'
            label={localizationKeys('organizationProfile.securityPage.ssoSection.providerLabel')}
          >
            <Flex
              align='center'
              gap={2}
              sx={{ minWidth: 0 }}
            >
              <ProviderIcon iconId={provider.iconId} />
              <Text
                localizationKey={provider.label}
                truncate
              />
            </Flex>
          </DetailRow>
        )}

        {domains.length > 0 && (
          <DetailRow
            id='domain'
            label={localizationKeys('organizationProfile.securityPage.ssoSection.domainLabel')}
          >
            <Flex
              justify='end'
              align='center'
              wrap='wrap'
              gap={1}
              sx={{ minWidth: 0 }}
            >
              {domains.map(domain => (
                <ValueChip
                  key={domain}
                  id='domain'
                >
                  {domain}
                </ValueChip>
              ))}
            </Flex>
          </DetailRow>
        )}

        {samlConnection?.idpSsoUrl && (
          <DetailRow
            id='signOnUrl'
            label={localizationKeys('organizationProfile.securityPage.ssoSection.signOnUrlLabel')}
          >
            <LinkChip
              id='signOnUrl'
              href={samlConnection.idpSsoUrl}
            />
          </DetailRow>
        )}

        {samlConnection?.idpEntityId && (
          <DetailRow
            id='issuer'
            label={localizationKeys('organizationProfile.securityPage.ssoSection.issuerLabel')}
          >
            <LinkChip
              id='issuer'
              href={samlConnection.idpEntityId}
            />
          </DetailRow>
        )}

        {samlConnection?.idpCertificate && (
          <DetailRow
            id='certificate'
            label={localizationKeys('organizationProfile.securityPage.ssoSection.certificateLabel')}
          >
            <ValueChip id='certificate'>{samlConnection.idpCertificate}</ValueChip>
          </DetailRow>
        )}
      </Col>

      <ResetConnectionDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        confirmationValue={organizationName}
        // A configured (active / inactive) connection guarantees the resource is set.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        onDelete={() => deleteConnection(enterpriseConnection!.id)}
        contentRef={contentRef}
      />
    </Col>
  );
};

type DetailRowProps = PropsWithChildren<{
  id: string;
  label: LocalizationKey;
}>;

const DetailRow = ({ id, label, children }: DetailRowProps): JSX.Element => (
  <Flex
    elementDescriptor={descriptors.organizationProfileSecuritySsoDetailRow}
    elementId={descriptors.organizationProfileSecuritySsoDetailRow.setId(id)}
    align='center'
    justify='between'
    gap={3}
  >
    <Text
      elementDescriptor={descriptors.organizationProfileSecuritySsoDetailRowLabel}
      elementId={descriptors.organizationProfileSecuritySsoDetailRowLabel.setId(id)}
      colorScheme='secondary'
      localizationKey={label}
      sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
    />
    <Flex
      justify='end'
      // Bounds the value side to the remaining row width so chips truncate instead of overflowing the card.
      sx={{ flex: '1 1 0', minWidth: 0 }}
    >
      {children}
    </Flex>
  </Flex>
);

type ValueChipProps = {
  id: string;
  children: string;
};

const ValueChip = ({ id, children }: ValueChipProps): JSX.Element => (
  <Badge
    elementDescriptor={descriptors.organizationProfileSecuritySsoDetailRowChip}
    elementId={descriptors.organizationProfileSecuritySsoDetailRowChip.setId(id)}
    sx={{ maxWidth: '100%', minWidth: 0 }}
  >
    <Text
      as='span'
      variant='caption'
      truncate
      title={children}
      sx={{ color: 'inherit' }}
    >
      {children}
    </Text>
  </Badge>
);

type LinkChipProps = {
  id: string;
  href: string;
};

const LinkChip = ({ id, href }: LinkChipProps): JSX.Element => (
  <Badge
    elementDescriptor={descriptors.organizationProfileSecuritySsoDetailRowChip}
    elementId={descriptors.organizationProfileSecuritySsoDetailRowChip.setId(id)}
    sx={{ maxWidth: '100%', minWidth: 0 }}
  >
    <Link
      elementDescriptor={descriptors.organizationProfileSecuritySsoDetailRowLink}
      elementId={descriptors.organizationProfileSecuritySsoDetailRowLink.setId(id)}
      href={href}
      isExternal
      title={href}
      sx={{
        color: 'inherit',
        display: 'block',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        textDecoration: 'underline',
        minWidth: 0,
      }}
    >
      {href}
    </Link>
  </Badge>
);

const ProviderIcon = ({ iconId }: { iconId: string }): JSX.Element => (
  <Span
    elementDescriptor={descriptors.organizationProfileSecuritySsoProviderIcon}
    aria-hidden
    sx={theme => {
      const baseSize = { width: theme.sizes.$4, height: theme.sizes.$4, flexShrink: 0 };
      if (MONOCHROMATIC_PROVIDER_ICONS.has(iconId)) {
        return {
          ...baseSize,
          backgroundColor: theme.colors.$colorForeground,
          maskImage: `url(${iconImageUrl(iconId)})`,
          maskSize: 'contain',
          maskPosition: 'center',
          maskRepeat: 'no-repeat',
        };
      }
      return {
        ...baseSize,
        backgroundImage: `url(${iconImageUrl(iconId)})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }}
  />
);

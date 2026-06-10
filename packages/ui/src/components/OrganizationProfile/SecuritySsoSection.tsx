import { iconImageUrl } from '@clerk/shared/constants';
import type { EnterpriseConnectionResource } from '@clerk/shared/types';
import type { PropsWithChildren } from 'react';
import { useId, useState } from 'react';

import { Card } from '@/ui/elements/Card';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';
import { ProfileSection } from '@/ui/elements/Section';
import { Switch } from '@/ui/elements/Switch';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { handleError } from '@/utils/errorHandler';

import type { LocalizationKey } from '../../customizables';
import { Badge, Button, Col, descriptors, Flex, Link, localizationKeys, Span, Text } from '../../customizables';
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
  const badge = STATUS_BADGES[connection.status];
  const isConfigured = connection.status === 'active' || connection.status === 'inactive';

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
      {connection.status === 'unconfigured' && (
        <NotConfiguredContent
          primaryButtonKey={localizationKeys(
            'organizationProfile.securityPage.ssoSection.primaryButton__startConfiguration',
          )}
          primaryButtonId='start'
          onConfigure={onConfigure}
        />
      )}

      {connection.status === 'in_progress' && (
        <NotConfiguredContent
          noticeKey={localizationKeys('organizationProfile.securityPage.ssoSection.startedNotFinished')}
          primaryButtonKey={localizationKeys(
            'organizationProfile.securityPage.ssoSection.primaryButton__continueConfiguration',
          )}
          primaryButtonId='continue'
          onConfigure={onConfigure}
        />
      )}

      {isConfigured && (
        <CardStateProvider>
          <ConfiguredContent {...props} />
        </CardStateProvider>
      )}
    </ProfileSection.Root>
  );
};

type NotConfiguredContentProps = {
  noticeKey?: LocalizationKey;
  primaryButtonKey: LocalizationKey;
  primaryButtonId: string;
  onConfigure: () => void;
};

const NotConfiguredContent = ({
  noticeKey,
  primaryButtonKey,
  primaryButtonId,
  onConfigure,
}: NotConfiguredContentProps): JSX.Element => (
  <Col
    align='start'
    gap={4}
  >
    <Col gap={2}>
      <Text
        elementDescriptor={descriptors.organizationProfileSecuritySsoDescription}
        colorScheme='secondary'
        localizationKey={localizationKeys('organizationProfile.securityPage.ssoSection.description')}
      />
      {noticeKey && (
        <Text
          elementDescriptor={descriptors.organizationProfileSecuritySsoInProgressNotice}
          colorScheme='secondary'
          localizationKey={noticeKey}
        />
      )}
    </Col>

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

const ConfiguredContent = (props: SecuritySsoSectionProps): JSX.Element => {
  const { connection, enterpriseConnection, deleteConnection, organizationName, contentRef, onConfigure } = props;
  const card = useCardState();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const provider = connection.provider ? PROVIDER_PRESENTATION[connection.provider] : undefined;
  const domains = enterpriseConnection?.domains ?? [];
  const samlConnection = enterpriseConnection?.samlConnection;

  return (
    <Col gap={3}>
      <Flex
        align='start'
        justify='between'
        gap={3}
      >
        <Text
          elementDescriptor={descriptors.organizationProfileSecuritySsoDescription}
          colorScheme='secondary'
          localizationKey={localizationKeys('organizationProfile.securityPage.ssoSection.description__configured')}
          sx={{ minWidth: 0 }}
        />

        <ThreeDotsMenu
          elementId='sso'
          actions={[
            {
              label: localizationKeys('organizationProfile.securityPage.ssoSection.menuAction__edit'),
              onClick: onConfigure,
            },
            {
              label: localizationKeys('organizationProfile.securityPage.ssoSection.menuAction__delete'),
              isDestructive: true,
              onClick: () => setIsResetDialogOpen(true),
            },
          ]}
        />
      </Flex>

      <Card.Alert>{card.error}</Card.Alert>

      <EnableSsoToggle
        connection={connection}
        enterpriseConnection={enterpriseConnection}
        setConnectionActive={props.setConnectionActive}
      />

      <Col
        elementDescriptor={descriptors.organizationProfileSecuritySsoDetailRows}
        gap={2}
        // Indents the rows so the labels line up under the toggle's text label.
        sx={t => ({ paddingInlineStart: t.space.$8 })}
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

type EnableSsoToggleProps = Pick<
  SecuritySsoSectionProps,
  'connection' | 'enterpriseConnection' | 'setConnectionActive'
>;

const EnableSsoToggle = ({
  connection,
  enterpriseConnection,
  setConnectionActive,
}: EnableSsoToggleProps): JSX.Element => {
  const card = useCardState();
  const labelId = useId();

  const [isChecked, setIsChecked] = useState(connection.isActive);

  const onActiveChange = async (active: boolean) => {
    if (card.isLoading) {
      return;
    }

    card.setError(undefined);
    card.setLoading();
    setIsChecked(active);

    try {
      // A configured (active / inactive) connection guarantees the resource is set.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const updated = await setConnectionActive(enterpriseConnection!.id, active);
      if (updated) {
        setIsChecked(updated.active);
      }
    } catch (err) {
      setIsChecked(!active);
      handleError(err as Error, [], card.setError);
    } finally {
      card.setIdle();
    }
  };

  return (
    <Flex
      elementDescriptor={descriptors.organizationProfileSecuritySsoEnableRow}
      align='center'
      gap={2}
    >
      <Switch
        isChecked={isChecked}
        // The spec gates enabling on a successful test run.
        isDisabled={card.isLoading || (!connection.hasSuccessfulTestRun && !connection.isActive)}
        onChange={active => void onActiveChange(active)}
        aria-labelledby={labelId}
      />
      <Text
        elementDescriptor={descriptors.organizationProfileSecuritySsoEnableLabel}
        id={labelId}
        localizationKey={localizationKeys('organizationProfile.securityPage.ssoSection.enableSsoLabel')}
      />
    </Flex>
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

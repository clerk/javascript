import * as stylex from '@stylexjs/stylex';

import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { CopyButton } from '../../../components/copy-button';
import type { DialogFocusTarget } from '../../../components/dialog';
import { Dialog } from '../../../components/dialog';
import { Section } from '../../../components/section';
import { Switch } from '../../../components/switch';
import { useNow } from '../../../hooks/use-now';
import { fill, useLocale, useMessages } from '../../../localization';
import { truncationStyles } from '../../../styles/typography.styles';
import { formatDate } from '../../../utils/format-date';
import { styles } from './organization-profile-security-panel.styles';
import { certificateStatus, earliestExpiring } from './sso-certificates.utils';
import type { SSORenameController, SSOSettingsController } from './sso-connection.controller';
import { useSSORenameController, useSSOSettingsController } from './sso-connection.controller';
import type {
  SSOCertificate,
  SSOConnection,
  SSOConnectionSetting,
  SSOOidcValues,
  SSOSamlValues,
} from './sso-connections.types';
import { SSO_STATUS_COLORS } from './sso-connections.utils';
import { SSOOidcEditDialog, SSOSamlEditDialog } from './sso-identity-provider.dialog';
import { SSORenameDialog } from './sso-rename.dialog';

export interface SSOConnectionActions {
  onRename: (name: string) => Promise<void>;
  onSetSetting: (setting: SSOConnectionSetting, enabled: boolean) => Promise<void>;
  onUpdateSaml: (values: SSOSamlValues) => Promise<void>;
  onUpdateOidc: (values: SSOOidcValues) => Promise<void>;
}

export interface SSOConnectionDialogProps {
  connection: SSOConnection | undefined;
  onOpenChange: (open: boolean) => void;
  finalFocus?: DialogFocusTarget;
  actions: (connection: SSOConnection) => SSOConnectionActions;
}

export function SSOConnectionDialog({ connection, onOpenChange, finalFocus, actions }: SSOConnectionDialogProps) {
  return (
    <Dialog.Root
      open={Boolean(connection)}
      onOpenChange={onOpenChange}
    >
      <Dialog.Popup finalFocus={finalFocus}>
        <Card.Root
          elevation='overlay'
          size='lg'
          renderBranding={false}
        >
          {connection ? (
            <SSOConnectionCardContent
              key={connection.id}
              connection={connection}
              {...actions(connection)}
            />
          ) : null}
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

export function SSOConnectionCardContent({
  connection,
  onRename,
  onSetSetting,
  onUpdateSaml,
  onUpdateOidc,
}: { connection: SSOConnection } & SSOConnectionActions) {
  const m = useMessages('organizationProfile').security;
  const rename = useSSORenameController({ name: connection.name, onSubmit: onRename });
  const settings = useSSOSettingsController({ settings: connection.settings, onChange: onSetSetting });

  return (
    <>
      <Card.Header>
        <Card.Title>
          <span {...stylex.props(styles.count)}>
            <span {...stylex.props(truncationStyles.singleLine)}>{connection.name}</span>
            <Badge color={SSO_STATUS_COLORS[connection.status]}>{m.sso.status[connection.status]}</Badge>
          </span>
        </Card.Title>
        <Card.Description>{m.sso.providers[connection.providerKey]}</Card.Description>
      </Card.Header>
      <Card.Content>
        <Section.Root>
          <NameGroup
            name={connection.name}
            rename={rename}
          />
          <DomainsGroup domains={connection.domains} />
          <ServiceProviderGroup connection={connection} />
          {connection.family === 'saml' ? (
            <SSOSamlEditDialog
              saml={connection.saml}
              onSubmit={onUpdateSaml}
            >
              {trigger => (
                <IdentityProviderGroup
                  details={samlDetails(connection.saml, m.ssoConnection.identityProvider)}
                  certificates={connection.saml.certificates}
                  trigger={trigger}
                />
              )}
            </SSOSamlEditDialog>
          ) : (
            <SSOOidcEditDialog
              oidc={connection.oidc}
              onSubmit={onUpdateOidc}
            >
              {trigger => (
                <IdentityProviderGroup
                  details={oidcDetails(connection.oidc, m.ssoConnection.identityProvider)}
                  trigger={trigger}
                />
              )}
            </SSOOidcEditDialog>
          )}
          <SettingsGroup settings={settings} />
        </Section.Root>
      </Card.Content>
    </>
  );
}

function NameGroup({ name, rename }: { name: string; rename: SSORenameController }) {
  const m = useMessages('organizationProfile').security.ssoConnection.name;
  return (
    <Section.Group>
      <Section.Header>
        <Section.Title>{m.title}</Section.Title>
      </Section.Header>
      <Section.Body>
        <Section.Row>
          <Section.Item>
            <Section.Content>
              <Section.Label>{name}</Section.Label>
            </Section.Content>
            <Section.Actions>
              <SSORenameDialog
                {...rename}
                trigger={
                  <Button
                    size='sm'
                    variant='outline'
                    color='neutral'
                    aria-label={m.editLabel}
                  >
                    {m.edit}
                  </Button>
                }
              />
            </Section.Actions>
          </Section.Item>
        </Section.Row>
      </Section.Body>
    </Section.Group>
  );
}

function DomainsGroup({ domains }: { domains: string[] }) {
  const m = useMessages('organizationProfile').security.ssoConnection.domains;
  return (
    <Section.Group>
      <Section.Header>
        <Section.Title>{m.title}</Section.Title>
      </Section.Header>
      <Section.Body>
        {domains.length > 0 ? (
          <Section.Items>
            {domains.map(domain => (
              <Section.Item key={domain}>
                <Section.Content>
                  <Section.Label>{domain}</Section.Label>
                </Section.Content>
              </Section.Item>
            ))}
          </Section.Items>
        ) : (
          <Section.Row>
            <Section.Item>
              <Section.Content>
                <Section.Description>{m.empty}</Section.Description>
              </Section.Content>
            </Section.Item>
          </Section.Row>
        )}
      </Section.Body>
    </Section.Group>
  );
}

function ServiceProviderGroup({ connection }: { connection: SSOConnection }) {
  const m = useMessages('organizationProfile').security.ssoConnection.serviceProvider;
  const values =
    connection.family === 'saml'
      ? [
          { label: m.acsUrl, value: connection.saml.acsUrl },
          { label: m.entityId, value: connection.saml.spEntityId },
          { label: m.metadataUrl, value: connection.saml.spMetadataUrl },
        ]
      : [{ label: m.redirectUri, value: connection.oidc.redirectUri }];
  const present = values.filter(entry => entry.value);
  if (present.length === 0) {
    return null;
  }
  return (
    <Section.Group>
      <Section.Header>
        <Section.Title>{m.title}</Section.Title>
      </Section.Header>
      <Section.Body>
        {present.map(entry => (
          <Section.Row key={entry.label}>
            <Section.Item>
              <Section.Content>
                <Section.Label>{entry.label}</Section.Label>
                <Section.Description
                  title={entry.value}
                  xstyle={truncationStyles.singleLine}
                >
                  {entry.value}
                </Section.Description>
              </Section.Content>
              <Section.Actions>
                <CopyButton
                  value={entry.value}
                  label={fill(m.copy, { label: entry.label })}
                  copiedLabel={m.copied}
                />
              </Section.Actions>
            </Section.Item>
          </Section.Row>
        ))}
      </Section.Body>
    </Section.Group>
  );
}

interface Detail {
  label: string;
  value: string;
}

type IdentityProviderMessages = Record<
  'metadataUrl' | 'ssoUrl' | 'issuer' | 'clientId' | 'discoveryUrl' | 'authUrl' | 'tokenUrl' | 'userInfoUrl',
  string
>;

function samlDetails(saml: Extract<SSOConnection, { family: 'saml' }>['saml'], m: IdentityProviderMessages): Detail[] {
  return saml.idpMetadataUrl
    ? [{ label: m.metadataUrl, value: saml.idpMetadataUrl }]
    : [
        { label: m.ssoUrl, value: saml.idpSsoUrl },
        { label: m.issuer, value: saml.idpEntityId },
      ];
}

function oidcDetails(oidc: Extract<SSOConnection, { family: 'oidc' }>['oidc'], m: IdentityProviderMessages): Detail[] {
  return [
    { label: m.clientId, value: oidc.clientId },
    ...(oidc.discoveryUrl
      ? [{ label: m.discoveryUrl, value: oidc.discoveryUrl }]
      : [
          { label: m.authUrl, value: oidc.authUrl },
          { label: m.tokenUrl, value: oidc.tokenUrl },
          { label: m.userInfoUrl, value: oidc.userInfoUrl },
        ]),
  ];
}

function IdentityProviderGroup({
  details,
  certificates = [],
  trigger,
}: {
  details: Detail[];
  certificates?: SSOCertificate[];
  trigger: (button: React.ReactElement) => React.ReactNode;
}) {
  const m = useMessages('organizationProfile').security.ssoConnection.identityProvider;
  const present = details.filter(detail => detail.value);
  return (
    <Section.Group>
      <Section.Header>
        <Section.Content>
          <Section.Title>{m.title}</Section.Title>
        </Section.Content>
        <Section.Actions>
          {trigger(
            <Button
              size='sm'
              variant='outline'
              color='neutral'
              aria-label={m.editLabel}
            >
              {m.edit}
            </Button>,
          )}
        </Section.Actions>
      </Section.Header>
      <Section.Body>
        {present.length === 0 ? (
          <Section.Row>
            <Section.Item>
              <Section.Content>
                <Section.Description>{m.notConfigured}</Section.Description>
              </Section.Content>
            </Section.Item>
          </Section.Row>
        ) : (
          present.map(detail => (
            <Section.Row key={detail.label}>
              <Section.Item>
                <Section.Content>
                  <Section.Label>{detail.label}</Section.Label>
                  <Section.Description
                    title={detail.value}
                    xstyle={truncationStyles.singleLine}
                  >
                    {detail.value}
                  </Section.Description>
                </Section.Content>
              </Section.Item>
            </Section.Row>
          ))
        )}
        {certificates.length > 0 ? <CertificatesRow certificates={certificates} /> : null}
      </Section.Body>
    </Section.Group>
  );
}

function CertificatesRow({ certificates }: { certificates: SSOCertificate[] }) {
  const m = useMessages('organizationProfile').security.ssoConnection.identityProvider;
  const locale = useLocale();
  const now = useNow().getTime();
  const earliest = earliestExpiring(certificates);
  const status = earliest ? certificateStatus(earliest, now) : 'unknown';
  const date = earliest?.expiresAt ? formatDate(new Date(earliest.expiresAt), locale) : undefined;
  const single = certificates.length === 1;
  const label = single ? m.certificateExpires : m.certificates;
  const value = single
    ? date
    : !date
      ? fill(m.certificatesCount, { count: String(certificates.length) })
      : fill(status === 'expired' ? m.certificatesSummaryExpired : m.certificatesSummary, {
          count: String(certificates.length),
          date,
        });
  if (!value) {
    return null;
  }
  return (
    <Section.Row>
      <Section.Item>
        <Section.Content>
          <Section.Label>{label}</Section.Label>
          <Section.Description>
            {status === 'expired' || status === 'expiring' ? (
              <Badge color={status === 'expired' ? 'negative' : 'warning'}>{value}</Badge>
            ) : (
              value
            )}
          </Section.Description>
        </Section.Content>
      </Section.Item>
    </Section.Row>
  );
}

function SettingsGroup({ settings }: { settings: SSOSettingsController }) {
  const m = useMessages('organizationProfile').security.ssoConnection.settings;
  return (
    <Section.Group>
      <Section.Header>
        <Section.Title>{m.title}</Section.Title>
      </Section.Header>
      <Section.Body>
        {settings.rows.map(row => (
          <Section.Row key={row.id}>
            <Section.Item>
              <Section.Content>
                <Section.Label>{m[row.id].label}</Section.Label>
                <Section.Description>{m[row.id].description}</Section.Description>
              </Section.Content>
              <Section.Actions>
                <Switch
                  aria-label={m[row.id].label}
                  checked={row.checked}
                  disabled={settings.isDisabled}
                  onChange={event => settings.onCheckedChange(row.id, event.currentTarget.checked)}
                />
              </Section.Actions>
            </Section.Item>
            <Section.Error>{row.error}</Section.Error>
          </Section.Row>
        ))}
      </Section.Body>
    </Section.Group>
  );
}

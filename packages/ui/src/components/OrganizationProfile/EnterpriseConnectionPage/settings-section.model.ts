import type { UpdateOrganizationEnterpriseConnectionParams } from '@clerk/shared/types';

import type { SSOConnection, SSOConnectionCommands } from '../../ConfigureSSO/configure-sso.types';

export type ProviderFamily = 'saml' | 'oidc';
export type SettingId =
  | 'syncUserAttributes'
  | 'allowAdditionalIdentifiers'
  | 'allowSubdomains'
  | 'allowIdpInitiated'
  | 'forceAuthn';

export type SettingsSectionProps = {
  connection: SSOConnection;
  family: ProviderFamily;
  updateConnection: SSOConnectionCommands['updateConnection'];
};

type Setting = {
  id: SettingId;
  appliesTo: 'all' | ProviderFamily;
  isChecked: (connection: SSOConnection) => boolean;
  toParams: (checked: boolean) => UpdateOrganizationEnterpriseConnectionParams;
};

const SETTINGS: ReadonlyArray<Setting> = [
  {
    id: 'syncUserAttributes',
    appliesTo: 'all',
    isChecked: connection => Boolean(connection.syncUserAttributes),
    toParams: syncUserAttributes => ({ syncUserAttributes }),
  },
  {
    id: 'allowAdditionalIdentifiers',
    appliesTo: 'all',
    isChecked: connection => !connection.disableAdditionalIdentifications,
    toParams: checked => ({ disableAdditionalIdentifications: !checked }),
  },
  {
    id: 'allowSubdomains',
    appliesTo: 'saml',
    isChecked: connection => Boolean(connection.samlConnection?.allowSubdomains),
    toParams: allowSubdomains => ({ saml: { allowSubdomains } }),
  },
  {
    id: 'allowIdpInitiated',
    appliesTo: 'saml',
    isChecked: connection => Boolean(connection.samlConnection?.allowIdpInitiated),
    toParams: allowIdpInitiated => ({ saml: { allowIdpInitiated } }),
  },
  {
    id: 'forceAuthn',
    appliesTo: 'saml',
    isChecked: connection => Boolean(connection.samlConnection?.forceAuthn),
    toParams: forceAuthn => ({ saml: { forceAuthn } }),
  },
];

const mergeParams = (
  params: UpdateOrganizationEnterpriseConnectionParams[],
): UpdateOrganizationEnterpriseConnectionParams =>
  params.reduce<UpdateOrganizationEnterpriseConnectionParams>(
    (merged, next) => ({
      ...merged,
      ...next,
      ...(merged.saml || next.saml ? { saml: { ...merged.saml, ...next.saml } } : {}),
    }),
    {},
  );

export const useSettingsSectionModel = ({ connection, family, updateConnection }: SettingsSectionProps) => {
  const initial = Object.fromEntries(SETTINGS.map(setting => [setting.id, setting.isChecked(connection)])) as Record<
    SettingId,
    boolean
  >;
  const applicable = SETTINGS.filter(setting => setting.appliesTo === 'all' || setting.appliesTo === family).map(
    setting => setting.id,
  );

  return {
    initial,
    applicable,
    signature: SETTINGS.map(setting => (setting.isChecked(connection) ? '1' : '0')).join(''),
    update: (changed: Array<{ id: SettingId; checked: boolean }>) =>
      updateConnection(
        connection.id,
        mergeParams(
          changed.map(({ id, checked }) => (SETTINGS.find(setting => setting.id === id) as Setting).toParams(checked)),
        ),
      ),
  };
};

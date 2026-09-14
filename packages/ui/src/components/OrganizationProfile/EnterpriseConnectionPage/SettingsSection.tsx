import type { EnterpriseConnectionResource, UpdateOrganizationEnterpriseConnectionParams } from '@clerk/shared/types';
import type React from 'react';

import { useCardState } from '@/elements/contexts';
import { Form } from '@/elements/Form';
import { FormButtons } from '@/elements/FormButtons';
import { ProfileSection } from '@/elements/Section';
import type { FormControlState } from '@/ui/utils/useFormControl';
import { useFormControl } from '@/ui/utils/useFormControl';
import { handleError } from '@/utils/errorHandler';

import { localizationKeys } from '../../../customizables';
import type { EnterpriseConnectionMutations } from '../../ConfigureSSO/hooks/useOrganizationEnterpriseConnection';

export type ProviderFamily = 'saml' | 'oidc';

type SettingId =
  | 'syncUserAttributes'
  | 'allowAdditionalIdentifiers'
  | 'allowSubdomains'
  | 'allowIdpInitiated'
  | 'forceAuthn';

type Setting = {
  id: SettingId;
  appliesTo: 'all' | ProviderFamily;
  isChecked: (connection: EnterpriseConnectionResource) => boolean;
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

const settingById = (id: SettingId): Setting => SETTINGS.find(setting => setting.id === id) as Setting;

const useSettingField = (id: SettingId, connection: EnterpriseConnectionResource) =>
  useFormControl(id, '', {
    type: 'checkbox',
    label: localizationKeys(`organizationProfile.securityPage.connectionPage.settings.${id}.label`),
    defaultChecked: settingById(id).isChecked(connection),
  });

const settingDescription = (id: SettingId) =>
  localizationKeys(`organizationProfile.securityPage.connectionPage.settings.${id}.description`);

type SettingsSectionProps = {
  connection: EnterpriseConnectionResource;
  family: ProviderFamily;
  updateConnection: EnterpriseConnectionMutations['updateConnection'];
};

export const SettingsSection = ({ connection, family, updateConnection }: SettingsSectionProps): JSX.Element => {
  const card = useCardState();

  const fields: Record<SettingId, FormControlState<SettingId>> = {
    syncUserAttributes: useSettingField('syncUserAttributes', connection),
    allowAdditionalIdentifiers: useSettingField('allowAdditionalIdentifiers', connection),
    allowSubdomains: useSettingField('allowSubdomains', connection),
    allowIdpInitiated: useSettingField('allowIdpInitiated', connection),
    forceAuthn: useSettingField('forceAuthn', connection),
  };

  const applicable = SETTINGS.filter(setting => setting.appliesTo === 'all' || setting.appliesTo === family);
  const changed = applicable.filter(setting => Boolean(fields[setting.id].checked) !== setting.isChecked(connection));

  const onReset = () => {
    card.setError(undefined);
    applicable.forEach(setting => fields[setting.id].setChecked(setting.isChecked(connection)));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (changed.length === 0) {
      return;
    }

    card.setError(undefined);

    try {
      await updateConnection(
        connection.id,
        mergeParams(changed.map(setting => setting.toParams(Boolean(fields[setting.id].checked)))),
      );
    } catch (err) {
      handleError(err as Error, [], card.setError);
    }
  };

  return (
    <ProfileSection.Root
      title={localizationKeys('organizationProfile.securityPage.connectionPage.settings.title')}
      id='sso'
      centered={false}
    >
      <Form.Root onSubmit={onSubmit}>
        {applicable.map(setting => (
          <Form.ControlRow
            key={setting.id}
            elementId={setting.id}
          >
            <Form.Checkbox
              {...fields[setting.id].props}
              description={settingDescription(setting.id)}
            />
          </Form.ControlRow>
        ))}

        <FormButtons
          isDisabled={changed.length === 0}
          onReset={onReset}
        />
      </Form.Root>
    </ProfileSection.Root>
  );
};

import type React from 'react';

import { Action } from '@/elements/Action';
import { Form } from '@/elements/Form';
import { FormButtons } from '@/elements/FormButtons';
import { FormContainer } from '@/elements/FormContainer';
import { ProfileSection } from '@/elements/Section';

import { Col, localizationKeys, Text } from '../../../customizables';
import { OidcEndpointsConfigurationForm } from '../../ConfigureSSO/steps/ConfigureStep/oidc/shared/OidcEndpointsConfigurationForm';
import { IdentityProviderConfigurationForm } from '../../ConfigureSSO/steps/ConfigureStep/saml/shared/IdentityProviderConfigurationForm';
import {
  IdentityProviderConfigurationModes,
  type OidcIdpConfigurationMode,
  type SamlIdpConfigurationMode,
} from '../../ConfigureSSO/steps/ConfigureStep/shared/IdentityProviderConfigurationModes';
import type {
  useOidcIdentityProviderController,
  useSamlIdentityProviderController,
} from './identity-provider-section.controller';
import type { Detail } from './identity-provider-section.types';

const SAML_MODES = ['metadataUrl', 'manual'] as const satisfies readonly SamlIdpConfigurationMode[];
const OIDC_MODES = ['discoveryUrl', 'manual'] as const satisfies readonly OidcIdpConfigurationMode[];

export const IdentityProviderSectionView = ({
  details,
  form,
}: {
  details: Detail[];
  form: React.ReactNode;
}): JSX.Element => {
  return (
    <ProfileSection.Root
      title={localizationKeys('organizationProfile.securityPage.connectionPage.identityProvider.title')}
      id='ssoConnectionIdentityProvider'
      centered={false}
    >
      <Action.Root>
        <Action.Closed value='edit'>
          <ProfileSection.Item id='ssoConnectionIdentityProvider'>
            <Col sx={t => ({ gap: t.space.$3, minWidth: 0 })}>
              {details
                .filter(detail => detail.value || detail.valueKey)
                .map(detail => (
                  <Col
                    key={detail.id}
                    sx={t => ({ gap: t.space.$0x5 })}
                  >
                    <Text
                      colorScheme='secondary'
                      variant='caption'
                      localizationKey={detail.label}
                    />
                    <Text
                      sx={{ overflowWrap: 'anywhere' }}
                      colorScheme={detail.tone}
                      localizationKey={detail.valueKey}
                    >
                      {detail.value}
                    </Text>
                  </Col>
                ))}
            </Col>

            <Action.Trigger value='edit'>
              <ProfileSection.Button
                id='ssoConnectionIdentityProvider'
                localizationKey={localizationKeys(
                  'organizationProfile.securityPage.connectionPage.identityProvider.editButton',
                )}
              />
            </Action.Trigger>
          </ProfileSection.Item>
        </Action.Closed>

        <Action.Open value='edit'>
          <Action.Card>{form}</Action.Card>
        </Action.Open>
      </Action.Root>
    </ProfileSection.Root>
  );
};

export const SamlIdentityProviderView = ({
  mode,
  formProps,
  isDisabled,
  onSubmit,
  onReset,
  onModeChange,
}: ReturnType<typeof useSamlIdentityProviderController>): JSX.Element => {
  return (
    <FormContainer
      headerTitle={localizationKeys('organizationProfile.securityPage.connectionPage.identityProvider.form.title')}
    >
      <Form.Root onSubmit={onSubmit}>
        <IdentityProviderConfigurationModes
          modes={SAML_MODES}
          value={mode}
          onChange={onModeChange}
          labels={{
            ariaLabel: localizationKeys(
              'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.modes.ariaLabel',
            ),
            metadataUrl: localizationKeys(
              'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.modes.metadataUrl',
            ),
            manual: localizationKeys('configureSSO.configureStep.samlCustom.identityProviderMetadataStep.modes.manual'),
          }}
        />

        <IdentityProviderConfigurationForm {...formProps} />

        <FormButtons
          isDisabled={isDisabled}
          onReset={onReset}
        />
      </Form.Root>
    </FormContainer>
  );
};

export const OidcIdentityProviderView = ({
  mode,
  clientIdField,
  clientSecretField,
  endpointsProps,
  isDisabled,
  onSubmit,
  onReset,
  onModeChange,
}: ReturnType<typeof useOidcIdentityProviderController>): JSX.Element => {
  return (
    <FormContainer
      headerTitle={localizationKeys('organizationProfile.securityPage.connectionPage.identityProvider.form.title')}
    >
      <Form.Root onSubmit={onSubmit}>
        <Form.ControlRow elementId={clientIdField.id}>
          <Form.PlainInput {...clientIdField.props} />
        </Form.ControlRow>

        <Form.ControlRow elementId={clientSecretField.id}>
          <Form.PasswordInput {...clientSecretField.props} />
        </Form.ControlRow>

        <IdentityProviderConfigurationModes
          modes={OIDC_MODES}
          value={mode}
          onChange={onModeChange}
          labels={{
            ariaLabel: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.modes.ariaLabel'),
            discoveryUrl: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.modes.discoveryUrl'),
            manual: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.modes.manual'),
          }}
        />

        <OidcEndpointsConfigurationForm {...endpointsProps} />

        <FormButtons
          isDisabled={isDisabled}
          onReset={onReset}
        />
      </Form.Root>
    </FormContainer>
  );
};

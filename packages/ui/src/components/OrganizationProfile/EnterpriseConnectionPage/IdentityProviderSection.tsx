import type { EnterpriseConnectionResource } from '@clerk/shared/types';
import type React from 'react';
import { useState } from 'react';

import { useCardState } from '@/elements/contexts';
import { Form } from '@/elements/Form';
import { FormButtonContainer } from '@/elements/FormButtons';
import { ProfileSection } from '@/elements/Section';
import { formatDate } from '@/ui/utils/formatDate';
import { useFormControl } from '@/ui/utils/useFormControl';
import { handleError } from '@/utils/errorHandler';

import { Col, localizationKeys, Text } from '../../../customizables';
import { isOidcProvider } from '../../ConfigureSSO/domain/organizationEnterpriseConnection';
import type { EnterpriseConnectionMutations } from '../../ConfigureSSO/hooks/useOrganizationEnterpriseConnection';
import {
  OidcEndpointsConfigurationForm,
  type OidcEndpointsConfigurationFormProps,
} from '../../ConfigureSSO/steps/ConfigureStep/oidc/shared/OidcEndpointsConfigurationForm';
import {
  applySamlSubmitError,
  buildSamlConfigurationPayload,
  IdentityProviderConfigurationForm,
  type IdentityProviderConfigurationFormProps,
} from '../../ConfigureSSO/steps/ConfigureStep/saml/shared/IdentityProviderConfigurationForm';
import {
  IdentityProviderConfigurationModes,
  type OidcIdpConfigurationMode,
  type SamlIdpConfigurationMode,
} from '../../ConfigureSSO/steps/ConfigureStep/shared/IdentityProviderConfigurationModes';

type IdentityProviderSectionProps = {
  connection: EnterpriseConnectionResource;
  updateConnection: EnterpriseConnectionMutations['updateConnection'];
};

const SAML_MODES = ['metadataUrl', 'manual'] as const satisfies readonly SamlIdpConfigurationMode[];
const OIDC_MODES = ['discoveryUrl', 'manual'] as const satisfies readonly OidcIdpConfigurationMode[];

export const IdentityProviderSection = (props: IdentityProviderSectionProps): JSX.Element => (
  <ProfileSection.Root
    title={localizationKeys('organizationProfile.securityPage.connectionPage.identityProvider.title')}
    id='sso'
    centered={false}
  >
    <Col gap={5}>
      <Text
        as='p'
        colorScheme='secondary'
        localizationKey={localizationKeys(
          'organizationProfile.securityPage.connectionPage.identityProvider.description',
        )}
      />
      {isOidcProvider(props.connection.provider) ? <OidcForm {...props} /> : <SamlForm {...props} />}
    </Col>
  </ProfileSection.Root>
);

const SaveButton = ({ isDisabled }: { isDisabled: boolean }): JSX.Element => (
  <FormButtonContainer>
    <Form.SubmitButton
      block={false}
      isDisabled={isDisabled}
      localizationKey={localizationKeys('organizationProfile.securityPage.connectionPage.saveButton')}
    />
  </FormButtonContainer>
);

const SamlForm = ({ connection, updateConnection }: IdentityProviderSectionProps): JSX.Element => {
  const card = useCardState();
  const saml = connection.samlConnection;
  const existingCertPresent = Boolean(saml?.idpCertificate);

  const [mode, setMode] = useState<SamlIdpConfigurationMode>(
    saml?.idpSsoUrl || saml?.idpEntityId || saml?.idpCertificate ? 'manual' : 'metadataUrl',
  );
  const [certFile, setCertFile] = useState<File | null>(null);

  const metadataUrlField = useFormControl('idpMetadataUrl', saml?.idpMetadataUrl ?? '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.samlCustom.identityProviderMetadataStep.metadataUrl.label'),
    placeholder: localizationKeys(
      'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.metadataUrl.placeholder',
    ),
    isRequired: true,
  });

  const signOnUrlField = useFormControl('idpSsoUrl', saml?.idpSsoUrl ?? '', {
    type: 'text',
    label: localizationKeys(
      'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.signOnUrl.label',
    ),
    placeholder: localizationKeys(
      'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.signOnUrl.placeholder',
    ),
    isRequired: true,
  });

  const issuerField = useFormControl('idpEntityId', saml?.idpEntityId ?? '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.issuer.label'),
    placeholder: localizationKeys(
      'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.issuer.placeholder',
    ),
    isRequired: true,
  });

  const certificateField = useFormControl('idpCertificate', '', {
    type: 'text',
    label: localizationKeys(
      'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.signingCertificate.label',
    ),
    isRequired: true,
  });

  const isValid =
    mode === 'metadataUrl'
      ? metadataUrlField.value.trim().length > 0
      : signOnUrlField.value.trim().length > 0 &&
        issuerField.value.trim().length > 0 &&
        (certFile !== null || existingCertPresent);

  const formProps: IdentityProviderConfigurationFormProps =
    mode === 'metadataUrl'
      ? {
          mode: 'metadataUrl',
          form: { field: metadataUrlField },
          labels: {
            description: localizationKeys(
              'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.metadataUrl.description',
            ),
          },
        }
      : {
          mode: 'manual',
          form: {
            signOnUrlField,
            issuerField,
            certificateField,
            certFile,
            onCertFileChange: setCertFile,
            existingCertPresent,
          },
          labels: {
            description: localizationKeys(
              'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.description',
            ),
            uploadFile: localizationKeys(
              'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.signingCertificate.uploadFile',
            ),
            replaceFile: localizationKeys(
              'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.signingCertificate.replaceFile',
            ),
            removeFile: localizationKeys(
              'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.signingCertificate.removeFile',
            ),
            fileUploaded: localizationKeys(
              'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.signingCertificate.fileUploaded',
            ),
          },
        };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      return;
    }

    card.setError(undefined);

    try {
      const payload = await buildSamlConfigurationPayload({
        mode,
        metadataUrl: { value: metadataUrlField.value },
        manual: { signOnUrl: signOnUrlField.value, issuer: issuerField.value, certFile },
      });

      await updateConnection(connection.id, { saml: payload });
    } catch (err) {
      if (mode === 'metadataUrl') {
        applySamlSubmitError(err, card, metadataUrlField);
      } else {
        applySamlSubmitError(err, card, signOnUrlField, [issuerField, certificateField]);
      }
    }
  };

  return (
    <Form.Root onSubmit={onSubmit}>
      <IdentityProviderConfigurationModes
        modes={SAML_MODES}
        value={mode}
        onChange={next => {
          card.setError(undefined);
          setMode(next);
        }}
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

      {saml && saml.idpCertificateExpiresAt > 0 && (
        <Text
          colorScheme='secondary'
          variant='caption'
          localizationKey={localizationKeys(
            'organizationProfile.securityPage.connectionPage.identityProvider.certificateExpires',
            { date: formatDate(new Date(saml.idpCertificateExpiresAt)) },
          )}
        />
      )}

      <SaveButton isDisabled={!isValid} />
    </Form.Root>
  );
};

const OidcForm = ({ connection, updateConnection }: IdentityProviderSectionProps): JSX.Element => {
  const card = useCardState();
  const oauthConfig = connection.oauthConfig;

  const [mode, setMode] = useState<OidcIdpConfigurationMode>(
    oauthConfig?.authUrl || oauthConfig?.tokenUrl ? 'manual' : 'discoveryUrl',
  );

  const clientIdField = useFormControl('clientId', oauthConfig?.clientId ?? '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.credentialsStep.clientId.label'),
    placeholder: localizationKeys('configureSSO.configureStep.oidcCustom.credentialsStep.clientId.placeholder'),
    isRequired: true,
  });

  const clientSecretField = useFormControl('clientSecret', '', {
    type: 'password',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.credentialsStep.clientSecret.label'),
    placeholder: localizationKeys(
      'organizationProfile.securityPage.connectionPage.identityProvider.clientSecret.placeholder',
    ),
  });

  const discoveryUrlField = useFormControl('discoveryUrl', oauthConfig?.discoveryUrl ?? '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.discoveryUrl.label'),
    placeholder: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.discoveryUrl.placeholder'),
    isRequired: true,
  });

  const authUrlField = useFormControl('authUrl', oauthConfig?.authUrl ?? '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.authUrl.label'),
    placeholder: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.authUrl.placeholder'),
    isRequired: true,
  });

  const tokenUrlField = useFormControl('tokenUrl', oauthConfig?.tokenUrl ?? '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.tokenUrl.label'),
    placeholder: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.tokenUrl.placeholder'),
    isRequired: true,
  });

  const userInfoUrlField = useFormControl('userInfoUrl', oauthConfig?.userInfoUrl ?? '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.userInfoUrl.label'),
    placeholder: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.userInfoUrl.placeholder'),
  });

  const isValid =
    clientIdField.value.trim().length > 0 &&
    (mode === 'discoveryUrl'
      ? discoveryUrlField.value.trim().length > 0
      : authUrlField.value.trim().length > 0 && tokenUrlField.value.trim().length > 0);

  const endpointsProps: OidcEndpointsConfigurationFormProps =
    mode === 'discoveryUrl'
      ? {
          mode: 'discoveryUrl',
          form: { discoveryUrlField },
          labels: {
            description: localizationKeys(
              'configureSSO.configureStep.oidcCustom.endpointsStep.discoveryUrl.description',
            ),
          },
        }
      : {
          mode: 'manual',
          form: { authUrlField, tokenUrlField, userInfoUrlField },
          labels: {
            description: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.description'),
          },
        };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      return;
    }

    card.setError(undefined);

    try {
      await updateConnection(connection.id, {
        oidc: {
          clientId: clientIdField.value.trim(),
          clientSecret: clientSecretField.value.trim() || undefined,
          ...(mode === 'discoveryUrl'
            ? { discoveryUrl: discoveryUrlField.value.trim() }
            : {
                authUrl: authUrlField.value.trim(),
                tokenUrl: tokenUrlField.value.trim(),
                userInfoUrl: userInfoUrlField.value.trim(),
              }),
        },
      });
    } catch (err) {
      handleError(err as Error, [clientIdField, clientSecretField], card.setError);
    }
  };

  return (
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
        onChange={next => {
          card.setError(undefined);
          setMode(next);
        }}
        labels={{
          ariaLabel: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.modes.ariaLabel'),
          discoveryUrl: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.modes.discoveryUrl'),
          manual: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.modes.manual'),
        }}
      />

      <OidcEndpointsConfigurationForm {...endpointsProps} />

      <SaveButton isDisabled={!isValid} />
    </Form.Root>
  );
};

import type { EnterpriseConnectionResource } from '@clerk/shared/types';
import type React from 'react';
import { useState } from 'react';

import { Action } from '@/elements/Action';
import { useActionContext } from '@/elements/Action/ActionRoot';
import { useCardState, withCardStateProvider } from '@/elements/contexts';
import { Form } from '@/elements/Form';
import { FormButtons } from '@/elements/FormButtons';
import { FormContainer } from '@/elements/FormContainer';
import { ProfileSection } from '@/elements/Section';
import { formatDate } from '@/ui/utils/formatDate';
import { useFormControl } from '@/ui/utils/useFormControl';
import { handleError } from '@/utils/errorHandler';

import type { LocalizationKey } from '../../../customizables';
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

type FormScreenProps = IdentityProviderSectionProps & { onSuccess: () => void; onReset: () => void };

type Detail = { id: string; label: LocalizationKey; value: string };

const SAML_MODES = ['metadataUrl', 'manual'] as const satisfies readonly SamlIdpConfigurationMode[];
const OIDC_MODES = ['discoveryUrl', 'manual'] as const satisfies readonly OidcIdpConfigurationMode[];

const samlDetails = (connection: EnterpriseConnectionResource): Detail[] => {
  const saml = connection.samlConnection;

  const details: Detail[] = saml?.idpMetadataUrl
    ? [
        {
          id: 'idpMetadataUrl',
          label: localizationKeys(
            'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.metadataUrl.label',
          ),
          value: saml.idpMetadataUrl,
        },
      ]
    : [
        {
          id: 'idpSsoUrl',
          label: localizationKeys(
            'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.signOnUrl.label',
          ),
          value: saml?.idpSsoUrl ?? '',
        },
        {
          id: 'idpEntityId',
          label: localizationKeys(
            'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.issuer.label',
          ),
          value: saml?.idpEntityId ?? '',
        },
      ];

  if (saml && saml.idpCertificateExpiresAt > 0) {
    details.push({
      id: 'idpCertificateExpiresAt',
      label: localizationKeys('organizationProfile.securityPage.connectionPage.identityProvider.certificateExpires'),
      value: formatDate(new Date(saml.idpCertificateExpiresAt)),
    });
  }

  return details;
};

const oidcDetails = (connection: EnterpriseConnectionResource): Detail[] => {
  const oauthConfig = connection.oauthConfig;

  return [
    {
      id: 'clientId',
      label: localizationKeys('configureSSO.configureStep.oidcCustom.credentialsStep.clientId.label'),
      value: oauthConfig?.clientId ?? '',
    },
    ...(oauthConfig?.discoveryUrl
      ? [
          {
            id: 'discoveryUrl',
            label: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.discoveryUrl.label'),
            value: oauthConfig.discoveryUrl,
          },
        ]
      : [
          {
            id: 'authUrl',
            label: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.authUrl.label'),
            value: oauthConfig?.authUrl ?? '',
          },
          {
            id: 'tokenUrl',
            label: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.tokenUrl.label'),
            value: oauthConfig?.tokenUrl ?? '',
          },
        ]),
  ];
};

export const IdentityProviderSection = (props: IdentityProviderSectionProps): JSX.Element => {
  const isOidc = isOidcProvider(props.connection.provider);
  const details = isOidc ? oidcDetails(props.connection) : samlDetails(props.connection);

  return (
    <ProfileSection.Root
      title={localizationKeys('organizationProfile.securityPage.connectionPage.identityProvider.title')}
      id='sso'
      centered={false}
    >
      <Action.Root>
        <Action.Closed value='edit'>
          <ProfileSection.Item id='sso'>
            <Col sx={t => ({ gap: t.space.$3, minWidth: 0 })}>
              {details
                .filter(detail => detail.value)
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
                    <Text sx={{ overflowWrap: 'anywhere' }}>{detail.value}</Text>
                  </Col>
                ))}
            </Col>

            <Action.Trigger value='edit'>
              <ProfileSection.Button
                id='sso'
                localizationKey={localizationKeys(
                  'organizationProfile.securityPage.connectionPage.identityProvider.editButton',
                )}
              />
            </Action.Trigger>
          </ProfileSection.Item>
        </Action.Closed>

        <Action.Open value='edit'>
          <Action.Card>
            <IdentityProviderScreen
              {...props}
              isOidc={isOidc}
            />
          </Action.Card>
        </Action.Open>
      </Action.Root>
    </ProfileSection.Root>
  );
};

const IdentityProviderScreen = ({
  isOidc,
  ...props
}: IdentityProviderSectionProps & { isOidc: boolean }): JSX.Element => {
  const { close } = useActionContext();

  return isOidc ? (
    <OidcForm
      {...props}
      onSuccess={close}
      onReset={close}
    />
  ) : (
    <SamlForm
      {...props}
      onSuccess={close}
      onReset={close}
    />
  );
};

const SamlForm = withCardStateProvider(
  ({ connection, updateConnection, onSuccess, onReset }: FormScreenProps): JSX.Element => {
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
        onSuccess();
      } catch (err) {
        if (mode === 'metadataUrl') {
          applySamlSubmitError(err, card, metadataUrlField);
        } else {
          applySamlSubmitError(err, card, signOnUrlField, [issuerField, certificateField]);
        }
      }
    };

    return (
      <FormContainer
        headerTitle={localizationKeys('organizationProfile.securityPage.connectionPage.identityProvider.form.title')}
      >
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
              manual: localizationKeys(
                'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.modes.manual',
              ),
            }}
          />

          <IdentityProviderConfigurationForm {...formProps} />

          <FormButtons
            isDisabled={!isValid}
            onReset={onReset}
          />
        </Form.Root>
      </FormContainer>
    );
  },
);

const OidcForm = withCardStateProvider(
  ({ connection, updateConnection, onSuccess, onReset }: FormScreenProps): JSX.Element => {
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
      placeholder: localizationKeys(
        'configureSSO.configureStep.oidcCustom.endpointsStep.manual.userInfoUrl.placeholder',
      ),
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
        onSuccess();
      } catch (err) {
        handleError(err as Error, [clientIdField, clientSecretField], card.setError);
      }
    };

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

          <FormButtons
            isDisabled={!isValid}
            onReset={onReset}
          />
        </Form.Root>
      </FormContainer>
    );
  },
);

import type React from 'react';
import { useState } from 'react';

import { useCardState } from '@/elements/contexts';
import { useFormControl } from '@/ui/utils/useFormControl';
import { handleError } from '@/utils/errorHandler';

import { localizationKeys } from '../../../customizables';
import { type IdpCertificateEntry } from '../../ConfigureSSO/domain/idpCertificates';
import { type OidcEndpointsConfigurationFormProps } from '../../ConfigureSSO/steps/ConfigureStep/oidc/shared/OidcEndpointsConfigurationForm';
import {
  applySamlSubmitError,
  type IdentityProviderConfigurationFormProps,
} from '../../ConfigureSSO/steps/ConfigureStep/saml/shared/IdentityProviderConfigurationForm';
import {
  type OidcIdpConfigurationMode,
  type SamlIdpConfigurationMode,
} from '../../ConfigureSSO/steps/ConfigureStep/shared/IdentityProviderConfigurationModes';
import type { useOidcIdentityProviderModel, useSamlIdentityProviderModel } from './identity-provider-section.model';

export const useSamlIdentityProviderController = (
  model: ReturnType<typeof useSamlIdentityProviderModel>,
  { onSuccess, onReset }: { onSuccess: () => void; onReset: () => void },
) => {
  const card = useCardState();
  const initialCertificates = model.initialCertificates;

  const [mode, setMode] = useState<SamlIdpConfigurationMode>(model.idpMetadataUrl ? 'metadataUrl' : 'manual');
  const [certificates, setCertificates] = useState<IdpCertificateEntry[]>(initialCertificates);

  const metadataUrlField = useFormControl('idpMetadataUrl', model.idpMetadataUrl, {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.samlCustom.identityProviderMetadataStep.metadataUrl.label'),
    placeholder: localizationKeys(
      'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.metadataUrl.placeholder',
    ),
    isRequired: true,
  });

  const signOnUrlField = useFormControl('idpSsoUrl', model.idpSsoUrl, {
    type: 'text',
    label: localizationKeys(
      'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.signOnUrl.label',
    ),
    placeholder: localizationKeys(
      'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.signOnUrl.placeholder',
    ),
    isRequired: true,
  });

  const issuerField = useFormControl('idpEntityId', model.idpEntityId, {
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
      : signOnUrlField.value.trim().length > 0 && issuerField.value.trim().length > 0 && certificates.length > 0;

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
            certificates,
            onCertificatesChange: setCertificates,
            initialCertificates,
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

    if (!isValid || card.isLoading) {
      return;
    }

    card.setError(undefined);

    try {
      await model.update({
        mode,
        metadataUrl: { value: metadataUrlField.value },
        manual: { signOnUrl: signOnUrlField.value, issuer: issuerField.value, certificates, initialCertificates },
      });
      onSuccess();
    } catch (err) {
      if (mode === 'metadataUrl') {
        applySamlSubmitError(err, card, metadataUrlField);
      } else {
        applySamlSubmitError(err, card, signOnUrlField, [issuerField, certificateField]);
      }
    }
  };

  const onModeChange = (next: SamlIdpConfigurationMode) => {
    card.setError(undefined);
    setMode(next);
  };

  return { mode, formProps, isDisabled: !isValid || card.isLoading, onSubmit, onReset, onModeChange };
};

export const useOidcIdentityProviderController = (
  model: ReturnType<typeof useOidcIdentityProviderModel>,
  { onSuccess, onReset }: { onSuccess: () => void; onReset: () => void },
) => {
  const card = useCardState();
  const [mode, setMode] = useState<OidcIdpConfigurationMode>(model.discoveryUrl ? 'discoveryUrl' : 'manual');

  const clientIdField = useFormControl('clientId', model.clientId, {
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

  const discoveryUrlField = useFormControl('discoveryUrl', model.discoveryUrl, {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.discoveryUrl.label'),
    placeholder: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.discoveryUrl.placeholder'),
    isRequired: true,
  });

  const authUrlField = useFormControl('authUrl', model.authUrl, {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.authUrl.label'),
    placeholder: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.authUrl.placeholder'),
    isRequired: true,
  });

  const tokenUrlField = useFormControl('tokenUrl', model.tokenUrl, {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.tokenUrl.label'),
    placeholder: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.tokenUrl.placeholder'),
    isRequired: true,
  });

  const userInfoUrlField = useFormControl('userInfoUrl', model.userInfoUrl, {
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

    if (!isValid || card.isLoading) {
      return;
    }

    card.setError(undefined);

    try {
      await model.update({
        mode,
        clientId: clientIdField.value,
        clientSecret: clientSecretField.value,
        discoveryUrl: discoveryUrlField.value,
        authUrl: authUrlField.value,
        tokenUrl: tokenUrlField.value,
        userInfoUrl: userInfoUrlField.value,
      });
      onSuccess();
    } catch (err) {
      handleError(err as Error, [clientIdField, clientSecretField], card.setError);
    }
  };

  const onModeChange = (next: OidcIdpConfigurationMode) => {
    card.setError(undefined);
    setMode(next);
  };

  return {
    mode,
    clientIdField,
    clientSecretField,
    endpointsProps,
    isDisabled: !isValid || card.isLoading,
    onSubmit,
    onReset,
    onModeChange,
  };
};

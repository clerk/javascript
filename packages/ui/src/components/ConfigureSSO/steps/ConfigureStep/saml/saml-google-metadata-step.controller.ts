import type React from 'react';
import { useReducer } from 'react';

import { localizationKeys } from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { useFormControl } from '@/ui/utils/useFormControl';

import type { IdpCertificateEntry } from '../../../domain/idpCertificates';
import { useWizard } from '../../../elements/Wizard';
import type { SamlIdpConfigurationMode } from '../shared/IdentityProviderConfigurationModes';
import type { useSamlGoogleMetadataStepModel } from './saml-google-metadata-step.model';
import {
  applySamlSubmitError,
  type IdentityProviderConfigurationFormProps,
} from './shared/IdentityProviderConfigurationForm';

type Model = ReturnType<typeof useSamlGoogleMetadataStepModel>;
type MetadataState = {
  mode: SamlIdpConfigurationMode;
  metadataFile: File | null;
  certificates: IdpCertificateEntry[];
  isSubmitting: boolean;
};
type MetadataEvent =
  | { type: 'mode'; mode: SamlIdpConfigurationMode }
  | { type: 'file'; file: File | null }
  | { type: 'certificates'; value: React.SetStateAction<IdpCertificateEntry[]> }
  | { type: 'submit' }
  | { type: 'fail' };

const reduceMetadata = (state: MetadataState, event: MetadataEvent): MetadataState => {
  switch (event.type) {
    case 'mode':
      return { ...state, mode: event.mode };
    case 'file':
      return { ...state, metadataFile: event.file };
    case 'certificates':
      return {
        ...state,
        certificates: typeof event.value === 'function' ? event.value(state.certificates) : event.value,
      };
    case 'submit':
      return { ...state, isSubmitting: true };
    case 'fail':
      return { ...state, isSubmitting: false };
  }
};

export const useSamlGoogleMetadataStepController = (model: Model) => {
  const card = useCardState();
  const { goNext, goPrev, isFirstStep } = useWizard();
  const [state, dispatch] = useReducer(reduceMetadata, {
    mode: model.initialMode,
    metadataFile: null,
    certificates: model.initialCertificates,
    isSubmitting: false,
  });
  const { mode, metadataFile, certificates, isSubmitting } = state;
  const setMetadataFile = (file: File | null) => dispatch({ type: 'file', file });
  const setCertificates: React.Dispatch<React.SetStateAction<IdpCertificateEntry[]>> = value =>
    dispatch({ type: 'certificates', value });

  const metadataFileField = useFormControl('idpMetadata', '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.metadataFile.label'),
    isRequired: true,
  });
  const signOnUrlField = useFormControl('idpSsoUrl', model.initialValues.signOnUrl, {
    type: 'text',
    label: localizationKeys(
      'configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.manual.signOnUrl.label',
    ),
    placeholder: localizationKeys(
      'configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.manual.signOnUrl.placeholder',
    ),
    isRequired: true,
  });
  const issuerField = useFormControl('idpEntityId', model.initialValues.issuer, {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.manual.issuer.label'),
    placeholder: localizationKeys(
      'configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.manual.issuer.placeholder',
    ),
    isRequired: true,
  });
  const certificateField = useFormControl('idpCertificate', '', {
    type: 'text',
    label: localizationKeys(
      'configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.manual.signingCertificate.label',
    ),
    isRequired: true,
  });

  const trimmedSignOnUrl = signOnUrlField.value.trim();
  const trimmedIssuer = issuerField.value.trim();
  const hasCert = certificates.length > 0;
  const hasMetadataFile = metadataFile !== null || model.existingMetadataPresent;
  const isValid =
    mode === 'metadataFile' ? hasMetadataFile : trimmedSignOnUrl.length > 0 && trimmedIssuer.length > 0 && hasCert;
  const canSubmit = isValid && !isSubmitting;

  const formProps: IdentityProviderConfigurationFormProps =
    mode === 'metadataFile'
      ? {
          mode: 'metadataFile',
          form: {
            field: metadataFileField,
            file: metadataFile,
            onFileChange: setMetadataFile,
            existingFilePresent: model.existingMetadataPresent,
          },
          labels: {
            description: localizationKeys(
              'configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.metadataFile.description',
            ),
            uploadFile: localizationKeys(
              'configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.metadataFile.uploadFile',
            ),
            replaceFile: localizationKeys(
              'configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.metadataFile.replaceFile',
            ),
            removeFile: localizationKeys(
              'configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.metadataFile.removeFile',
            ),
            fileUploaded: localizationKeys(
              'configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.metadataFile.fileUploaded',
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
            initialCertificates: model.initialCertificates,
          },
          labels: {
            description: localizationKeys(
              'configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.manual.description',
            ),
            uploadFile: localizationKeys(
              'configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.manual.signingCertificate.uploadFile',
            ),
            replaceFile: localizationKeys(
              'configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.manual.signingCertificate.replaceFile',
            ),
            removeFile: localizationKeys(
              'configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.manual.signingCertificate.removeFile',
            ),
            fileUploaded: localizationKeys(
              'configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.manual.signingCertificate.fileUploaded',
            ),
          },
        };

  const handleModeChange = (next: SamlIdpConfigurationMode) => {
    card.setError(undefined);
    dispatch({ type: 'mode', mode: next });
  };

  const handleContinue = async (): Promise<void> => {
    if (!model.hasConnection || !canSubmit) {
      return;
    }
    card.setError(undefined);
    dispatch({ type: 'submit' });
    try {
      await model.submitConfiguration({
        mode,
        metadataFile: { file: metadataFile },
        manual: {
          signOnUrl: signOnUrlField.value,
          issuer: issuerField.value,
          certificates,
          initialCertificates: model.initialCertificates,
        },
      });
      // `goNext` bubbles to the parent, which DEFERS the advance to `test` until
      // the revalidate lands. The button STAYS loading and this nested step
      // unmounts when that deferred advance resolves — do NOT reset on success.
      void goNext();
    } catch (err) {
      if (mode === 'metadataFile') {
        applySamlSubmitError(err, card, metadataFileField);
      } else {
        applySamlSubmitError(err, card, signOnUrlField, [issuerField, certificateField]);
      }
      // Re-enable ONLY on error — there is no advance to unmount the button.
      dispatch({ type: 'fail' });
    }
  };

  return { mode, formProps, isSubmitting, canSubmit, goPrev, isFirstStep, handleModeChange, handleContinue };
};

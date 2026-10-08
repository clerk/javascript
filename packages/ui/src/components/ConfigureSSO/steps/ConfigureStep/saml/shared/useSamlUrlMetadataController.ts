import type React from 'react';
import { useReducer } from 'react';

import type { LocalizationKey } from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { useFormControl } from '@/ui/utils/useFormControl';

import type { IdpCertificateEntry } from '../../../../domain/idpCertificates';
import { useWizard } from '../../../../elements/Wizard';
import type { SamlIdpConfigurationMode } from '../../shared/IdentityProviderConfigurationModes';
import { applySamlSubmitError, type IdentityProviderConfigurationFormProps } from './IdentityProviderConfigurationForm';
import type { useSamlUrlMetadataModel } from './useSamlUrlMetadataModel';

type Model = ReturnType<typeof useSamlUrlMetadataModel>;
type MetadataState = { mode: SamlIdpConfigurationMode; certificates: IdpCertificateEntry[]; isSubmitting: boolean };
type MetadataEvent =
  | { type: 'mode'; mode: SamlIdpConfigurationMode }
  | { type: 'certificates'; value: React.SetStateAction<IdpCertificateEntry[]> }
  | { type: 'submit' }
  | { type: 'fail' };

const reduceMetadata = (state: MetadataState, event: MetadataEvent): MetadataState => {
  switch (event.type) {
    case 'mode':
      return { ...state, mode: event.mode };
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

export type SamlUrlMetadataLabels = {
  metadataUrl: { label: LocalizationKey; placeholder: LocalizationKey; description: LocalizationKey };
  manual: {
    signOnUrl: { label: LocalizationKey; placeholder: LocalizationKey };
    issuer: { label: LocalizationKey; placeholder: LocalizationKey };
    certificate: {
      label: LocalizationKey;
      uploadFile: LocalizationKey;
      replaceFile: LocalizationKey;
      removeFile: LocalizationKey;
      fileUploaded: LocalizationKey;
    };
    description: LocalizationKey;
  };
};

export const useSamlUrlMetadataController = (model: Model, labels: SamlUrlMetadataLabels) => {
  const card = useCardState();
  const { goNext, goPrev, isFirstStep } = useWizard();
  const [state, dispatch] = useReducer(reduceMetadata, {
    mode: model.initialMode,
    certificates: model.initialCertificates,
    isSubmitting: false,
  });
  const { mode, certificates, isSubmitting } = state;
  const setCertificates: React.Dispatch<React.SetStateAction<IdpCertificateEntry[]>> = value =>
    dispatch({ type: 'certificates', value });

  const metadataUrlField = useFormControl('idpMetadataUrl', model.initialValues.metadataUrl, {
    type: 'text',
    label: labels.metadataUrl.label,
    placeholder: labels.metadataUrl.placeholder,
    isRequired: true,
  });
  const signOnUrlField = useFormControl('idpSsoUrl', model.initialValues.signOnUrl, {
    type: 'text',
    label: labels.manual.signOnUrl.label,
    placeholder: labels.manual.signOnUrl.placeholder,
    isRequired: true,
  });
  const issuerField = useFormControl('idpEntityId', model.initialValues.issuer, {
    type: 'text',
    label: labels.manual.issuer.label,
    placeholder: labels.manual.issuer.placeholder,
    isRequired: true,
  });
  const certificateField = useFormControl('idpCertificate', '', {
    type: 'text',
    label: labels.manual.certificate.label,
    isRequired: true,
  });

  const trimmedMetadataUrl = metadataUrlField.value.trim();
  const trimmedSignOnUrl = signOnUrlField.value.trim();
  const trimmedIssuer = issuerField.value.trim();
  const hasCert = certificates.length > 0;
  const isValid =
    mode === 'metadataUrl'
      ? trimmedMetadataUrl.length > 0
      : trimmedSignOnUrl.length > 0 && trimmedIssuer.length > 0 && hasCert;
  const canSubmit = isValid && !isSubmitting;

  const formProps: IdentityProviderConfigurationFormProps =
    mode === 'metadataUrl'
      ? {
          mode: 'metadataUrl',
          form: { field: metadataUrlField },
          labels: {
            description: labels.metadataUrl.description,
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
            description: labels.manual.description,
            uploadFile: labels.manual.certificate.uploadFile,
            replaceFile: labels.manual.certificate.replaceFile,
            removeFile: labels.manual.certificate.removeFile,
            fileUploaded: labels.manual.certificate.fileUploaded,
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
        metadataUrl: { value: metadataUrlField.value },
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
      if (mode === 'metadataUrl') {
        applySamlSubmitError(err, card, metadataUrlField);
      } else {
        applySamlSubmitError(err, card, signOnUrlField, [issuerField, certificateField]);
      }
      // Re-enable ONLY on error — there is no advance to unmount the button.
      dispatch({ type: 'fail' });
    }
  };

  return { mode, formProps, isSubmitting, canSubmit, goPrev, isFirstStep, handleModeChange, handleContinue };
};

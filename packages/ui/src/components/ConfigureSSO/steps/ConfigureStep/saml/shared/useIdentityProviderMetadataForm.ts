import { isClerkAPIResponseError } from '@clerk/shared/error';
import type { FieldId, UpdateMeEnterpriseConnectionParams } from '@clerk/shared/types';
import React from 'react';

import { type LocalizationKey } from '@/customizables';
import type { useCardState } from '@/elements/contexts';
import type { FormControlState } from '@/ui/utils/useFormControl';
import { useFormControl } from '@/ui/utils/useFormControl';
import { handleError } from '@/utils/errorHandler';

import { useConfigureSSO } from '../../../../ConfigureSSOContext';

export type IdpMetadataMode = 'metadataUrl' | 'manual';

type FieldLocalization = {
  label: LocalizationKey;
  placeholder: LocalizationKey;
};

type UseIdentityProviderMetadataFormParams = {
  metadataUrl: FieldLocalization;
  manual: {
    signOnUrl: FieldLocalization;
    issuer: FieldLocalization;
    /** Label for the signing-certificate uploader field. */
    signingCertificateLabel: LocalizationKey;
  };
};

type CardState = ReturnType<typeof useCardState>;

type SamlPayload = NonNullable<UpdateMeEnterpriseConnectionParams['saml']>;

export type IdentityProviderMetadataFormController = {
  mode: IdpMetadataMode;
  setMode: React.Dispatch<React.SetStateAction<IdpMetadataMode>>;
  certFile: File | null;
  setCertFile: React.Dispatch<React.SetStateAction<File | null>>;
  existingCertPresent: boolean;
  metadataUrlField: FormControlState<FieldId>;
  signOnUrlField: FormControlState<FieldId>;
  issuerField: FormControlState<FieldId>;
  certFileField: FormControlState<FieldId>;
  isValid: boolean;
  buildSamlPayload: () => Promise<SamlPayload>;
  applySubmitError: (err: unknown, card: CardState) => void;
};

export const useIdentityProviderMetadataForm = ({
  metadataUrl,
  manual,
}: UseIdentityProviderMetadataFormParams): IdentityProviderMetadataFormController => {
  const { enterpriseConnection } = useConfigureSSO();

  const samlConnection = enterpriseConnection?.samlConnection;
  const hasExistingConfig = Boolean(
    samlConnection?.idpSsoUrl ||
    samlConnection?.idpEntityId ||
    samlConnection?.idpCertificate ||
    samlConnection?.idpMetadataUrl,
  );
  const existingCertPresent = Boolean(samlConnection?.idpCertificate);

  const [mode, setMode] = React.useState<IdpMetadataMode>(hasExistingConfig ? 'manual' : 'metadataUrl');
  const [certFile, setCertFile] = React.useState<File | null>(null);

  const metadataUrlField = useFormControl('idpMetadataUrl', samlConnection?.idpMetadataUrl ?? '', {
    type: 'text',
    label: metadataUrl.label,
    placeholder: metadataUrl.placeholder,
    isRequired: true,
  });

  const signOnUrlField = useFormControl('idpSsoUrl', samlConnection?.idpSsoUrl ?? '', {
    type: 'text',
    label: manual.signOnUrl.label,
    placeholder: manual.signOnUrl.placeholder,
    isRequired: true,
  });

  const issuerField = useFormControl('idpEntityId', samlConnection?.idpEntityId ?? '', {
    type: 'text',
    label: manual.issuer.label,
    placeholder: manual.issuer.placeholder,
    isRequired: true,
  });

  const certFileField = useFormControl('idpCertificate', '', {
    type: 'text',
    label: manual.signingCertificateLabel,
    isRequired: true,
  });

  const trimmedMetadataUrl = metadataUrlField.value.trim();
  const trimmedSignOnUrl = signOnUrlField.value.trim();
  const trimmedIssuer = issuerField.value.trim();
  const hasCert = certFile !== null || existingCertPresent;

  const isValid =
    (mode === 'metadataUrl' && trimmedMetadataUrl.length > 0) ||
    (mode === 'manual' && trimmedSignOnUrl.length > 0 && trimmedIssuer.length > 0 && hasCert);

  const buildSamlPayload = async (): Promise<SamlPayload> => {
    if (mode === 'metadataUrl') {
      return { idpMetadataUrl: trimmedMetadataUrl };
    }

    const payload: SamlPayload = {
      idpSsoUrl: trimmedSignOnUrl,
      idpEntityId: trimmedIssuer,
    };

    if (certFile !== null) {
      payload.idpCertificate = await certFile.text();
    }

    return payload;
  };

  const applySubmitError = (err: unknown, card: CardState): void => {
    const activeFields = mode === 'metadataUrl' ? [metadataUrlField] : [signOnUrlField, issuerField, certFileField];

    handleError(err as Error, activeFields, card.setError);

    if (isClerkAPIResponseError(err)) {
      const unscopedSamlError = err.errors.find(e => e.code?.startsWith('saml_') && !e.meta?.paramName);
      if (unscopedSamlError) {
        const primaryField = mode === 'metadataUrl' ? metadataUrlField : signOnUrlField;
        primaryField.setError(unscopedSamlError);
        card.setError(undefined);
      }
    }
  };

  return {
    mode,
    setMode,
    certFile,
    setCertFile,
    existingCertPresent,
    metadataUrlField,
    signOnUrlField,
    issuerField,
    certFileField,
    isValid,
    buildSamlPayload,
    applySubmitError,
  };
};

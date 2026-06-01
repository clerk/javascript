import { isClerkAPIResponseError } from '@clerk/shared/error';
import type { FieldId, UpdateMeEnterpriseConnectionParams } from '@clerk/shared/types';
import React, { type JSX } from 'react';

import {
  Badge,
  Box,
  Button,
  Col,
  descriptors,
  Flex,
  Icon,
  type LocalizationKey,
  Text,
  useLocalizations,
} from '@/customizables';
import type { useCardState } from '@/elements/contexts';
import { Field } from '@/elements/FieldControl';
import { Form } from '@/elements/Form';
import { ArrowUpTray, Close } from '@/icons';
import type { FormControlState } from '@/ui/utils/useFormControl';
import { handleError } from '@/utils/errorHandler';

import type { IdpConfigurationMode } from './IdentityProviderConfigurationModes';

type CardState = ReturnType<typeof useCardState>;
type FormControl = FormControlState<FieldId>;

type FileUploadLabels = {
  uploadFile: LocalizationKey;
  replaceFile: LocalizationKey;
  removeFile: LocalizationKey;
  fileUploaded: LocalizationKey;
};

type MetadataUrlForm = {
  field: FormControl;
};

type MetadataUrlLabels = {
  description: LocalizationKey;
};

type MetadataFileForm = {
  field: FormControl;
  file: File | null;
  onFileChange: (file: File | null) => void;
  existingFilePresent?: boolean;
};

type MetadataFileLabels = {
  description: LocalizationKey;
} & FileUploadLabels;

type ManualConfigurationForm = {
  signOnUrlField: FormControl;
  issuerField: FormControl;
  certificateField: FormControl;
  certFile: File | null;
  onCertFileChange: (file: File | null) => void;
  existingCertPresent?: boolean;
};

type ManualConfigurationLabels = {
  description: LocalizationKey;
} & FileUploadLabels;

export type IdentityProviderConfigurationFormProps =
  | { mode: 'metadataUrl'; form: MetadataUrlForm; labels: MetadataUrlLabels }
  | { mode: 'metadataFile'; form: MetadataFileForm; labels: MetadataFileLabels }
  | { mode: 'manual'; form: ManualConfigurationForm; labels: ManualConfigurationLabels };

export const IdentityProviderConfigurationForm = (config: IdentityProviderConfigurationFormProps): JSX.Element => {
  switch (config.mode) {
    case 'metadataUrl':
      return (
        <MetadataUrlPanel
          form={config.form}
          labels={config.labels}
        />
      );
    case 'metadataFile':
      return (
        <MetadataFilePanel
          form={config.form}
          labels={config.labels}
        />
      );
    case 'manual':
      return (
        <ManualPanel
          form={config.form}
          labels={config.labels}
        />
      );
  }
};

type MetadataUrlPanelProps = {
  form: MetadataUrlForm;
  labels: MetadataUrlLabels;
};

const MetadataUrlPanel = ({ form, labels }: MetadataUrlPanelProps): JSX.Element => (
  <>
    <Text
      as='p'
      colorScheme='secondary'
      localizationKey={labels.description}
    />
    <Form.ControlRow elementId={form.field.id}>
      <Form.PlainInput {...form.field.props} />
    </Form.ControlRow>
  </>
);

type MetadataFilePanelProps = {
  form: MetadataFileForm;
  labels: MetadataFileLabels;
};

const MetadataFilePanel = ({ form, labels }: MetadataFilePanelProps): JSX.Element => (
  <>
    <Text
      as='p'
      colorScheme='secondary'
      localizationKey={labels.description}
    />
    <FileUploadField
      field={form.field}
      file={form.file}
      onFileChange={form.onFileChange}
      existingFilePresent={Boolean(form.existingFilePresent)}
      labels={labels}
      accept='.xml'
    />
  </>
);

type ManualPanelProps = {
  form: ManualConfigurationForm;
  labels: ManualConfigurationLabels;
};

const ManualPanel = ({ form, labels }: ManualPanelProps): JSX.Element => (
  <>
    <Text
      as='p'
      colorScheme='secondary'
      localizationKey={labels.description}
    />

    <Form.ControlRow elementId={form.signOnUrlField.id}>
      <Form.PlainInput {...form.signOnUrlField.props} />
    </Form.ControlRow>

    <Form.ControlRow elementId={form.issuerField.id}>
      <Form.PlainInput {...form.issuerField.props} />
    </Form.ControlRow>

    <FileUploadField
      field={form.certificateField}
      file={form.certFile}
      onFileChange={form.onCertFileChange}
      existingFilePresent={Boolean(form.existingCertPresent)}
      labels={labels}
      accept='.pem,.key,.crt,.cer,.cert'
    />
  </>
);

type BuildSamlPayloadParams = {
  mode: IdpConfigurationMode;
  metadataUrl?: { value: string };
  metadataFile?: { file: File | null };
  manual?: {
    signOnUrl: string;
    issuer: string;
    certFile: File | null;
  };
};

type SamlConfigurationPayload = NonNullable<UpdateMeEnterpriseConnectionParams['saml']>;

export const buildSamlConfigurationPayload = async ({
  mode,
  metadataUrl,
  metadataFile,
  manual,
}: BuildSamlPayloadParams): Promise<SamlConfigurationPayload> => {
  if (mode === 'metadataUrl') {
    if (!metadataUrl) {
      throw new Error('metadataUrl values missing for mode "metadataUrl"');
    }

    return { idpMetadataUrl: metadataUrl.value.trim() };
  }

  if (mode === 'metadataFile') {
    if (!metadataFile?.file) {
      throw new Error('metadataFile is missing for mode "metadataFile"');
    }

    return { idpMetadata: await metadataFile.file.text() };
  }

  if (!manual) {
    throw new Error('manual values missing for mode "manual"');
  }

  const payload: SamlConfigurationPayload = {
    idpSsoUrl: manual.signOnUrl.trim(),
    idpEntityId: manual.issuer.trim(),
  };

  if (manual.certFile !== null) {
    payload.idpCertificate = await manual.certFile.text();
  }

  return payload;
};

export const applySamlSubmitError = (
  err: unknown,
  card: CardState,
  primaryField: FormControl,
  additionalFields: FormControl[] = [],
): void => {
  handleError(err as Error, [primaryField, ...additionalFields], card.setError);

  if (isClerkAPIResponseError(err)) {
    const unscopedSamlError = err.errors.find(e => e.code?.startsWith('saml_') && !e.meta?.paramName);

    if (unscopedSamlError) {
      primaryField.setError(unscopedSamlError);
      card.setError(undefined);
    }
  }
};

type FileUploadFieldProps = {
  field: FormControl;
  file: File | null;
  onFileChange: (file: File | null) => void;
  existingFilePresent: boolean;
  accept?: string;
  labels: FileUploadLabels;
};

const FileUploadField = ({
  field,
  file,
  onFileChange,
  existingFilePresent,
  labels,
  accept,
}: FileUploadFieldProps): JSX.Element => {
  const { t } = useLocalizations();
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <Box>
      <Field.Root {...field.props}>
        <Col gap={2}>
          <Field.LabelRow>
            <Field.Label />
          </Field.LabelRow>

          <input
            ref={inputRef}
            type='file'
            accept={accept}
            multiple={false}
            style={{ display: 'none' }}
            onChange={e => {
              onFileChange(e.target.files?.[0] ?? null);
              field.clearFeedback();
            }}
          />

          {file === null ? (
            <Flex
              align='center'
              gap={2}
              sx={{ alignSelf: 'flex-start', flexWrap: 'wrap' }}
            >
              {existingFilePresent && (
                <Badge
                  elementDescriptor={descriptors.configureSSOCertificateFileBadge}
                  localizationKey={labels.fileUploaded}
                />
              )}
              <Button
                elementDescriptor={descriptors.configureSSOCertificateUploadButton}
                size='xs'
                variant='outline'
                onClick={() => inputRef.current?.click()}
              >
                <Icon
                  icon={ArrowUpTray}
                  size='sm'
                  colorScheme='neutral'
                  sx={theme => ({ marginInlineEnd: theme.space.$1 })}
                />
                <Text
                  as='span'
                  localizationKey={existingFilePresent ? labels.replaceFile : labels.uploadFile}
                />
              </Button>
            </Flex>
          ) : (
            <Flex
              align='center'
              gap={2}
              sx={theme => ({ paddingTop: theme.space.$1, paddingBottom: theme.space.$1 })}
            >
              <Text
                elementDescriptor={descriptors.configureSSOCertificateFileName}
                as='span'
                colorScheme='secondary'
                variant='buttonSmall'
              >
                {file.name}
              </Text>

              <Button
                elementDescriptor={descriptors.configureSSOCertificateRemoveButton}
                variant='ghost'
                colorScheme='neutral'
                aria-label={t(labels.removeFile)}
                onClick={() => {
                  onFileChange(null);
                  field.clearFeedback();
                  if (inputRef.current) {
                    inputRef.current.value = '';
                  }
                }}
                sx={theme => ({ padding: theme.space.$1 })}
              >
                <Icon
                  icon={Close}
                  size='xs'
                />
              </Button>
            </Flex>
          )}
        </Col>
        <Field.Feedback />
      </Field.Root>
    </Box>
  );
};

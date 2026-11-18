import { isClerkAPIResponseError } from '@clerk/shared/error';
import type { FieldId, UpdateOrganizationEnterpriseConnectionParams } from '@clerk/shared/types';
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
  localizationKeys,
  Span,
  Text,
  useLocalizations,
} from '@/customizables';
import type { useCardState } from '@/elements/contexts';
import { Field } from '@/elements/FieldControl';
import { Form } from '@/elements/Form';
import { Tooltip } from '@/elements/Tooltip';
import { ArrowUpTray, Close, ExclamationTriangle } from '@/icons';
import { formatDate } from '@/ui/utils/formatDate';
import type { FormControlState } from '@/ui/utils/useFormControl';
import { handleError } from '@/utils/errorHandler';

import {
  addCertificates,
  areCertificateBodies,
  getIdpCertificateStatus,
  haveCertificatesChanged,
  type IdpCertificateEntry,
  MAX_IDP_CERTIFICATES,
  parseCertificateFile,
  removeCertificate,
  toIdpCertificatesParam,
} from '../../../../domain/idpCertificates';
import type { SamlIdpConfigurationMode } from '../../shared/IdentityProviderConfigurationModes';

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
  certificates: IdpCertificateEntry[];
  onCertificatesChange: React.Dispatch<React.SetStateAction<IdpCertificateEntry[]>>;
  initialCertificates: IdpCertificateEntry[];
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

    <CertificateListField
      field={form.certificateField}
      certificates={form.certificates}
      onCertificatesChange={form.onCertificatesChange}
      labels={labels}
    />
  </>
);

type BuildSamlPayloadParams = {
  mode: SamlIdpConfigurationMode;
  metadataUrl?: { value: string };
  metadataFile?: { file: File | null };
  manual?: {
    signOnUrl: string;
    issuer: string;
    certificates: IdpCertificateEntry[];
    initialCertificates: IdpCertificateEntry[];
  };
};

type SamlConfigurationPayload = NonNullable<UpdateOrganizationEnterpriseConnectionParams['saml']>;

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

  if (haveCertificatesChanged(manual.certificates, manual.initialCertificates)) {
    payload.idpCertificates = toIdpCertificatesParam(manual.certificates);
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

type CertificateListFieldProps = {
  field: FormControl;
  certificates: IdpCertificateEntry[];
  onCertificatesChange: React.Dispatch<React.SetStateAction<IdpCertificateEntry[]>>;
  labels: FileUploadLabels;
};

const CERTIFICATE_FILE_TYPES = '.pem,.key,.crt,.cer,.cert';

const CertificateListField = ({
  field,
  certificates,
  onCertificatesChange,
  labels,
}: CertificateListFieldProps): JSX.Element => {
  const { t } = useLocalizations();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const canRemove = certificates.length > 1;
  const canAdd = certificates.length < MAX_IDP_CERTIFICATES;

  const onFileSelected = async (file: File | null): Promise<void> => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    if (!file) {
      return;
    }

    let text: string;
    try {
      text = await file.text();
    } catch {
      field.setError(t(localizationKeys('configureSSO.signingCertificates.fileUnreadable')));
      return;
    }

    const bodies = parseCertificateFile(text);
    if (!areCertificateBodies(bodies)) {
      field.setError(t(localizationKeys('configureSSO.signingCertificates.notACertificate')));
      return;
    }

    field.clearFeedback();
    onCertificatesChange(current => addCertificates(current, bodies));
  };

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
            accept={CERTIFICATE_FILE_TYPES}
            multiple={false}
            style={{ display: 'none' }}
            onChange={e => void onFileSelected(e.target.files?.[0] ?? null)}
          />

          {certificates.length > 0 && (
            <Col
              elementDescriptor={descriptors.configureSSOCertificateList}
              gap={2}
            >
              {certificates.map((entry, index) => (
                <Flex
                  key={entry.certificate}
                  elementDescriptor={descriptors.configureSSOCertificateListItem}
                  align='center'
                  gap={2}
                  sx={theme => ({
                    padding: theme.space.$2,
                    borderRadius: theme.radii.$md,
                    borderWidth: theme.borderWidths.$normal,
                    borderStyle: theme.borderStyles.$solid,
                    borderColor: theme.colors.$borderAlpha100,
                  })}
                >
                  <Col
                    gap={1}
                    sx={{ minWidth: 0, flex: 1 }}
                  >
                    <Flex
                      align='center'
                      gap={2}
                      sx={{ minWidth: 0 }}
                    >
                      <Text
                        elementDescriptor={descriptors.configureSSOCertificateListItemBody}
                        as='span'
                        colorScheme='secondary'
                        variant='buttonSmall'
                        sx={{
                          fontFamily: 'monospace',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {entry.certificate}
                      </Text>
                      {index === 0 && (
                        <Tooltip.Root>
                          <Tooltip.Trigger>
                            <Span
                              tabIndex={0}
                              sx={theme => ({ display: 'inline-flex', borderRadius: theme.radii.$sm })}
                            >
                              <Badge
                                elementDescriptor={descriptors.configureSSOCertificatePrimaryBadge}
                                localizationKey={localizationKeys('configureSSO.signingCertificates.primary')}
                              />
                            </Span>
                          </Tooltip.Trigger>
                          <Tooltip.Content text={localizationKeys('configureSSO.signingCertificates.primaryTooltip')} />
                        </Tooltip.Root>
                      )}
                    </Flex>
                    <CertificateExpiry entry={entry} />
                  </Col>

                  <Button
                    elementDescriptor={descriptors.configureSSOCertificateListItemRemoveButton}
                    variant='ghost'
                    colorScheme='neutral'
                    aria-label={t(localizationKeys('configureSSO.signingCertificates.removeCertificate'))}
                    isDisabled={!canRemove}
                    onClick={() => {
                      field.clearFeedback();
                      onCertificatesChange(current => removeCertificate(current, entry.certificate));
                    }}
                    sx={theme => ({ padding: theme.space.$1 })}
                  >
                    <Icon
                      icon={Close}
                      size='xs'
                    />
                  </Button>
                </Flex>
              ))}
            </Col>
          )}

          <Button
            elementDescriptor={descriptors.configureSSOCertificateUploadButton}
            size='xs'
            variant='outline'
            onClick={() => inputRef.current?.click()}
            isDisabled={!canAdd}
            sx={{ alignSelf: 'flex-start' }}
          >
            <Icon
              icon={ArrowUpTray}
              size='sm'
              colorScheme='neutral'
              sx={theme => ({ marginInlineEnd: theme.space.$1 })}
            />
            <Text
              as='span'
              localizationKey={
                certificates.length > 0
                  ? localizationKeys('configureSSO.signingCertificates.addCertificate')
                  : labels.uploadFile
              }
            />
          </Button>
        </Col>
        <Field.Feedback />
      </Field.Root>
    </Box>
  );
};

const CertificateExpiry = ({ entry }: { entry: IdpCertificateEntry }): JSX.Element => {
  const status = getIdpCertificateStatus(entry);
  const showsAlert = status === 'expired' || status === 'expiring';
  const colorScheme = status === 'expired' ? 'danger' : status === 'expiring' ? 'warning' : 'secondary';

  return (
    <Flex
      elementDescriptor={descriptors.configureSSOCertificateListItemExpiry}
      align='center'
      gap={1}
    >
      {showsAlert && (
        <Icon
          icon={ExclamationTriangle}
          size='sm'
          colorScheme={status === 'expired' ? 'danger' : 'warning'}
        />
      )}
      <Text
        as='span'
        colorScheme={colorScheme}
        variant='caption'
        localizationKey={
          entry.expiresAt === null
            ? localizationKeys('configureSSO.signingCertificates.expiryAfterSave')
            : localizationKeys(
                status === 'expired'
                  ? 'configureSSO.signingCertificates.expired'
                  : 'configureSSO.signingCertificates.expires',
                { date: formatDate(new Date(entry.expiresAt)) },
              )
        }
      />
    </Flex>
  );
};

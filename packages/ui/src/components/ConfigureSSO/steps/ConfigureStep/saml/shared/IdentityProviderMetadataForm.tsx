import type { FieldId } from '@clerk/shared/types';
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
import { useCardState } from '@/elements/contexts';
import { Field } from '@/elements/FieldControl';
import { Form } from '@/elements/Form';
import { SegmentedControl } from '@/elements/SegmentedControl';
import { ArrowUpTray, Close } from '@/icons';
import type { FormControlState } from '@/ui/utils/useFormControl';

import type { IdentityProviderMetadataFormController, IdpMetadataMode } from './useIdentityProviderMetadataForm';

type SigningCertificateLocalization = {
  label: LocalizationKey;
  uploadFile: LocalizationKey;
  replaceFile: LocalizationKey;
  removeFile: LocalizationKey;
  fileUploaded: LocalizationKey;
};

type IdentityProviderMetadataFormProps = {
  controller: IdentityProviderMetadataFormController;
  modes: {
    ariaLabel: LocalizationKey;
    metadataUrlLabel: LocalizationKey;
    manualLabel: LocalizationKey;
  };
  /**
   * Copy for the metadata URL panel
   */
  metadataUrl: {
    description: LocalizationKey;
  };
  /**
   * Copy for the manual metadata panel
   */
  manual: {
    description: LocalizationKey;
    signingCertificate: SigningCertificateLocalization;
  };
};

export const IdentityProviderMetadataForm = ({
  controller,
  modes,
  metadataUrl,
  manual,
}: IdentityProviderMetadataFormProps): JSX.Element => {
  const card = useCardState();
  const { t } = useLocalizations();

  return (
    <>
      <SegmentedControl.Root
        aria-label={t(modes.ariaLabel)}
        value={controller.mode}
        onChange={value => {
          card.setError(undefined);
          controller.setMode(value as IdpMetadataMode);
        }}
        fullWidth
      >
        <SegmentedControl.Button
          value='metadataUrl'
          text={modes.metadataUrlLabel}
        />
        <SegmentedControl.Button
          value='manual'
          text={modes.manualLabel}
        />
      </SegmentedControl.Root>

      {controller.mode === 'metadataUrl' ? (
        <MetadataUrlPanel
          field={controller.metadataUrlField}
          description={metadataUrl.description}
        />
      ) : (
        <ManualEntryPanel
          description={manual.description}
          signingCertificate={manual.signingCertificate}
          signOnUrlField={controller.signOnUrlField}
          issuerField={controller.issuerField}
          certFileField={controller.certFileField}
          certFile={controller.certFile}
          setCertFile={controller.setCertFile}
          existingCertPresent={controller.existingCertPresent}
        />
      )}
    </>
  );
};

type FormControl = FormControlState<FieldId>;

type MetadataUrlPanelProps = {
  field: FormControl;
  description: LocalizationKey;
};

const MetadataUrlPanel = ({ field, description }: MetadataUrlPanelProps): JSX.Element => (
  <>
    <Text
      as='p'
      colorScheme='secondary'
      localizationKey={description}
    />
    <Form.ControlRow elementId={field.id}>
      <Form.PlainInput {...field.props} />
    </Form.ControlRow>
  </>
);

type ManualEntryPanelProps = {
  description: LocalizationKey;
  signingCertificate: SigningCertificateLocalization;
  signOnUrlField: FormControl;
  issuerField: FormControl;
  certFileField: FormControl;
  certFile: File | null;
  setCertFile: React.Dispatch<React.SetStateAction<File | null>>;
  existingCertPresent: boolean;
};

const ManualEntryPanel = ({
  description,
  signingCertificate,
  signOnUrlField,
  issuerField,
  certFileField,
  certFile,
  setCertFile,
  existingCertPresent,
}: ManualEntryPanelProps): JSX.Element => {
  const { t } = useLocalizations();
  const certInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <>
      <Text
        as='p'
        colorScheme='secondary'
        localizationKey={description}
      />

      <Form.ControlRow elementId={signOnUrlField.id}>
        <Form.PlainInput {...signOnUrlField.props} />
      </Form.ControlRow>

      <Form.ControlRow elementId={issuerField.id}>
        <Form.PlainInput {...issuerField.props} />
      </Form.ControlRow>

      <Box>
        <Field.Root {...certFileField.props}>
          <Col gap={2}>
            <Field.LabelRow>
              <Field.Label />
            </Field.LabelRow>

            <input
              ref={certInputRef}
              type='file'
              accept='.pem,.key,.crt,.cer,.cert'
              multiple={false}
              style={{ display: 'none' }}
              onChange={e => {
                setCertFile(e.target.files?.[0] ?? null);
                certFileField.clearFeedback();
              }}
            />

            {certFile === null ? (
              <Flex
                align='center'
                gap={2}
                sx={{ alignSelf: 'flex-start', flexWrap: 'wrap' }}
              >
                {existingCertPresent && (
                  <Badge
                    elementDescriptor={descriptors.configureSSOCertificateFileBadge}
                    localizationKey={signingCertificate.fileUploaded}
                  />
                )}
                <Button
                  elementDescriptor={descriptors.configureSSOCertificateUploadButton}
                  size='xs'
                  variant='outline'
                  onClick={() => certInputRef.current?.click()}
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
                      existingCertPresent ? signingCertificate.replaceFile : signingCertificate.uploadFile
                    }
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
                  {certFile.name}
                </Text>

                <Button
                  elementDescriptor={descriptors.configureSSOCertificateRemoveButton}
                  variant='ghost'
                  colorScheme='neutral'
                  aria-label={t(signingCertificate.removeFile)}
                  onClick={() => {
                    setCertFile(null);
                    certFileField.clearFeedback();
                    if (certInputRef.current) {
                      certInputRef.current.value = '';
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
    </>
  );
};

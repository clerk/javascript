import { isClerkAPIResponseError } from '@clerk/shared/error';
import { useReverification } from '@clerk/shared/react';
import type { FieldId, UpdateMeEnterpriseConnectionParams } from '@clerk/shared/types';
import React, { type JSX } from 'react';

import {
  Badge,
  Box,
  Button,
  Col,
  descriptors,
  Flex,
  Heading,
  Icon,
  type LocalizationKey,
  Text,
  useLocalizations,
} from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { Field } from '@/elements/FieldControl';
import { Form } from '@/elements/Form';
import { SegmentedControl } from '@/elements/SegmentedControl';
import { Close, Upload } from '@/icons';
import type { FormControlState } from '@/ui/utils/useFormControl';
import { useFormControl } from '@/ui/utils/useFormControl';
import { handleError } from '@/utils/errorHandler';

import { useConfigureSSO } from '../../../../ConfigureSSOContext';
import { Step } from '../../../../elements/Step';
import { useWizard } from '../../../../elements/Wizard';

type FieldLocalization = {
  label: LocalizationKey;
  placeholder: LocalizationKey;
};

type SigningCertificateLocalization = {
  label: LocalizationKey;
  uploadFile: LocalizationKey;
  replaceFile: LocalizationKey;
  removeFile: LocalizationKey;
  fileUploaded: LocalizationKey;
};

type IdentityProviderMetadataFormProps = {
  /**
   * Segmented control copy: section title, the toggle's `aria-label`, and
   * the two segment labels (`metadataUrl` / `manual`).
   */
  modes: {
    title: LocalizationKey;
    ariaLabel: LocalizationKey;
    metadataUrlLabel: LocalizationKey;
    manualLabel: LocalizationKey;
  };
  /**
   * Copy for the `metadataUrl` panel: the single-URL input and its
   * accompanying description paragraph.
   */
  metadataUrl: FieldLocalization & {
    description: LocalizationKey;
  };
  /**
   * Copy for the `manual` panel: description paragraph, the two text
   * inputs (signOn URL + issuer), and the signing-certificate uploader's
   * label + state-dependent button copy.
   */
  manual: {
    description: LocalizationKey;
    signOnUrl: FieldLocalization;
    issuer: FieldLocalization;
    signingCertificate: SigningCertificateLocalization;
  };
};

/**
 * Submit form for the IdP-metadata wizard step.
 *
 * Behavior is fully shared across SAML providers:
 *   - Segmented control toggles between `metadataUrl` (single URL) and
 *     `manual` (sign-on URL + issuer + signing cert) modes.
 *   - Mode defaults to `manual` if the connection already has any IdP
 *     config persisted, otherwise `metadataUrl`.
 *   - On submit, the connection is updated via `useReverification` and
 *     the wizard advances; field/card errors are surfaced from the API.
 *
 * All copy is provided by the caller as resolved `LocalizationKey`s so
 * this primitive stays decoupled from any specific localization
 * namespace.
 */
export const IdentityProviderMetadataForm = ({
  modes,
  metadataUrl,
  manual,
}: IdentityProviderMetadataFormProps): JSX.Element => {
  const card = useCardState();
  const { t } = useLocalizations();
  const { goNext, goPrev, isFirstStep } = useWizard();
  const { enterpriseConnection, updateEnterpriseConnection } = useConfigureSSO();

  const samlConnection = enterpriseConnection?.samlConnection;
  const hasExistingConfig = Boolean(
    samlConnection?.idpSsoUrl ||
    samlConnection?.idpEntityId ||
    samlConnection?.idpCertificate ||
    samlConnection?.idpMetadataUrl,
  );
  const existingCertPresent = Boolean(samlConnection?.idpCertificate);

  const [mode, setMode] = React.useState<'metadataUrl' | 'manual'>(hasExistingConfig ? 'manual' : 'metadataUrl');
  const [certFile, setCertFile] = React.useState<File | null>(null);

  const updateConnection = useReverification(
    React.useCallback(
      async (params: UpdateMeEnterpriseConnectionParams) => {
        if (!enterpriseConnection) {
          throw new Error('Enterprise connection required');
        }
        return updateEnterpriseConnection(enterpriseConnection.id, params);
      },
      [enterpriseConnection, updateEnterpriseConnection],
    ),
  );

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
    label: manual.signingCertificate.label,
    isRequired: true,
  });

  const trimmedMetadataUrl = metadataUrlField.value.trim();
  const trimmedSignOnUrl = signOnUrlField.value.trim();
  const trimmedIssuer = issuerField.value.trim();

  const hasCert = certFile !== null || existingCertPresent;
  const canSubmit =
    !card.isLoading &&
    ((mode === 'metadataUrl' && trimmedMetadataUrl.length > 0) ||
      (mode === 'manual' && trimmedSignOnUrl.length > 0 && trimmedIssuer.length > 0 && hasCert));

  const handleContinue = async () => {
    if (!enterpriseConnection || !canSubmit) {
      return;
    }

    card.setError(undefined);
    card.setLoading();

    try {
      if (mode === 'metadataUrl') {
        await updateConnection({ saml: { idpMetadataUrl: trimmedMetadataUrl } });
      } else {
        const samlPayload: NonNullable<UpdateMeEnterpriseConnectionParams['saml']> = {
          idpSsoUrl: trimmedSignOnUrl,
          idpEntityId: trimmedIssuer,
        };

        if (certFile !== null) {
          samlPayload.idpCertificate = await certFile.text();
        }

        await updateConnection({ saml: samlPayload });
      }

      void goNext();
    } catch (err) {
      const fields = mode === 'metadataUrl' ? [metadataUrlField] : [signOnUrlField, issuerField, certFileField];
      handleError(err as Error, fields, card.setError);

      if (isClerkAPIResponseError(err)) {
        // Some SAML failures come back without a `paramName`, so they wouldn't
        // attach to any field via `handleError`. Pin them to the visible
        // primary input for the active mode and clear the card-level dupe.
        const unscopedSamlError = err.errors.find(e => e.code?.startsWith('saml_') && !e.meta?.paramName);
        if (unscopedSamlError) {
          const primaryField = mode === 'metadataUrl' ? metadataUrlField : signOnUrlField;
          primaryField.setError(unscopedSamlError);
          card.setError(undefined);
        }
      }
    } finally {
      card.setIdle();
    }
  };

  return (
    <>
      <Step.Body>
        <Step.Section
          fill
          gap={5}
        >
          <Heading
            elementDescriptor={descriptors.configureSSOInstructionsHeading}
            as='h3'
            textVariant='subtitle'
            localizationKey={modes.title}
          />
          <SegmentedControl.Root
            aria-label={t(modes.ariaLabel)}
            value={mode}
            onChange={value => {
              card.setError(undefined);
              setMode(value as 'metadataUrl' | 'manual');
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

          {mode === 'metadataUrl' ? (
            <MetadataUrlPanel
              field={metadataUrlField}
              description={metadataUrl.description}
            />
          ) : (
            <ManualEntryPanel
              description={manual.description}
              signingCertificate={manual.signingCertificate}
              signOnUrlField={signOnUrlField}
              issuerField={issuerField}
              certFileField={certFileField}
              certFile={certFile}
              setCertFile={setCertFile}
              existingCertPresent={existingCertPresent}
            />
          )}
        </Step.Section>
      </Step.Body>

      <Step.Footer>
        <Step.Footer.Previous
          onClick={() => goPrev()}
          isDisabled={isFirstStep || card.isLoading}
        />
        <Step.Footer.Continue
          onClick={handleContinue}
          isLoading={card.isLoading}
          isDisabled={!canSubmit}
        />
      </Step.Footer>
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
                    icon={Upload}
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

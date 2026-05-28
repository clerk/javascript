import React, { type JSX } from 'react';

import { Col, descriptors, Heading, Text } from '@/customizables';
import { ClipboardInput } from '@/elements/ClipboardInput';
import { useCardState } from '@/elements/contexts';
import { Form } from '@/elements/Form';
import { Checkmark, Clipboard } from '@/icons';
import { localizationKeys } from '@/localization';
import { useFormControl } from '@/ui/utils/useFormControl';

import { useConfigureSSO } from '../../../ConfigureSSOContext';
import { Step } from '../../../elements/Step';
import { useWizard, Wizard } from '../../../elements/Wizard';
import { InnerStepCounter } from '../../../elements/Wizard/InnerStepCounter';
import {
  applySamlSubmitError,
  buildSamlConfigurationPayload,
  IdentityProviderConfigurationForm,
  type IdentityProviderConfigurationFormProps,
} from './shared/IdentityProviderConfigurationForm';
import {
  IdentityProviderConfigurationModes,
  type IdpConfigurationMode,
} from './shared/IdentityProviderConfigurationModes';

export const SamlGoogleConfigureSteps = (): JSX.Element => {
  return (
    <>
      <Wizard.Step id='create-app'>
        <Step.Header
          title={localizationKeys('configureSSO.configureStep.samlGoogle.mainHeaderTitle')}
          description={localizationKeys('configureSSO.configureStep.samlGoogle.createAppStep.headerSubtitle')}
        >
          <InnerStepCounter />
        </Step.Header>
        <SamlGoogleCreateAppStep />
      </Wizard.Step>

      <Wizard.Step id='identity-provider-metadata'>
        <Step.Header
          title={localizationKeys('configureSSO.configureStep.samlGoogle.mainHeaderTitle')}
          description={localizationKeys(
            'configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.headerSubtitle',
          )}
        >
          <InnerStepCounter />
        </Step.Header>
        <SamlGoogleIdentityProviderMetadataStep />
      </Wizard.Step>

      <Wizard.Step id='service-provider'>
        <Step.Header
          title={localizationKeys('configureSSO.configureStep.samlGoogle.mainHeaderTitle')}
          description={localizationKeys('configureSSO.configureStep.samlGoogle.serviceProviderStep.headerSubtitle')}
        >
          <InnerStepCounter />
        </Step.Header>
        <SamlGoogleServiceProviderStep />
      </Wizard.Step>
    </>
  );
};

const SamlGoogleCreateAppStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <>
      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$5 })}>
          <Col sx={theme => ({ gap: theme.space.$1x5 })}>
            <Heading
              elementDescriptor={descriptors.configureSSOInstructionsHeading}
              as='h3'
              textVariant='subtitle'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlGoogle.createAppStep.createAppInstructions.title',
              )}
            />

            <Col
              elementDescriptor={descriptors.configureSSOInstructionsList}
              as='ul'
              sx={theme => ({
                gap: theme.space.$1x5,
                margin: 0,
                paddingInlineStart: theme.space.$5,
                listStyleType: 'disc',
              })}
            >
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlGoogle.createAppStep.createAppInstructions.step1',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlGoogle.createAppStep.createAppInstructions.step2',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlGoogle.createAppStep.createAppInstructions.step3',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlGoogle.createAppStep.createAppInstructions.step4',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlGoogle.createAppStep.createAppInstructions.step5',
                )}
              />
            </Col>
          </Col>
        </Step.Section>
      </Step.Body>

      <Step.Footer>
        <Step.Footer.Previous
          onClick={() => goPrev()}
          isDisabled={isFirstStep}
        />
        <Step.Footer.Continue
          onClick={() => goNext()}
          isDisabled={isLastStep}
        />
      </Step.Footer>
    </>
  );
};

const GOOGLE_IDP_MODES = ['metadataFile', 'manual'] as const satisfies readonly IdpConfigurationMode[];

const SamlGoogleIdentityProviderMetadataStep = (): JSX.Element => {
  const card = useCardState();
  const { goNext, goPrev, isFirstStep } = useWizard();
  const { enterpriseConnection, updateEnterpriseConnection } = useConfigureSSO();

  const samlConnection = enterpriseConnection?.samlConnection;
  const hasExistingManualConfig = Boolean(
    samlConnection?.idpSsoUrl || samlConnection?.idpEntityId || samlConnection?.idpCertificate,
  );
  const existingCertPresent = Boolean(samlConnection?.idpCertificate);
  const existingMetadataPresent = Boolean(samlConnection?.idpMetadata);

  const [mode, setMode] = React.useState<IdpConfigurationMode>(hasExistingManualConfig ? 'manual' : 'metadataFile');
  const [metadataFile, setMetadataFile] = React.useState<File | null>(null);
  const [certFile, setCertFile] = React.useState<File | null>(null);

  const metadataFileField = useFormControl('idpMetadata', '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.metadataFile.label'),
    isRequired: true,
  });

  const signOnUrlField = useFormControl('idpSsoUrl', samlConnection?.idpSsoUrl ?? '', {
    type: 'text',
    label: localizationKeys(
      'configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.manual.signOnUrl.label',
    ),
    placeholder: localizationKeys(
      'configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.manual.signOnUrl.placeholder',
    ),
    isRequired: true,
  });

  const issuerField = useFormControl('idpEntityId', samlConnection?.idpEntityId ?? '', {
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
  const hasCert = certFile !== null || existingCertPresent;
  const hasMetadataFile = metadataFile !== null || existingMetadataPresent;

  const isValid =
    mode === 'metadataFile' ? hasMetadataFile : trimmedSignOnUrl.length > 0 && trimmedIssuer.length > 0 && hasCert;

  const canSubmit = isValid && !card.isLoading;

  const formProps: IdentityProviderConfigurationFormProps =
    mode === 'metadataFile'
      ? {
          mode: 'metadataFile',
          form: {
            field: metadataFileField,
            file: metadataFile,
            onFileChange: setMetadataFile,
            existingFilePresent: existingMetadataPresent,
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
            certFile,
            onCertFileChange: setCertFile,
            existingCertPresent,
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

  const handleContinue = async (): Promise<void> => {
    if (!enterpriseConnection || !canSubmit) {
      return;
    }

    card.setError(undefined);
    card.setLoading();

    try {
      const saml = await buildSamlConfigurationPayload({
        mode,
        metadataFile: { file: metadataFile },
        manual: { signOnUrl: signOnUrlField.value, issuer: issuerField.value, certFile },
      });

      await updateEnterpriseConnection(enterpriseConnection.id, { saml });
      void goNext();
    } catch (err) {
      if (mode === 'metadataFile') {
        applySamlSubmitError(err, card, metadataFileField);
      } else {
        applySamlSubmitError(err, card, signOnUrlField, [issuerField, certificateField]);
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
            localizationKey={localizationKeys(
              'configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.modes.title',
            )}
          />
          <IdentityProviderConfigurationModes
            modes={GOOGLE_IDP_MODES}
            value={mode}
            onChange={next => {
              card.setError(undefined);
              setMode(next);
            }}
            labels={{
              ariaLabel: localizationKeys(
                'configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.modes.ariaLabel',
              ),
              metadataFile: localizationKeys(
                'configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.modes.metadataFile',
              ),
              manual: localizationKeys(
                'configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.modes.manual',
              ),
            }}
          />
          <IdentityProviderConfigurationForm {...formProps} />
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

const SamlGoogleServiceProviderStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  const { enterpriseConnection } = useConfigureSSO();

  const acsUrl = enterpriseConnection?.samlConnection?.acsUrl ?? '';
  const spEntityId = enterpriseConnection?.samlConnection?.spEntityId ?? '';

  const acsUrlField = useFormControl('acsUrl', acsUrl, {
    type: 'text',
    label: localizationKeys(
      'configureSSO.configureStep.samlGoogle.serviceProviderStep.serviceProviderFields.acsUrl.label',
    ),
    isRequired: false,
  });
  const spEntityIdField = useFormControl('spEntityId', spEntityId, {
    type: 'text',
    label: localizationKeys(
      'configureSSO.configureStep.samlGoogle.serviceProviderStep.serviceProviderFields.spEntityId.label',
    ),
    isRequired: false,
  });

  return (
    <>
      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$5 })}>
          <Col sx={theme => ({ gap: theme.space.$1x5 })}>
            <Heading
              elementDescriptor={descriptors.configureSSOInstructionsHeading}
              as='h3'
              textVariant='subtitle'
              localizationKey={localizationKeys('configureSSO.configureStep.samlGoogle.serviceProviderStep.title')}
            />
            <Text
              as='p'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.configureStep.samlGoogle.serviceProviderStep.paragraph')}
            />
          </Col>

          <Form.ControlRow elementId={acsUrlField.id}>
            <Form.CommonInputWrapper {...acsUrlField.props}>
              <ClipboardInput
                value={acsUrl}
                readOnly
                copyIcon={Clipboard}
                copiedIcon={Checkmark}
              />
            </Form.CommonInputWrapper>
          </Form.ControlRow>

          <Form.ControlRow elementId={spEntityIdField.id}>
            <Form.CommonInputWrapper {...spEntityIdField.props}>
              <ClipboardInput
                value={spEntityId}
                readOnly
                copyIcon={Clipboard}
                copiedIcon={Checkmark}
              />
            </Form.CommonInputWrapper>
          </Form.ControlRow>

          <Col
            elementDescriptor={descriptors.configureSSOInstructionsList}
            as='ul'
            sx={theme => ({
              gap: theme.space.$1x5,
              margin: 0,
              paddingInlineStart: theme.space.$5,
              listStyleType: 'disc',
            })}
          >
            <Text
              elementDescriptor={descriptors.configureSSOInstructionsListItem}
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlGoogle.serviceProviderStep.nameIdInstructions.step1',
              )}
            />
            <Text
              elementDescriptor={descriptors.configureSSOInstructionsListItem}
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlGoogle.serviceProviderStep.nameIdInstructions.step2',
              )}
            />
          </Col>
        </Step.Section>
      </Step.Body>

      <Step.Footer>
        <Step.Footer.Previous
          onClick={() => goPrev()}
          isDisabled={isFirstStep}
        />
        <Step.Footer.Continue
          onClick={() => goNext()}
          isDisabled={isLastStep}
        />
      </Step.Footer>
    </>
  );
};

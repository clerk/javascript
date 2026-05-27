import { type JSX } from 'react';

import { Col, descriptors, Heading, localizationKeys, Text } from '@/customizables';
import { ClipboardInput } from '@/elements/ClipboardInput';
import { Form } from '@/elements/Form';
import { Checkmark, Clipboard } from '@/icons';
import { useFormControl } from '@/ui/utils/useFormControl';

import { useConfigureSSO } from '../../../ConfigureSSOContext';
import { Step } from '../../../elements/Step';
import { useWizard, Wizard } from '../../../elements/Wizard';
import { InnerStepCounter } from '../../../elements/Wizard/InnerStepCounter';
import { AttributeMappingTable, type AttributeMappingTableConfig } from './shared/AttributeMappingTable';
import { IdentityProviderMetadataForm } from './shared/IdentityProviderMetadataForm';

export const SamlCustomConfigureSteps = (): JSX.Element => {
  return (
    <>
      <Wizard.Step id='create-app'>
        <Step.Header
          title={localizationKeys('configureSSO.configureStep.samlCustom.mainHeaderTitle')}
          description={localizationKeys('configureSSO.configureStep.samlCustom.createAppStep.headerSubtitle')}
        >
          <InnerStepCounter />
        </Step.Header>
        <SamlCustomCreateAppStep />
      </Wizard.Step>

      <Wizard.Step id='attribute-mapping'>
        <Step.Header
          title={localizationKeys('configureSSO.configureStep.samlCustom.mainHeaderTitle')}
          description={localizationKeys('configureSSO.configureStep.samlCustom.attributeMappingStep.headerSubtitle')}
        >
          <InnerStepCounter />
        </Step.Header>
        <SamlCustomAttributeMappingStep />
      </Wizard.Step>

      <Wizard.Step id='assign-users'>
        <Step.Header
          title={localizationKeys('configureSSO.configureStep.samlCustom.mainHeaderTitle')}
          description={localizationKeys('configureSSO.configureStep.samlCustom.assignUsersStep.headerSubtitle')}
        >
          <InnerStepCounter />
        </Step.Header>
        <SamlCustomAssignUsersStep />
      </Wizard.Step>

      <Wizard.Step id='identity-provider-metadata'>
        <Step.Header
          title={localizationKeys('configureSSO.configureStep.samlCustom.mainHeaderTitle')}
          description={localizationKeys(
            'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.headerSubtitle',
          )}
        >
          <InnerStepCounter />
        </Step.Header>
        <SamlCustomIdentityProviderMetadataStep />
      </Wizard.Step>
    </>
  );
};

const SamlCustomCreateAppStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  const { enterpriseConnection } = useConfigureSSO();

  const acsUrl = enterpriseConnection?.samlConnection?.acsUrl ?? '';
  const spEntityId = enterpriseConnection?.samlConnection?.spEntityId ?? '';

  const acsUrlField = useFormControl('acsUrl', acsUrl, {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.samlCustom.createAppStep.serviceProviderFields.acsUrl.label'),
    isRequired: false,
  });
  const spEntityIdField = useFormControl('spEntityId', spEntityId, {
    type: 'text',
    label: localizationKeys(
      'configureSSO.configureStep.samlCustom.createAppStep.serviceProviderFields.spEntityId.label',
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
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlCustom.createAppStep.createAppInstructions.title',
              )}
            />
            <Text
              as='p'
              colorScheme='secondary'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlCustom.createAppStep.createAppInstructions.paragraph',
              )}
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

const CUSTOM_ATTRIBUTE_MAPPING: AttributeMappingTableConfig = {
  columns: {
    first: localizationKeys(
      'configureSSO.configureStep.samlCustom.attributeMappingStep.attributeMappingTable.columns.userProfile',
    ),
    second: localizationKeys(
      'configureSSO.configureStep.samlCustom.attributeMappingStep.attributeMappingTable.columns.attributeName',
    ),
  },
  rows: [
    {
      id: 'email',
      isRequired: true,
      first: localizationKeys(
        'configureSSO.configureStep.samlCustom.attributeMappingStep.attributeMappingTable.rows.email.userProfile',
      ),
      second: localizationKeys(
        'configureSSO.configureStep.samlCustom.attributeMappingStep.attributeMappingTable.rows.email.attributeName',
      ),
    },
    {
      id: 'firstName',
      isRequired: false,
      first: localizationKeys(
        'configureSSO.configureStep.samlCustom.attributeMappingStep.attributeMappingTable.rows.firstName.userProfile',
      ),
      second: localizationKeys(
        'configureSSO.configureStep.samlCustom.attributeMappingStep.attributeMappingTable.rows.firstName.attributeName',
      ),
    },
    {
      id: 'lastName',
      isRequired: false,
      first: localizationKeys(
        'configureSSO.configureStep.samlCustom.attributeMappingStep.attributeMappingTable.rows.lastName.userProfile',
      ),
      second: localizationKeys(
        'configureSSO.configureStep.samlCustom.attributeMappingStep.attributeMappingTable.rows.lastName.attributeName',
      ),
    },
  ],
};

const SamlCustomAttributeMappingStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <>
      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$3 })}>
          <Text
            as='p'
            colorScheme='secondary'
            localizationKey={localizationKeys('configureSSO.configureStep.samlCustom.attributeMappingStep.paragraph')}
          />

          <AttributeMappingTable config={CUSTOM_ATTRIBUTE_MAPPING} />
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

const SamlCustomAssignUsersStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <>
      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$3 })}>
          <Heading
            elementDescriptor={descriptors.configureSSOInstructionsHeading}
            as='h3'
            textVariant='subtitle'
            localizationKey={localizationKeys('configureSSO.configureStep.samlCustom.assignUsersStep.title')}
          />
          <Text
            as='p'
            colorScheme='secondary'
            localizationKey={localizationKeys('configureSSO.configureStep.samlCustom.assignUsersStep.paragraph')}
          />
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

const SamlCustomIdentityProviderMetadataStep = (): JSX.Element => (
  <IdentityProviderMetadataForm
    modes={{
      title: localizationKeys('configureSSO.configureStep.samlCustom.identityProviderMetadataStep.modes.title'),
      ariaLabel: localizationKeys('configureSSO.configureStep.samlCustom.identityProviderMetadataStep.modes.ariaLabel'),
      metadataUrlLabel: localizationKeys(
        'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.modes.metadataUrl',
      ),
      manualLabel: localizationKeys('configureSSO.configureStep.samlCustom.identityProviderMetadataStep.modes.manual'),
    }}
    metadataUrl={{
      label: localizationKeys('configureSSO.configureStep.samlCustom.identityProviderMetadataStep.metadataUrl.label'),
      placeholder: localizationKeys(
        'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.metadataUrl.placeholder',
      ),
      description: localizationKeys(
        'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.metadataUrl.description',
      ),
    }}
    manual={{
      description: localizationKeys(
        'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.description',
      ),
      signOnUrl: {
        label: localizationKeys(
          'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.signOnUrl.label',
        ),
        placeholder: localizationKeys(
          'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.signOnUrl.placeholder',
        ),
      },
      issuer: {
        label: localizationKeys(
          'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.issuer.label',
        ),
        placeholder: localizationKeys(
          'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.issuer.placeholder',
        ),
      },
      signingCertificate: {
        label: localizationKeys(
          'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.signingCertificate.label',
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
    }}
  />
);

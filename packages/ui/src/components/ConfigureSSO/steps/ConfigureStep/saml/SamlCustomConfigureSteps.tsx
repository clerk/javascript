import React, { type JSX } from 'react';

import {
  Badge,
  Col,
  descriptors,
  Flex,
  Heading,
  localizationKeys,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@/customizables';
import { ClipboardInput } from '@/elements/ClipboardInput';
import { useCardState } from '@/elements/contexts';
import { Form } from '@/elements/Form';
import { Checkmark, Clipboard } from '@/icons';
import { useFormControl } from '@/ui/utils/useFormControl';

import { useConfigureSSO } from '../../../ConfigureSSOContext';
import { Step } from '../../../elements/Step';
import { useWizard, Wizard, type WizardStepConfig } from '../../../elements/Wizard';
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

const CUSTOM_STEPS: WizardStepConfig[] = [
  { id: 'create-app' },
  { id: 'attribute-mapping' },
  { id: 'assign-users' },
  { id: 'identity-provider-metadata' },
];

export const SamlCustomConfigureSteps = (): JSX.Element => {
  return (
    // Linear, guard-less sub-flow: mount on the first step. (Entry guards drive
    // furthest-reachable init, which would otherwise land the last step here.)
    <Wizard
      steps={CUSTOM_STEPS}
      initialStepId={CUSTOM_STEPS[0].id}
    >
      <Wizard.Match id='create-app'>
        <SamlCustomCreateAppStep />
      </Wizard.Match>

      <Wizard.Match id='attribute-mapping'>
        <SamlCustomAttributeMappingStep />
      </Wizard.Match>

      <Wizard.Match id='assign-users'>
        <SamlCustomAssignUsersStep />
      </Wizard.Match>

      <Wizard.Match id='identity-provider-metadata'>
        <SamlCustomIdentityProviderMetadataStep />
      </Wizard.Match>
    </Wizard>
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
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.samlCustom.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.samlCustom.createAppStep.headerSubtitle')}
      >
        <InnerStepCounter />
      </Step.Header>

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

const SamlCustomAttributeMappingStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.samlCustom.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.samlCustom.attributeMappingStep.headerSubtitle')}
      >
        <InnerStepCounter />
      </Step.Header>

      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$3 })}>
          <Text
            as='p'
            colorScheme='secondary'
            localizationKey={localizationKeys('configureSSO.configureStep.samlCustom.attributeMappingStep.paragraph')}
          />

          <CustomAttributeMappingTable />
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

type CustomAttributeRow = {
  id: 'email' | 'firstName' | 'lastName';
  isRequired: boolean;
};

const CUSTOM_ATTRIBUTE_ROWS: ReadonlyArray<CustomAttributeRow> = [
  { id: 'email', isRequired: true },
  { id: 'firstName', isRequired: false },
  { id: 'lastName', isRequired: false },
];

const CustomAttributeMappingTable = (): JSX.Element => (
  <Table
    elementDescriptor={descriptors.configureSSOAttributeMappingTable}
    sx={theme => ({
      'tr > th:first-of-type': { paddingInlineStart: theme.space.$4 },
    })}
  >
    <Thead>
      <Tr>
        <Th>
          <Text
            sx={theme => ({ fontSize: theme.fontSizes.$xs })}
            localizationKey={localizationKeys(
              'configureSSO.configureStep.samlCustom.attributeMappingStep.attributeMappingTable.columns.userProfile',
            )}
          />
        </Th>
        <Th>
          <Text
            sx={theme => ({ fontSize: theme.fontSizes.$xs })}
            localizationKey={localizationKeys(
              'configureSSO.configureStep.samlCustom.attributeMappingStep.attributeMappingTable.columns.attributeName',
            )}
          />
        </Th>
      </Tr>
    </Thead>
    <Tbody>
      {CUSTOM_ATTRIBUTE_ROWS.map(row => (
        <Tr key={row.id}>
          <Td>
            <Flex
              as='span'
              align='center'
              sx={theme => ({ gap: theme.space.$2 })}
            >
              <Text
                as='span'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  `configureSSO.configureStep.samlCustom.attributeMappingStep.attributeMappingTable.rows.${row.id}.userProfile`,
                )}
              />
              <Badge
                elementDescriptor={descriptors.configureSSOAttributeMappingBadge}
                elementId={descriptors.configureSSOAttributeMappingBadge.setId(
                  row.isRequired ? 'required' : 'optional',
                )}
                colorScheme={row.isRequired ? 'warning' : 'primary'}
                localizationKey={localizationKeys(
                  row.isRequired
                    ? 'configureSSO.configureStep.attributeMappingTable.badges.required'
                    : 'configureSSO.configureStep.attributeMappingTable.badges.optional',
                )}
              />
            </Flex>
          </Td>
          <Td>
            <Text
              as='span'
              sx={{ fontFamily: 'monospace' }}
              localizationKey={localizationKeys(
                `configureSSO.configureStep.samlCustom.attributeMappingStep.attributeMappingTable.rows.${row.id}.attributeName`,
              )}
            />
          </Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
);

const SamlCustomAssignUsersStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.samlCustom.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.samlCustom.assignUsersStep.headerSubtitle')}
      >
        <InnerStepCounter />
      </Step.Header>

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

const CUSTOM_SAML_IDP_MODES = ['metadataUrl', 'manual'] as const satisfies readonly IdpConfigurationMode[];

const SamlCustomIdentityProviderMetadataStep = (): JSX.Element => {
  const card = useCardState();
  const { goNext, goPrev, isFirstStep } = useWizard();
  const {
    enterpriseConnection,
    mutations: { updateConnection },
  } = useConfigureSSO();

  const samlConnection = enterpriseConnection?.samlConnection;
  const hasExistingConfig = Boolean(
    samlConnection?.idpSsoUrl ||
    samlConnection?.idpEntityId ||
    samlConnection?.idpCertificate ||
    samlConnection?.idpMetadataUrl,
  );
  const existingCertPresent = Boolean(samlConnection?.idpCertificate);

  const [mode, setMode] = React.useState<IdpConfigurationMode>(hasExistingConfig ? 'manual' : 'metadataUrl');
  const [certFile, setCertFile] = React.useState<File | null>(null);

  const metadataUrlField = useFormControl('idpMetadataUrl', samlConnection?.idpMetadataUrl ?? '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.samlCustom.identityProviderMetadataStep.metadataUrl.label'),
    placeholder: localizationKeys(
      'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.metadataUrl.placeholder',
    ),
    isRequired: true,
  });

  const signOnUrlField = useFormControl('idpSsoUrl', samlConnection?.idpSsoUrl ?? '', {
    type: 'text',
    label: localizationKeys(
      'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.signOnUrl.label',
    ),
    placeholder: localizationKeys(
      'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.signOnUrl.placeholder',
    ),
    isRequired: true,
  });

  const issuerField = useFormControl('idpEntityId', samlConnection?.idpEntityId ?? '', {
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

  const trimmedMetadataUrl = metadataUrlField.value.trim();
  const trimmedSignOnUrl = signOnUrlField.value.trim();
  const trimmedIssuer = issuerField.value.trim();
  const hasCert = certFile !== null || existingCertPresent;

  const isValid =
    mode === 'metadataUrl'
      ? trimmedMetadataUrl.length > 0
      : trimmedSignOnUrl.length > 0 && trimmedIssuer.length > 0 && hasCert;

  const canSubmit = isValid && !card.isLoading;

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
            certFile,
            onCertFileChange: setCertFile,
            existingCertPresent,
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

  const handleContinue = async (): Promise<void> => {
    if (!enterpriseConnection || !canSubmit) {
      return;
    }

    card.setError(undefined);
    card.setLoading();

    try {
      const saml = await buildSamlConfigurationPayload({
        mode,
        metadataUrl: { value: metadataUrlField.value },
        manual: { signOnUrl: signOnUrlField.value, issuer: issuerField.value, certFile },
      });

      await updateConnection(enterpriseConnection.id, { saml });
      void goNext();
    } catch (err) {
      if (mode === 'metadataUrl') {
        applySamlSubmitError(err, card, metadataUrlField);
      } else {
        applySamlSubmitError(err, card, signOnUrlField, [issuerField, certificateField]);
      }
    } finally {
      card.setIdle();
    }
  };

  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.samlCustom.mainHeaderTitle')}
        description={localizationKeys(
          'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.headerSubtitle',
        )}
      >
        <InnerStepCounter />
      </Step.Header>

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
              'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.modes.title',
            )}
          />
          <IdentityProviderConfigurationModes
            modes={CUSTOM_SAML_IDP_MODES}
            value={mode}
            onChange={next => {
              card.setError(undefined);
              setMode(next);
            }}
            labels={{
              ariaLabel: localizationKeys(
                'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.modes.ariaLabel',
              ),
              metadataUrl: localizationKeys(
                'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.modes.metadataUrl',
              ),
              manual: localizationKeys(
                'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.modes.manual',
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

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

const OKTA_STEPS: WizardStepConfig[] = [
  { id: 'create-app' },
  { id: 'attribute-mapping' },
  { id: 'assign-users' },
  { id: 'identity-provider-metadata' },
];

export const SamlOktaConfigureSteps = (): JSX.Element => {
  return (
    // Linear, guard-less sub-flow: mount on the first step. (Entry guards drive
    // furthest-reachable init, which would otherwise land the last step here.)
    <Wizard
      steps={OKTA_STEPS}
      initialStepId={OKTA_STEPS[0].id}
    >
      <Wizard.Match id='create-app'>
        <SamlOktaCreateAppStep />
      </Wizard.Match>
      <Wizard.Match id='attribute-mapping'>
        <SamlOktaAttributeMappingStep />
      </Wizard.Match>
      <Wizard.Match id='assign-users'>
        <SamlOktaAssignUsersStep />
      </Wizard.Match>
      <Wizard.Match id='identity-provider-metadata'>
        <SamlOktaIdentityProviderMetadataStep />
      </Wizard.Match>
    </Wizard>
  );
};

const SamlOktaCreateAppStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  const { enterpriseConnection } = useConfigureSSO();

  const acsUrl = enterpriseConnection?.samlConnection?.acsUrl ?? '';
  const spEntityId = enterpriseConnection?.samlConnection?.spEntityId ?? '';

  const acsUrlField = useFormControl('acsUrl', acsUrl, {
    type: 'text',
    label: localizationKeys(
      'configureSSO.configureStep.samlOkta.createAppStep.serviceProviderInstructions.serviceProviderFields.acsUrl.label',
    ),
    isRequired: false,
  });
  const spEntityIdField = useFormControl('spEntityId', spEntityId, {
    type: 'text',
    label: localizationKeys(
      'configureSSO.configureStep.samlOkta.createAppStep.serviceProviderInstructions.serviceProviderFields.spEntityId.label',
    ),
    isRequired: false,
  });

  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.samlOkta.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.samlOkta.createAppStep.headerSubtitle')}
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
                'configureSSO.configureStep.samlOkta.createAppStep.createAppInstructions.title',
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
                  'configureSSO.configureStep.samlOkta.createAppStep.createAppInstructions.step1',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlOkta.createAppStep.createAppInstructions.step2',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlOkta.createAppStep.createAppInstructions.step3',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlOkta.createAppStep.createAppInstructions.step4',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlOkta.createAppStep.createAppInstructions.step5',
                )}
              />
            </Col>
          </Col>

          <Col sx={theme => ({ gap: theme.space.$1x5 })}>
            <Heading
              elementDescriptor={descriptors.configureSSOInstructionsHeading}
              as='h3'
              textVariant='subtitle'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlOkta.createAppStep.serviceProviderInstructions.title',
              )}
            />
            <Text
              as='p'
              colorScheme='secondary'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlOkta.createAppStep.serviceProviderInstructions.paragraph1',
              )}
            />
            <Text
              as='p'
              colorScheme='secondary'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlOkta.createAppStep.serviceProviderInstructions.paragraph2',
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

          <Col sx={theme => ({ gap: theme.space.$1x5 })}>
            <Heading
              elementDescriptor={descriptors.configureSSOInstructionsHeading}
              as='h3'
              textVariant='subtitle'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlOkta.createAppStep.completeSamlIntegrationInstructions.title',
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
                  'configureSSO.configureStep.samlOkta.createAppStep.completeSamlIntegrationInstructions.step1',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlOkta.createAppStep.completeSamlIntegrationInstructions.step2',
                )}
              />
            </Col>
          </Col>
        </Step.Section>
      </Step.Body>

      <Step.Footer>
        <Step.Footer.Reset />
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

type OktaAttributeRow = {
  id: 'email' | 'firstName' | 'lastName';
  isRequired: boolean;
};

const OKTA_ATTRIBUTE_ROWS: ReadonlyArray<OktaAttributeRow> = [
  { id: 'email', isRequired: true },
  { id: 'firstName', isRequired: false },
  { id: 'lastName', isRequired: false },
];

const OktaAttributeMappingTable = (): JSX.Element => (
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
              'configureSSO.configureStep.samlOkta.attributeMappingStep.attributeMappingTable.columns.name',
            )}
          />
        </Th>
        <Th>
          <Text
            sx={theme => ({ fontSize: theme.fontSizes.$xs })}
            localizationKey={localizationKeys(
              'configureSSO.configureStep.samlOkta.attributeMappingStep.attributeMappingTable.columns.expression',
            )}
          />
        </Th>
      </Tr>
    </Thead>
    <Tbody>
      {OKTA_ATTRIBUTE_ROWS.map(row => (
        <Tr key={row.id}>
          <Td>
            <Flex
              as='span'
              align='center'
              sx={theme => ({ gap: theme.space.$2 })}
            >
              <Text
                as='span'
                sx={{ fontFamily: 'monospace' }}
                localizationKey={localizationKeys(
                  `configureSSO.configureStep.samlOkta.attributeMappingStep.attributeMappingTable.rows.${row.id}.name`,
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
                `configureSSO.configureStep.samlOkta.attributeMappingStep.attributeMappingTable.rows.${row.id}.expression`,
              )}
            />
          </Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
);

const SamlOktaAttributeMappingStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.samlOkta.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.samlOkta.attributeMappingStep.headerSubtitle')}
      >
        <InnerStepCounter />
      </Step.Header>

      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$3 })}>
          <Text
            as='p'
            colorScheme='secondary'
            localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.attributeMappingStep.paragraph')}
          />

          <Col
            elementDescriptor={descriptors.configureSSOInstructionsList}
            as='ol'
            sx={theme => ({
              gap: theme.space.$1x5,
              margin: 0,
              paddingInlineStart: theme.space.$5,
              listStyleType: 'decimal',
            })}
          >
            <Text
              elementDescriptor={descriptors.configureSSOInstructionsListItem}
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.attributeMappingStep.step1')}
            />
            <Text
              elementDescriptor={descriptors.configureSSOInstructionsListItem}
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.attributeMappingStep.step2')}
            />
          </Col>

          <OktaAttributeMappingTable />
        </Step.Section>
      </Step.Body>

      <Step.Footer>
        <Step.Footer.Reset />
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

const SamlOktaAssignUsersStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.samlOkta.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.samlOkta.assignUsersStep.headerSubtitle')}
      >
        <InnerStepCounter />
      </Step.Header>

      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$3 })}>
          <Heading
            elementDescriptor={descriptors.configureSSOInstructionsHeading}
            as='h3'
            textVariant='subtitle'
            localizationKey={localizationKeys(
              'configureSSO.configureStep.samlOkta.assignUsersStep.assignUsersInstructions.title',
            )}
          />
          <Text
            as='p'
            colorScheme='secondary'
            localizationKey={localizationKeys(
              'configureSSO.configureStep.samlOkta.assignUsersStep.assignUsersInstructions.paragraph',
            )}
          />

          <Col
            elementDescriptor={descriptors.configureSSOInstructionsList}
            as='ol'
            sx={theme => ({
              gap: theme.space.$1x5,
              margin: 0,
              paddingInlineStart: theme.space.$5,
              listStyleType: 'decimal',
            })}
          >
            <Text
              elementDescriptor={descriptors.configureSSOInstructionsListItem}
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlOkta.assignUsersStep.assignUsersInstructions.step1',
              )}
            />
            <Text
              elementDescriptor={descriptors.configureSSOInstructionsListItem}
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlOkta.assignUsersStep.assignUsersInstructions.step2',
              )}
            />
            <Text
              elementDescriptor={descriptors.configureSSOInstructionsListItem}
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlOkta.assignUsersStep.assignUsersInstructions.step3',
              )}
            />
            <Text
              elementDescriptor={descriptors.configureSSOInstructionsListItem}
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlOkta.assignUsersStep.assignUsersInstructions.step4',
              )}
            />
            <Text
              elementDescriptor={descriptors.configureSSOInstructionsListItem}
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlOkta.assignUsersStep.assignUsersInstructions.step5',
              )}
            />
          </Col>
        </Step.Section>
      </Step.Body>

      <Step.Footer>
        <Step.Footer.Reset />
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

const OKTA_IDP_MODES = ['metadataUrl', 'manual'] as const satisfies readonly IdpConfigurationMode[];

const SamlOktaIdentityProviderMetadataStep = (): JSX.Element => {
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
  // Step-LOCAL submit state for the Continue button. `goNext` bubbles to the
  // parent (this is the terminal nested step) and the parent DEFERS the
  // configure→test advance until the updateConnection revalidate lands. Keeping
  // the loading local — and NOT resetting it on success — holds the button
  // loading straight through that deferred transition; the advance unmounts this
  // nested step, ending the loading with no idle flash on the shared card.
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const metadataUrlField = useFormControl('idpMetadataUrl', samlConnection?.idpMetadataUrl ?? '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.samlOkta.identityProviderMetadataStep.metadataUrl.label'),
    placeholder: localizationKeys(
      'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.metadataUrl.placeholder',
    ),
    isRequired: true,
  });

  const signOnUrlField = useFormControl('idpSsoUrl', samlConnection?.idpSsoUrl ?? '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.samlOkta.identityProviderMetadataStep.manual.signOnUrl.label'),
    placeholder: localizationKeys(
      'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.manual.signOnUrl.placeholder',
    ),
    isRequired: true,
  });

  const issuerField = useFormControl('idpEntityId', samlConnection?.idpEntityId ?? '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.samlOkta.identityProviderMetadataStep.manual.issuer.label'),
    placeholder: localizationKeys(
      'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.manual.issuer.placeholder',
    ),
    isRequired: true,
  });

  const certificateField = useFormControl('idpCertificate', '', {
    type: 'text',
    label: localizationKeys(
      'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.manual.signingCertificate.label',
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

  const canSubmit = isValid && !isSubmitting;

  const formProps: IdentityProviderConfigurationFormProps =
    mode === 'metadataUrl'
      ? {
          mode: 'metadataUrl',
          form: { field: metadataUrlField },
          labels: {
            description: localizationKeys(
              'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.metadataUrl.description',
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
              'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.manual.description',
            ),
            uploadFile: localizationKeys(
              'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.manual.signingCertificate.uploadFile',
            ),
            replaceFile: localizationKeys(
              'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.manual.signingCertificate.replaceFile',
            ),
            removeFile: localizationKeys(
              'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.manual.signingCertificate.removeFile',
            ),
            fileUploaded: localizationKeys(
              'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.manual.signingCertificate.fileUploaded',
            ),
          },
        };

  const handleContinue = async (): Promise<void> => {
    if (!enterpriseConnection || !canSubmit) {
      return;
    }

    card.setError(undefined);
    setIsSubmitting(true);

    try {
      const saml = await buildSamlConfigurationPayload({
        mode,
        metadataUrl: { value: metadataUrlField.value },
        manual: { signOnUrl: signOnUrlField.value, issuer: issuerField.value, certFile },
      });
      await updateConnection(enterpriseConnection.id, { saml });
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
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.samlOkta.mainHeaderTitle')}
        description={localizationKeys(
          'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.headerSubtitle',
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
              'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.modes.title',
            )}
          />
          <IdentityProviderConfigurationModes
            modes={OKTA_IDP_MODES}
            value={mode}
            onChange={next => {
              card.setError(undefined);
              setMode(next);
            }}
            labels={{
              ariaLabel: localizationKeys(
                'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.modes.ariaLabel',
              ),
              metadataUrl: localizationKeys(
                'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.modes.metadataUrl',
              ),
              manual: localizationKeys('configureSSO.configureStep.samlOkta.identityProviderMetadataStep.modes.manual'),
            }}
          />
          <IdentityProviderConfigurationForm {...formProps} />
        </Step.Section>
      </Step.Body>

      <Step.Footer>
        <Step.Footer.Reset />
        <Step.Footer.Previous
          onClick={() => goPrev()}
          isDisabled={isFirstStep || isSubmitting}
        />
        <Step.Footer.Continue
          onClick={handleContinue}
          isLoading={isSubmitting}
          isDisabled={!canSubmit}
        />
      </Step.Footer>
    </>
  );
};

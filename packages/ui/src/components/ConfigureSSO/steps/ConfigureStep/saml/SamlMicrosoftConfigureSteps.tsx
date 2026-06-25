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
  localizationKeys,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useLocalizations,
} from '@/customizables';
import { ClipboardInput } from '@/elements/ClipboardInput';
import { useCardState } from '@/elements/contexts';
import { Form } from '@/elements/Form';
import { Tooltip } from '@/elements/Tooltip';
import { useClipboard } from '@/hooks';
import { Checkmark, Clipboard } from '@/icons';
import { truncateWithEndVisible } from '@/ui/utils/truncateTextWithEndVisible';
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

const MICROSOFT_STEPS: WizardStepConfig[] = [
  { id: 'create-app' },
  { id: 'service-provider' },
  { id: 'attribute-mapping' },
  { id: 'identity-provider-metadata' },
];

export const SamlMicrosoftConfigureSteps = (): JSX.Element => {
  return (
    // Linear, guard-less sub-flow: mount on the first step. (Entry guards drive
    // furthest-reachable init, which would otherwise land the last step here.)
    <Wizard
      steps={MICROSOFT_STEPS}
      initialStepId={MICROSOFT_STEPS[0].id}
    >
      <Wizard.Match id='create-app'>
        <SamlMicrosoftCreateAppStep />
      </Wizard.Match>
      <Wizard.Match id='service-provider'>
        <SamlMicrosoftServiceProviderStep />
      </Wizard.Match>
      <Wizard.Match id='attribute-mapping'>
        <SamlMicrosoftAttributeMappingStep />
      </Wizard.Match>
      <Wizard.Match id='identity-provider-metadata'>
        <SamlMicrosoftIdentityProviderMetadataStep />
      </Wizard.Match>
    </Wizard>
  );
};

const SamlMicrosoftCreateAppStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.samlMicrosoft.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.samlMicrosoft.createAppStep.headerSubtitle')}
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
                'configureSSO.configureStep.samlMicrosoft.createAppStep.createAppInstructions.title',
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
                  'configureSSO.configureStep.samlMicrosoft.createAppStep.createAppInstructions.step1',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlMicrosoft.createAppStep.createAppInstructions.step2',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlMicrosoft.createAppStep.createAppInstructions.step3',
                )}
              />

              <Box
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                sx={theme => ({
                  fontSize: theme.fontSizes.$md,
                  lineHeight: theme.lineHeights.$small,
                  color: theme.colors.$colorMutedForeground,
                })}
              >
                <Text
                  as='span'
                  colorScheme='secondary'
                  localizationKey={localizationKeys(
                    'configureSSO.configureStep.samlMicrosoft.createAppStep.createAppInstructions.step4.label',
                  )}
                />
                <Col
                  elementDescriptor={descriptors.configureSSOInstructionsList}
                  as='ul'
                  sx={theme => ({
                    gap: theme.space.$1x5,
                    marginBlockStart: theme.space.$1x5,
                    marginBlockEnd: 0,
                    paddingInlineStart: theme.space.$5,
                    listStyleType: 'circle',
                  })}
                >
                  <Text
                    elementDescriptor={descriptors.configureSSOInstructionsListItem}
                    as='li'
                    colorScheme='secondary'
                    localizationKey={localizationKeys(
                      'configureSSO.configureStep.samlMicrosoft.createAppStep.createAppInstructions.step4.subSteps.appName',
                    )}
                  />
                  <Text
                    elementDescriptor={descriptors.configureSSOInstructionsListItem}
                    as='li'
                    colorScheme='secondary'
                    localizationKey={localizationKeys(
                      'configureSSO.configureStep.samlMicrosoft.createAppStep.createAppInstructions.step4.subSteps.nonGallery',
                    )}
                  />
                  <Text
                    elementDescriptor={descriptors.configureSSOInstructionsListItem}
                    as='li'
                    colorScheme='secondary'
                    localizationKey={localizationKeys(
                      'configureSSO.configureStep.samlMicrosoft.createAppStep.createAppInstructions.step4.subSteps.create',
                    )}
                  />
                </Col>
              </Box>
            </Col>
          </Col>

          <Col sx={theme => ({ gap: theme.space.$1x5 })}>
            <Heading
              elementDescriptor={descriptors.configureSSOInstructionsHeading}
              as='h3'
              textVariant='subtitle'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlMicrosoft.createAppStep.assignUsersInstructions.title',
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
                  'configureSSO.configureStep.samlMicrosoft.createAppStep.assignUsersInstructions.step1',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlMicrosoft.createAppStep.assignUsersInstructions.step2',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlMicrosoft.createAppStep.assignUsersInstructions.step3',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlMicrosoft.createAppStep.assignUsersInstructions.step4',
                )}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlMicrosoft.createAppStep.assignUsersInstructions.step5',
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

const SamlMicrosoftServiceProviderStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  const { enterpriseConnection } = useConfigureSSO();

  const acsUrl = enterpriseConnection?.samlConnection?.acsUrl ?? '';
  const spEntityId = enterpriseConnection?.samlConnection?.spEntityId ?? '';

  const spEntityIdField = useFormControl('spEntityId', spEntityId, {
    type: 'text',
    label: localizationKeys(
      'configureSSO.configureStep.samlMicrosoft.serviceProviderStep.serviceProviderFields.spEntityId.label',
    ),
    isRequired: false,
  });
  const acsUrlField = useFormControl('acsUrl', acsUrl, {
    type: 'text',
    label: localizationKeys(
      'configureSSO.configureStep.samlMicrosoft.serviceProviderStep.serviceProviderFields.acsUrl.label',
    ),
    isRequired: false,
  });

  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.samlMicrosoft.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.samlMicrosoft.serviceProviderStep.headerSubtitle')}
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
              localizationKey={localizationKeys('configureSSO.configureStep.samlMicrosoft.serviceProviderStep.title')}
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
                localizationKey={localizationKeys('configureSSO.configureStep.samlMicrosoft.serviceProviderStep.step1')}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys('configureSSO.configureStep.samlMicrosoft.serviceProviderStep.step2')}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys('configureSSO.configureStep.samlMicrosoft.serviceProviderStep.step3')}
              />
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys('configureSSO.configureStep.samlMicrosoft.serviceProviderStep.step4')}
              />

              <Box
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                sx={theme => ({
                  fontSize: theme.fontSizes.$md,
                  lineHeight: theme.lineHeights.$small,
                  color: theme.colors.$colorMutedForeground,
                })}
              >
                <Text
                  as='span'
                  colorScheme='secondary'
                  localizationKey={localizationKeys(
                    'configureSSO.configureStep.samlMicrosoft.serviceProviderStep.step5',
                  )}
                />
                <Col sx={theme => ({ gap: theme.space.$4, marginBlock: theme.space.$3 })}>
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
                </Col>
              </Box>

              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys('configureSSO.configureStep.samlMicrosoft.serviceProviderStep.step6')}
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

type MicrosoftAttributeRow = {
  id: 'email' | 'firstName' | 'lastName';
  isRequired: boolean;
};

const MICROSOFT_ATTRIBUTE_ROWS: ReadonlyArray<MicrosoftAttributeRow> = [
  { id: 'email', isRequired: true },
  { id: 'firstName', isRequired: false },
  { id: 'lastName', isRequired: false },
];

const MicrosoftClaimNameCell = ({ claimNameKey }: { claimNameKey: LocalizationKey }): JSX.Element => {
  const { t } = useLocalizations();
  const claimName = t(claimNameKey);
  const { onCopy, hasCopied } = useClipboard(claimName);

  return (
    <Td sx={{ maxWidth: 0, width: '100%' }}>
      <Flex
        as='span'
        align='center'
        sx={theme => ({ gap: theme.space.$1 })}
      >
        <Tooltip.Root>
          <Tooltip.Trigger>
            <Text
              as='span'
              sx={{
                fontFamily: 'monospace',
                display: 'block',
                whiteSpace: 'nowrap',
              }}
            >
              {/* Middle-truncate so the meaningful end of the claim URI (e.g. "emailaddress") stays visible. */}
              {truncateWithEndVisible(claimName, 32, 12)}
            </Text>
          </Tooltip.Trigger>
          <Tooltip.Content
            text={claimNameKey}
            textSx={{ overflowWrap: 'anywhere' }}
          />
        </Tooltip.Root>
        <Button
          variant='ghost'
          onClick={() => onCopy()}
          aria-label={t(
            localizationKeys(
              hasCopied
                ? 'configureSSO.configureStep.samlMicrosoft.attributeMappingStep.attributeMappingTable.copyClaimNameCopied'
                : 'configureSSO.configureStep.samlMicrosoft.attributeMappingStep.attributeMappingTable.copyClaimName',
            ),
          )}
          sx={theme => ({
            padding: 0,
            height: theme.sizes.$5,
            aspectRatio: 1,
            borderRadius: theme.radii.$sm,
            color: theme.colors.$colorMutedForeground,
          })}
        >
          <Icon
            size='sm'
            icon={hasCopied ? Checkmark : Clipboard}
            aria-hidden
          />
        </Button>
      </Flex>
    </Td>
  );
};

const MicrosoftAttributeMappingTable = (): JSX.Element => {
  return (
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
                'configureSSO.configureStep.samlMicrosoft.attributeMappingStep.attributeMappingTable.columns.attribute',
              )}
            />
          </Th>
          <Th>
            <Text
              sx={theme => ({ fontSize: theme.fontSizes.$xs })}
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlMicrosoft.attributeMappingStep.attributeMappingTable.columns.claimName',
              )}
            />
          </Th>
          <Th>
            <Text
              sx={theme => ({ fontSize: theme.fontSizes.$xs })}
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlMicrosoft.attributeMappingStep.attributeMappingTable.columns.value',
              )}
            />
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {MICROSOFT_ATTRIBUTE_ROWS.map(row => {
          const claimNameKey = localizationKeys(
            `configureSSO.configureStep.samlMicrosoft.attributeMappingStep.attributeMappingTable.rows.${row.id}.claimName`,
          );

          return (
            <Tr key={row.id}>
              <Td sx={{ whiteSpace: 'nowrap' }}>
                <Flex
                  as='span'
                  align='center'
                  sx={theme => ({ gap: theme.space.$2 })}
                >
                  <Text
                    as='span'
                    colorScheme='secondary'
                    localizationKey={localizationKeys(
                      `configureSSO.configureStep.samlMicrosoft.attributeMappingStep.attributeMappingTable.rows.${row.id}.attribute`,
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
              <MicrosoftClaimNameCell claimNameKey={claimNameKey} />
              <Td>
                <Text
                  as='span'
                  sx={{ fontFamily: 'monospace' }}
                  localizationKey={localizationKeys(
                    `configureSSO.configureStep.samlMicrosoft.attributeMappingStep.attributeMappingTable.rows.${row.id}.value`,
                  )}
                />
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

const SamlMicrosoftAttributeMappingStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.samlMicrosoft.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.samlMicrosoft.attributeMappingStep.headerSubtitle')}
      >
        <InnerStepCounter />
      </Step.Header>

      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$3 })}>
          <Text
            as='p'
            colorScheme='secondary'
            elementDescriptor={descriptors.configureSSOInstructionsHeading}
            localizationKey={localizationKeys('configureSSO.configureStep.samlMicrosoft.attributeMappingStep.title')}
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
              localizationKey={localizationKeys('configureSSO.configureStep.samlMicrosoft.attributeMappingStep.step1')}
            />
            <Text
              elementDescriptor={descriptors.configureSSOInstructionsListItem}
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.configureStep.samlMicrosoft.attributeMappingStep.step2')}
            />
          </Col>

          <MicrosoftAttributeMappingTable />
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

const MICROSOFT_SAML_IDP_MODES = ['metadataUrl', 'manual'] as const satisfies readonly IdpConfigurationMode[];

const SamlMicrosoftIdentityProviderMetadataStep = (): JSX.Element => {
  const card = useCardState();
  const { goNext, goPrev, isFirstStep } = useWizard();
  const {
    enterpriseConnection,
    enterpriseConnectionMutations: { updateConnection },
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
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const metadataUrlField = useFormControl('idpMetadataUrl', samlConnection?.idpMetadataUrl ?? '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.metadataUrl.label'),
    placeholder: localizationKeys(
      'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.metadataUrl.placeholder',
    ),
    isRequired: true,
  });

  const signOnUrlField = useFormControl('idpSsoUrl', samlConnection?.idpSsoUrl ?? '', {
    type: 'text',
    label: localizationKeys(
      'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.manual.signOnUrl.label',
    ),
    placeholder: localizationKeys(
      'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.manual.signOnUrl.placeholder',
    ),
    isRequired: true,
  });

  const issuerField = useFormControl('idpEntityId', samlConnection?.idpEntityId ?? '', {
    type: 'text',
    label: localizationKeys(
      'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.manual.issuer.label',
    ),
    placeholder: localizationKeys(
      'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.manual.issuer.placeholder',
    ),
    isRequired: true,
  });

  const certificateField = useFormControl('idpCertificate', '', {
    type: 'text',
    label: localizationKeys(
      'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.manual.signingCertificate.label',
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
              'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.metadataUrl.description',
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
              'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.manual.description',
            ),
            uploadFile: localizationKeys(
              'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.manual.signingCertificate.uploadFile',
            ),
            replaceFile: localizationKeys(
              'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.manual.signingCertificate.replaceFile',
            ),
            removeFile: localizationKeys(
              'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.manual.signingCertificate.removeFile',
            ),
            fileUploaded: localizationKeys(
              'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.manual.signingCertificate.fileUploaded',
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
        title={localizationKeys('configureSSO.configureStep.samlMicrosoft.mainHeaderTitle')}
        description={localizationKeys(
          'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.headerSubtitle',
        )}
      >
        <InnerStepCounter />
      </Step.Header>

      <Step.Body>
        <Step.Section
          fill
          gap={5}
        >
          <IdentityProviderConfigurationModes
            modes={MICROSOFT_SAML_IDP_MODES}
            value={mode}
            onChange={next => {
              card.setError(undefined);
              setMode(next);
            }}
            labels={{
              ariaLabel: localizationKeys(
                'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.modes.ariaLabel',
              ),
              metadataUrl: localizationKeys(
                'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.modes.metadataUrl',
              ),
              manual: localizationKeys(
                'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.modes.manual',
              ),
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

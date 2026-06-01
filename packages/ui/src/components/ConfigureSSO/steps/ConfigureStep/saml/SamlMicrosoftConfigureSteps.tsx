import React, { type JSX } from 'react';

import {
  Badge,
  Box,
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
import { Tooltip } from '@/elements/Tooltip';
import { Checkmark, Clipboard } from '@/icons';
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

export const SamlMicrosoftConfigureSteps = (): JSX.Element => {
  return (
    <>
      <Wizard.Step id='create-app'>
        <Step.Header
          title={localizationKeys('configureSSO.configureStep.samlMicrosoft.mainHeaderTitle')}
          description={localizationKeys('configureSSO.configureStep.samlMicrosoft.createAppStep.headerSubtitle')}
        >
          <InnerStepCounter />
        </Step.Header>
        <SamlMicrosoftCreateAppStep />
      </Wizard.Step>

      <Wizard.Step id='service-provider'>
        <Step.Header
          title={localizationKeys('configureSSO.configureStep.samlMicrosoft.mainHeaderTitle')}
          description={localizationKeys('configureSSO.configureStep.samlMicrosoft.serviceProviderStep.headerSubtitle')}
        >
          <InnerStepCounter />
        </Step.Header>
        <SamlMicrosoftServiceProviderStep />
      </Wizard.Step>

      <Wizard.Step id='attribute-mapping'>
        <Step.Header
          title={localizationKeys('configureSSO.configureStep.samlMicrosoft.mainHeaderTitle')}
          description={localizationKeys('configureSSO.configureStep.samlMicrosoft.attributeMappingStep.headerSubtitle')}
        >
          <InnerStepCounter />
        </Step.Header>
        <SamlMicrosoftAttributeMappingStep />
      </Wizard.Step>

      <Wizard.Step id='identity-provider-metadata'>
        <Step.Header
          title={localizationKeys('configureSSO.configureStep.samlMicrosoft.mainHeaderTitle')}
          description={localizationKeys(
            'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.headerSubtitle',
          )}
        >
          <InnerStepCounter />
        </Step.Header>
        <SamlMicrosoftIdentityProviderMetadataStep />
      </Wizard.Step>
    </>
  );
};

const SamlMicrosoftCreateAppStep = (): JSX.Element => {
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
            <Text
              as='p'
              colorScheme='secondary'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.samlMicrosoft.createAppStep.assignUsersInstructions.paragraph1',
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
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.samlMicrosoft.createAppStep.assignUsersInstructions.step6',
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
              <Text
                elementDescriptor={descriptors.configureSSOInstructionsListItem}
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys('configureSSO.configureStep.samlMicrosoft.serviceProviderStep.step5')}
              />
            </Col>
          </Col>

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
              localizationKey={localizationKeys('configureSSO.configureStep.samlMicrosoft.serviceProviderStep.step6')}
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

type MicrosoftAttributeRow = {
  id: 'email' | 'firstName' | 'lastName';
  isRequired: boolean;
};

const MICROSOFT_ATTRIBUTE_ROWS: ReadonlyArray<MicrosoftAttributeRow> = [
  { id: 'email', isRequired: true },
  { id: 'firstName', isRequired: false },
  { id: 'lastName', isRequired: false },
];

const MicrosoftAttributeMappingTable = (): JSX.Element => (
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
            {/*
             * Keep the attribute name + badge on a single line. Without this,
             * the next cell's `width: 100%` squeezes this one to its minimum
             * intrinsic width, which causes "Email address" / "First name" /
             * "Last name" to wrap onto two lines.
             */}
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
            <Td sx={{ maxWidth: 0, width: '100%' }}>
              <Tooltip.Root>
                <Tooltip.Trigger>
                  <Text
                    as='span'
                    sx={{
                      fontFamily: 'monospace',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    localizationKey={claimNameKey}
                  />
                </Tooltip.Trigger>
                <Tooltip.Content
                  text={claimNameKey}
                  textSx={{ overflowWrap: 'anywhere' }}
                />
              </Tooltip.Root>
            </Td>
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

const SamlMicrosoftAttributeMappingStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <>
      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$3 })}>
          <Heading
            elementDescriptor={descriptors.configureSSOInstructionsHeading}
            as='h3'
            textVariant='subtitle'
            localizationKey={localizationKeys('configureSSO.configureStep.samlMicrosoft.attributeMappingStep.title')}
          />

          <MicrosoftAttributeMappingTable />

          <Text
            as='p'
            colorScheme='secondary'
            localizationKey={localizationKeys(
              'configureSSO.configureStep.samlMicrosoft.attributeMappingStep.paragraph',
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
              localizationKey={localizationKeys('configureSSO.configureStep.samlMicrosoft.attributeMappingStep.step1')}
            />
            <Text
              elementDescriptor={descriptors.configureSSOInstructionsListItem}
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.configureStep.samlMicrosoft.attributeMappingStep.step2')}
            />
            <Text
              elementDescriptor={descriptors.configureSSOInstructionsListItem}
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.configureStep.samlMicrosoft.attributeMappingStep.step3')}
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

const MICROSOFT_SAML_IDP_MODES = ['metadataUrl', 'manual'] as const satisfies readonly IdpConfigurationMode[];

const SamlMicrosoftIdentityProviderMetadataStep = (): JSX.Element => {
  const card = useCardState();
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

  const [mode, setMode] = React.useState<IdpConfigurationMode>(hasExistingConfig ? 'manual' : 'metadataUrl');
  const [certFile, setCertFile] = React.useState<File | null>(null);

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

  const canSubmit = isValid && !card.isLoading;

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
    card.setLoading();

    try {
      const saml = await buildSamlConfigurationPayload({
        mode,
        metadataUrl: { value: metadataUrlField.value },
        manual: { signOnUrl: signOnUrlField.value, issuer: issuerField.value, certFile },
      });

      await updateEnterpriseConnection(enterpriseConnection.id, { saml });
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
              'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.modes.title',
            )}
          />
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

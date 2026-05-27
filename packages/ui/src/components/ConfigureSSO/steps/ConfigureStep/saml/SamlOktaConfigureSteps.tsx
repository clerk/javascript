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

export const SamlOktaConfigureSteps = (): JSX.Element => {
  return (
    <>
      <Wizard.Step id='create-app'>
        <Step.Header
          title={localizationKeys('configureSSO.configureStep.samlOkta.mainHeaderTitle')}
          description={localizationKeys('configureSSO.configureStep.samlOkta.createAppStep.headerSubtitle')}
        >
          <InnerStepCounter />
        </Step.Header>
        <SamlOktaCreateAppStep />
      </Wizard.Step>

      <Wizard.Step id='attribute-mapping'>
        <Step.Header
          title={localizationKeys('configureSSO.configureStep.samlOkta.mainHeaderTitle')}
          description={localizationKeys('configureSSO.configureStep.samlOkta.attributeMappingStep.headerSubtitle')}
        >
          <InnerStepCounter />
        </Step.Header>
        <SamlOktaAttributeMappingStep />
      </Wizard.Step>

      <Wizard.Step id='assign-users'>
        <Step.Header
          title={localizationKeys('configureSSO.configureStep.samlOkta.mainHeaderTitle')}
          description={localizationKeys('configureSSO.configureStep.samlOkta.assignUsersStep.headerSubtitle')}
        >
          <InnerStepCounter />
        </Step.Header>
        <SamlOktaAssignUsersStep />
      </Wizard.Step>

      <Wizard.Step id='identity-provider-metadata'>
        <Step.Header
          title={localizationKeys('configureSSO.configureStep.samlOkta.mainHeaderTitle')}
          description={localizationKeys(
            'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.headerSubtitle',
          )}
        >
          <InnerStepCounter />
        </Step.Header>
        <SamlOktaIdentityProviderMetadataStep />
      </Wizard.Step>
    </>
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

const OKTA_ATTRIBUTE_MAPPING: AttributeMappingTableConfig = {
  columns: {
    first: localizationKeys(
      'configureSSO.configureStep.samlOkta.attributeMappingStep.attributeMappingTable.columns.name',
    ),
    second: localizationKeys(
      'configureSSO.configureStep.samlOkta.attributeMappingStep.attributeMappingTable.columns.expression',
    ),
  },
  monoFirst: true,
  rows: [
    {
      id: 'email',
      isRequired: true,
      first: localizationKeys(
        'configureSSO.configureStep.samlOkta.attributeMappingStep.attributeMappingTable.rows.email.name',
      ),
      second: localizationKeys(
        'configureSSO.configureStep.samlOkta.attributeMappingStep.attributeMappingTable.rows.email.expression',
      ),
    },
    {
      id: 'firstName',
      isRequired: false,
      first: localizationKeys(
        'configureSSO.configureStep.samlOkta.attributeMappingStep.attributeMappingTable.rows.firstName.name',
      ),
      second: localizationKeys(
        'configureSSO.configureStep.samlOkta.attributeMappingStep.attributeMappingTable.rows.firstName.expression',
      ),
    },
    {
      id: 'lastName',
      isRequired: false,
      first: localizationKeys(
        'configureSSO.configureStep.samlOkta.attributeMappingStep.attributeMappingTable.rows.lastName.name',
      ),
      second: localizationKeys(
        'configureSSO.configureStep.samlOkta.attributeMappingStep.attributeMappingTable.rows.lastName.expression',
      ),
    },
  ],
};

const SamlOktaAttributeMappingStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <>
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
            {/*
             * The actual name/expression pairs that step 2 refers to are
             * rendered by the `AttributeMappingTable` immediately below this
             * list — keeping them in a single tabular surface instead of an
             * inline badge list matches the design (see Okta screenshot:
             * "Create the following attribute mapping statements:" + table).
             */}
            <Text
              elementDescriptor={descriptors.configureSSOInstructionsListItem}
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.attributeMappingStep.step2')}
            />
          </Col>

          <AttributeMappingTable config={OKTA_ATTRIBUTE_MAPPING} />
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

const SamlOktaAssignUsersStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <>
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

const SamlOktaIdentityProviderMetadataStep = (): JSX.Element => (
  <IdentityProviderMetadataForm
    modes={{
      title: localizationKeys('configureSSO.configureStep.samlOkta.identityProviderMetadataStep.modes.title'),
      ariaLabel: localizationKeys('configureSSO.configureStep.samlOkta.identityProviderMetadataStep.modes.ariaLabel'),
      metadataUrlLabel: localizationKeys(
        'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.modes.metadataUrl',
      ),
      manualLabel: localizationKeys('configureSSO.configureStep.samlOkta.identityProviderMetadataStep.modes.manual'),
    }}
    metadataUrl={{
      label: localizationKeys('configureSSO.configureStep.samlOkta.identityProviderMetadataStep.metadataUrl.label'),
      placeholder: localizationKeys(
        'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.metadataUrl.placeholder',
      ),
      description: localizationKeys(
        'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.metadataUrl.description',
      ),
    }}
    manual={{
      description: localizationKeys(
        'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.manual.description',
      ),
      signOnUrl: {
        label: localizationKeys(
          'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.manual.signOnUrl.label',
        ),
        placeholder: localizationKeys(
          'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.manual.signOnUrl.placeholder',
        ),
      },
      issuer: {
        label: localizationKeys('configureSSO.configureStep.samlOkta.identityProviderMetadataStep.manual.issuer.label'),
        placeholder: localizationKeys(
          'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.manual.issuer.placeholder',
        ),
      },
      signingCertificate: {
        label: localizationKeys(
          'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.manual.signingCertificate.label',
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
    }}
  />
);

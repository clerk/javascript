import {
  Badge,
  Col,
  descriptors,
  Flex,
  Flow,
  Heading,
  type LocalizationKey,
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
import { Check, ClipboardOutline } from '@/icons';
import { handleError } from '@/utils/errorHandler';
import { useFormControl } from '@/utils/useFormControl';

import { useConfigureSSO } from '../ConfigureSSOContext';
import { Step } from '../elements/Step';
import { useWizard, Wizard } from '../elements/Wizard';

export const ConfigureStep = (): JSX.Element => {
  return (
    <Flow.Part part='configureCreateApp'>
      <Step
        elementDescriptor={descriptors.configureSSOStep}
        elementId={descriptors.configureSSOStep.setId('configure')}
      >
        <Wizard>
          <Step.Header
            title={localizationKeys('configureSSO.configureStep.title')}
            description={localizationKeys('configureSSO.configureStep.subtitle')}
          >
            <InnerStepCounter />
          </Step.Header>

          <Wizard.Step id='create-app'>
            <CreateAppSubStep />
          </Wizard.Step>

          <Wizard.Step id='configure-attributes'>
            <ConfigureAttributesSubStep />
          </Wizard.Step>

          <Wizard.Step id='assign-users'>
            <AssignUsersSubStep />
          </Wizard.Step>

          <Wizard.Step id='submit-saml-config'>
            <SubmitSamlConfigSubStep />
          </Wizard.Step>
        </Wizard>
      </Step>
    </Flow.Part>
  );
};

const InnerStepCounter = (): JSX.Element => {
  const { currentIndex, totalSteps } = useWizard();
  return (
    <Step.Counter
      total={totalSteps}
      current={currentIndex + 1}
    />
  );
};

type InstructionStepKeys = {
  prefix: LocalizationKey;
  bold: LocalizationKey;
  suffix: LocalizationKey;
};

const InstructionStep = ({ prefix, bold, suffix }: InstructionStepKeys): JSX.Element => (
  <Text
    as='li'
    variant='body'
    sx={theme => ({ color: theme.colors.$colorMutedForeground })}
  >
    <Text
      as='span'
      variant='body'
      colorScheme='inherit'
      localizationKey={prefix}
    />
    <Text
      as='span'
      variant='body'
      colorScheme='inherit'
      sx={theme => ({ fontWeight: theme.fontWeights.$medium, color: theme.colors.$colorMutedForeground })}
      localizationKey={bold}
    />
    <Text
      as='span'
      variant='body'
      colorScheme='inherit'
      localizationKey={suffix}
    />
  </Text>
);

type InstructionStepWithCodeKeys = {
  prefix: LocalizationKey;
  bold: LocalizationKey;
  middle: LocalizationKey;
  code: LocalizationKey;
  suffix: LocalizationKey;
};

const InstructionStepWithCode = ({ prefix, bold, middle, code, suffix }: InstructionStepWithCodeKeys): JSX.Element => (
  <Text
    as='li'
    variant='body'
    sx={theme => ({ color: theme.colors.$colorMutedForeground })}
  >
    <Text
      as='span'
      variant='body'
      colorScheme='inherit'
      localizationKey={prefix}
    />
    <Text
      as='span'
      variant='body'
      colorScheme='inherit'
      sx={theme => ({ fontWeight: theme.fontWeights.$medium, color: theme.colors.$colorMutedForeground })}
      localizationKey={bold}
    />
    <Text
      as='span'
      variant='body'
      colorScheme='inherit'
      localizationKey={middle}
    />
    <Text
      as='span'
      variant='body'
      colorScheme='inherit'
      sx={theme => ({
        fontFamily: 'monospace',
        fontSize: theme.fontSizes.$sm,
        backgroundColor: theme.colors.$neutralAlpha100,
        borderRadius: theme.radii.$sm,
        padding: `${theme.space.$0x25} ${theme.space.$1}`,
      })}
      localizationKey={code}
    />
    <Text
      as='span'
      variant='body'
      colorScheme='inherit'
      localizationKey={suffix}
    />
  </Text>
);

export const CreateAppSubStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  const { enterpriseConnection } = useConfigureSSO();

  const acsUrl = enterpriseConnection?.samlConnection?.acsUrl ?? '';
  const spEntityId = enterpriseConnection?.samlConnection?.spEntityId ?? '';

  const acsUrlField = useFormControl('acsUrl', acsUrl, {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.createApp.serviceProvider.acsUrl.label'),
    isRequired: false,
  });
  const spEntityIdField = useFormControl('acsUrl', spEntityId, {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.createApp.serviceProvider.spEntityId.label'),
    isRequired: false,
  });

  return (
    <>
      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$5 })}>
          <Col sx={theme => ({ gap: theme.space.$1x5 })}>
            <Heading
              as='h3'
              textVariant='subtitle'
              localizationKey={localizationKeys('configureSSO.configureStep.createApp.createApp.title')}
            />
            <Col
              as='ul'
              sx={theme => ({
                gap: theme.space.$1x5,
                margin: 0,
                paddingInlineStart: theme.space.$4,
                listStyleType: 'disc',
              })}
            >
              <InstructionStep
                prefix={localizationKeys('configureSSO.configureStep.createApp.createApp.step1.prefix')}
                bold={localizationKeys('configureSSO.configureStep.createApp.createApp.step1.bold')}
                suffix={localizationKeys('configureSSO.configureStep.createApp.createApp.step1.suffix')}
              />
              <InstructionStep
                prefix={localizationKeys('configureSSO.configureStep.createApp.createApp.step2.prefix')}
                bold={localizationKeys('configureSSO.configureStep.createApp.createApp.step2.bold')}
                suffix={localizationKeys('configureSSO.configureStep.createApp.createApp.step2.suffix')}
              />
              <InstructionStep
                prefix={localizationKeys('configureSSO.configureStep.createApp.createApp.step3.prefix')}
                bold={localizationKeys('configureSSO.configureStep.createApp.createApp.step3.bold')}
                suffix={localizationKeys('configureSSO.configureStep.createApp.createApp.step3.suffix')}
              />
              <InstructionStep
                prefix={localizationKeys('configureSSO.configureStep.createApp.createApp.step4.prefix')}
                bold={localizationKeys('configureSSO.configureStep.createApp.createApp.step4.bold')}
                suffix={localizationKeys('configureSSO.configureStep.createApp.createApp.step4.suffix')}
              />
              <InstructionStep
                prefix={localizationKeys('configureSSO.configureStep.createApp.createApp.step5.prefix')}
                bold={localizationKeys('configureSSO.configureStep.createApp.createApp.step5.bold')}
                suffix={localizationKeys('configureSSO.configureStep.createApp.createApp.step5.suffix')}
              />
            </Col>
          </Col>

          <Col sx={theme => ({ gap: theme.space.$1x5 })}>
            <Heading
              as='h3'
              textVariant='subtitle'
              localizationKey={localizationKeys('configureSSO.configureStep.createApp.serviceProvider.title')}
            />
            <Text
              as='p'
              variant='body'
              sx={theme => ({ color: theme.colors.$colorMutedForeground })}
              localizationKey={localizationKeys('configureSSO.configureStep.createApp.serviceProvider.paragraph1')}
            />
            <Text
              as='p'
              variant='body'
              sx={theme => ({ color: theme.colors.$colorMutedForeground })}
              localizationKey={localizationKeys('configureSSO.configureStep.createApp.serviceProvider.paragraph2')}
            />
          </Col>

          <Form.ControlRow elementId={acsUrlField.id}>
            <Form.CommonInputWrapper {...acsUrlField.props}>
              <ClipboardInput
                value={acsUrl}
                readOnly
                copyIcon={ClipboardOutline}
                copiedIcon={Check}
              />
            </Form.CommonInputWrapper>
          </Form.ControlRow>

          <Form.CommonInputWrapper {...spEntityIdField.props}>
            <ClipboardInput
              value={spEntityId}
              readOnly
              copyIcon={ClipboardOutline}
              copiedIcon={Check}
            />
          </Form.CommonInputWrapper>

          <Col sx={theme => ({ gap: theme.space.$1x5 })}>
            <Heading
              as='h3'
              textVariant='subtitle'
              localizationKey={localizationKeys('configureSSO.configureStep.createApp.completeSamlIntegration.title')}
            />
            <Col
              as='ul'
              sx={theme => ({
                gap: theme.space.$1x5,
                margin: 0,
                paddingInlineStart: theme.space.$4,
                listStyleType: 'disc',
              })}
            >
              <InstructionStep
                prefix={localizationKeys('configureSSO.configureStep.createApp.completeSamlIntegration.step1.prefix')}
                bold={localizationKeys('configureSSO.configureStep.createApp.completeSamlIntegration.step1.bold')}
                suffix={localizationKeys('configureSSO.configureStep.createApp.completeSamlIntegration.step1.suffix')}
              />
              <InstructionStep
                prefix={localizationKeys('configureSSO.configureStep.createApp.completeSamlIntegration.step2.prefix')}
                bold={localizationKeys('configureSSO.configureStep.createApp.completeSamlIntegration.step2.bold')}
                suffix={localizationKeys('configureSSO.configureStep.createApp.completeSamlIntegration.step2.suffix')}
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

export const ConfigureAttributesSubStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <>
      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$5 })}>
          <Col sx={theme => ({ gap: theme.space.$1x5 })}>
            <Heading
              as='h3'
              textVariant='subtitle'
              localizationKey={localizationKeys(
                'configureSSO.configureStep.configureAttributes.attributeMapping.title',
              )}
            />
            <Table>
              <Thead>
                <Tr>
                  <Th>
                    <Text
                      localizationKey={localizationKeys(
                        'configureSSO.configureStep.configureAttributes.attributeMapping.columns.attribute',
                      )}
                    />
                  </Th>
                  <Th>
                    <Text
                      localizationKey={localizationKeys(
                        'configureSSO.configureStep.configureAttributes.attributeMapping.columns.claimName',
                      )}
                    />
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>
                    <Flex
                      align='center'
                      sx={theme => ({ gap: theme.space.$2 })}
                    >
                      <Text
                        as='span'
                        localizationKey={localizationKeys(
                          'configureSSO.configureStep.configureAttributes.attributeMapping.rows.email.attribute',
                        )}
                      />
                      <Badge
                        colorScheme='warning'
                        localizationKey={localizationKeys(
                          'configureSSO.configureStep.configureAttributes.attributeMapping.badges.required',
                        )}
                      />
                    </Flex>
                  </Td>
                  <Td>
                    <Text
                      as='span'
                      sx={theme => ({
                        fontFamily: 'monospace',
                        fontSize: theme.fontSizes.$sm,
                        backgroundColor: theme.colors.$neutralAlpha100,
                        borderRadius: theme.radii.$sm,
                        padding: `${theme.space.$0x25} ${theme.space.$1}`,
                      })}
                      localizationKey={localizationKeys(
                        'configureSSO.configureStep.configureAttributes.attributeMapping.rows.email.claim',
                      )}
                    />
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <Flex
                      align='center'
                      sx={theme => ({ gap: theme.space.$2 })}
                    >
                      <Text
                        as='span'
                        localizationKey={localizationKeys(
                          'configureSSO.configureStep.configureAttributes.attributeMapping.rows.firstName.attribute',
                        )}
                      />
                      <Badge
                        colorScheme='secondary'
                        localizationKey={localizationKeys(
                          'configureSSO.configureStep.configureAttributes.attributeMapping.badges.optional',
                        )}
                      />
                    </Flex>
                  </Td>
                  <Td>
                    <Text
                      as='span'
                      sx={theme => ({
                        fontFamily: 'monospace',
                        fontSize: theme.fontSizes.$sm,
                        backgroundColor: theme.colors.$neutralAlpha100,
                        borderRadius: theme.radii.$sm,
                        padding: `${theme.space.$0x25} ${theme.space.$1}`,
                      })}
                      localizationKey={localizationKeys(
                        'configureSSO.configureStep.configureAttributes.attributeMapping.rows.firstName.claim',
                      )}
                    />
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <Flex
                      align='center'
                      sx={theme => ({ gap: theme.space.$2 })}
                    >
                      <Text
                        as='span'
                        localizationKey={localizationKeys(
                          'configureSSO.configureStep.configureAttributes.attributeMapping.rows.lastName.attribute',
                        )}
                      />
                      <Badge
                        colorScheme='secondary'
                        localizationKey={localizationKeys(
                          'configureSSO.configureStep.configureAttributes.attributeMapping.badges.optional',
                        )}
                      />
                    </Flex>
                  </Td>
                  <Td>
                    <Text
                      as='span'
                      sx={theme => ({
                        fontFamily: 'monospace',
                        fontSize: theme.fontSizes.$sm,
                        backgroundColor: theme.colors.$neutralAlpha100,
                        borderRadius: theme.radii.$sm,
                        padding: `${theme.space.$0x25} ${theme.space.$1}`,
                      })}
                      localizationKey={localizationKeys(
                        'configureSSO.configureStep.configureAttributes.attributeMapping.rows.lastName.claim',
                      )}
                    />
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </Col>

          <Col sx={theme => ({ gap: theme.space.$1x5 })}>
            <Text
              as='p'
              variant='body'
              sx={theme => ({ color: theme.colors.$colorMutedForeground })}
              localizationKey={localizationKeys(
                'configureSSO.configureStep.configureAttributes.verifyMappings.paragraph',
              )}
            />
            <Col
              as='ol'
              sx={theme => ({
                gap: theme.space.$1x5,
                margin: 0,
                paddingInlineStart: theme.space.$4,
                listStyleType: 'decimal',
              })}
            >
              <InstructionStep
                prefix={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step1.prefix')}
                bold={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step1.bold')}
                suffix={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step1.suffix')}
              />
              <InstructionStepWithCode
                prefix={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step2.prefix')}
                bold={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step2.bold')}
                middle={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step2.middle')}
                code={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step2.code')}
                suffix={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step2.suffix')}
              />
              <InstructionStepWithCode
                prefix={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step3.prefix')}
                bold={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step3.bold')}
                middle={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step3.middle')}
                code={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step3.code')}
                suffix={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step3.suffix')}
              />
              <InstructionStep
                prefix={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step4.prefix')}
                bold={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step4.bold')}
                suffix={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step4.suffix')}
              />
              <InstructionStepWithCode
                prefix={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step5.prefix')}
                bold={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step5.bold')}
                middle={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step5.middle')}
                code={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step5.code')}
                suffix={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step5.suffix')}
              />
              <InstructionStepWithCode
                prefix={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step6.prefix')}
                bold={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step6.bold')}
                middle={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step6.middle')}
                code={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step6.code')}
                suffix={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step6.suffix')}
              />
              <InstructionStep
                prefix={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step7.prefix')}
                bold={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step7.bold')}
                suffix={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step7.suffix')}
              />
              <InstructionStepWithCode
                prefix={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step8.prefix')}
                bold={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step8.bold')}
                middle={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step8.middle')}
                code={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step8.code')}
                suffix={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step8.suffix')}
              />
              <InstructionStepWithCode
                prefix={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step9.prefix')}
                bold={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step9.bold')}
                middle={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step9.middle')}
                code={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step9.code')}
                suffix={localizationKeys('configureSSO.configureStep.configureAttributes.verifyMappings.step9.suffix')}
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

export const AssignUsersSubStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <>
      <Step.Body>
        <Step.Section fill>
          <Text>UI goes here</Text>
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

export const SubmitSamlConfigSubStep = (): JSX.Element => {
  const card = useCardState();
  const { goNext, goPrev, isFirstStep } = useWizard();
  const { enterpriseConnection, updateConnection } = useConfigureSSO();

  const metadataUrlField = useFormControl('idpMetadataUrl', '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.metadataUrl.label'),
    placeholder: localizationKeys('configureSSO.configureStep.metadataUrl.placeholder'),
    isRequired: true,
  });

  const trimmedMetadataUrl = metadataUrlField.value.trim();
  const canSubmit = trimmedMetadataUrl.length > 0 && !card.isLoading;

  const handleContinue = async () => {
    if (!enterpriseConnection || !canSubmit) {
      return;
    }

    card.setError(undefined);
    card.setLoading();

    try {
      await updateConnection({ saml: { idpMetadataUrl: trimmedMetadataUrl } });
      void goNext();
    } catch (err) {
      handleError(err as Error, [metadataUrlField], card.setError);
    } finally {
      card.setIdle();
    }
  };

  return (
    <>
      <Step.Body>
        <Step.Section
          fill
          sx={theme => ({ gap: theme.space.$5 })}
        >
          <Text
            as='p'
            variant='body'
            sx={theme => ({ color: theme.colors.$colorMutedForeground })}
            localizationKey={localizationKeys('configureSSO.configureStep.metadataUrl.description')}
          />
          <Form.ControlRow elementId={metadataUrlField.id}>
            <Form.PlainInput {...metadataUrlField.props} />
          </Form.ControlRow>
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

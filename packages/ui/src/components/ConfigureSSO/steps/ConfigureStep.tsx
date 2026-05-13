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
  useLocalizations,
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
            title={localizationKeys('configureSSO.configureStep.samlOkta.title')}
            description={localizationKeys('configureSSO.configureStep.samlOkta.subtitle')}
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

const RICH_TEXT_PATTERN = /<(strong|code)>(.*?)<\/\1>/g;

type RichTextSegment =
  | { type: 'text'; value: string }
  | { type: 'strong'; value: string }
  | { type: 'code'; value: string };

const parseRichText = (input: string): RichTextSegment[] => {
  const segments: RichTextSegment[] = [];
  let lastIndex = 0;
  RICH_TEXT_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = RICH_TEXT_PATTERN.exec(input)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: input.slice(lastIndex, match.index) });
    }
    segments.push({ type: match[1] as 'strong' | 'code', value: match[2] });
    lastIndex = RICH_TEXT_PATTERN.lastIndex;
  }
  if (lastIndex < input.length) {
    segments.push({ type: 'text', value: input.slice(lastIndex) });
  }
  return segments;
};

const RichText = ({ localizationKey }: { localizationKey: LocalizationKey }): JSX.Element => {
  const { t } = useLocalizations();
  const text = t(localizationKey);
  if (!text) {
    return <></>;
  }
  return (
    <>
      {parseRichText(text).map((segment, index) => {
        if (segment.type === 'strong') {
          return (
            <Text
              key={index}
              as='span'
              colorScheme='inherit'
              sx={theme => ({ fontWeight: theme.fontWeights.$medium })}
            >
              {segment.value}
            </Text>
          );
        }
        if (segment.type === 'code') {
          return (
            <Text
              key={index}
              as='span'
              colorScheme='inherit'
              sx={{ fontFamily: 'monospace' }}
            >
              {segment.value}
            </Text>
          );
        }
        return segment.value;
      })}
    </>
  );
};

const ATTRIBUTE_ROWS = [
  {
    id: 'email',
    isRequired: true,
    attribute: localizationKeys('configureSSO.configureStep.attributeMapping.rows.email.attribute'),
    claim: localizationKeys('configureSSO.configureStep.attributeMapping.rows.email.claim'),
  },
  {
    id: 'firstName',
    isRequired: false,
    attribute: localizationKeys('configureSSO.configureStep.attributeMapping.rows.firstName.attribute'),
    claim: localizationKeys('configureSSO.configureStep.attributeMapping.rows.firstName.claim'),
  },
  {
    id: 'lastName',
    isRequired: false,
    attribute: localizationKeys('configureSSO.configureStep.attributeMapping.rows.lastName.attribute'),
    claim: localizationKeys('configureSSO.configureStep.attributeMapping.rows.lastName.claim'),
  },
] as const;

const ATTRIBUTE_PAIRS = [
  {
    id: 'email',
    value: localizationKeys('configureSSO.configureStep.samlOkta.configureAttributes.pairs.email'),
  },
  {
    id: 'firstName',
    value: localizationKeys('configureSSO.configureStep.samlOkta.configureAttributes.pairs.firstName'),
  },
  {
    id: 'lastName',
    value: localizationKeys('configureSSO.configureStep.samlOkta.configureAttributes.pairs.lastName'),
  },
] as const;

export const CreateAppSubStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  const { enterpriseConnection } = useConfigureSSO();

  const acsUrl = enterpriseConnection?.samlConnection?.acsUrl ?? '';
  const spEntityId = enterpriseConnection?.samlConnection?.spEntityId ?? '';

  const acsUrlField = useFormControl('acsUrl', acsUrl, {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.spFields.acsUrl.label'),
    isRequired: false,
  });
  const spEntityIdField = useFormControl('acsUrl', spEntityId, {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.spFields.spEntityId.label'),
    isRequired: false,
  });

  return (
    <>
      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$5 })}>
          <Col sx={theme => ({ gap: theme.space.$3 })}>
            <Heading
              as='h3'
              textVariant='subtitle'
              localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.createApp.title')}
            />
            <Col
              as='ul'
              sx={theme => ({
                gap: theme.space.$1x5,
                margin: 0,
                paddingInlineStart: theme.space.$5,
                listStyleType: 'disc',
              })}
            >
              <Text
                as='li'
                colorScheme='secondary'
              >
                <RichText localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.createApp.step1')} />
              </Text>
              <Text
                as='li'
                colorScheme='secondary'
              >
                <RichText localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.createApp.step2')} />
              </Text>
              <Text
                as='li'
                colorScheme='secondary'
              >
                <RichText localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.createApp.step3')} />
              </Text>
              <Text
                as='li'
                colorScheme='secondary'
              >
                <RichText localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.createApp.step4')} />
              </Text>
              <Text
                as='li'
                colorScheme='secondary'
              >
                <RichText localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.createApp.step5')} />
              </Text>
            </Col>
          </Col>

          <Col sx={theme => ({ gap: theme.space.$3 })}>
            <Heading
              as='h3'
              textVariant='subtitle'
              localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.serviceProvider.title')}
            />
            <Text
              as='p'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.serviceProvider.paragraph1')}
            />
            <Text
              as='p'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.serviceProvider.paragraph2')}
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

          <Col sx={theme => ({ gap: theme.space.$3 })}>
            <Heading
              as='h3'
              textVariant='subtitle'
              localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.completeSamlIntegration.title')}
            />
            <Col
              as='ul'
              sx={theme => ({
                gap: theme.space.$1x5,
                margin: 0,
                paddingInlineStart: theme.space.$5,
                listStyleType: 'disc',
              })}
            >
              <Text
                as='li'
                colorScheme='secondary'
              >
                <RichText
                  localizationKey={localizationKeys(
                    'configureSSO.configureStep.samlOkta.completeSamlIntegration.step1',
                  )}
                />
              </Text>
              <Text
                as='li'
                colorScheme='secondary'
              >
                <RichText
                  localizationKey={localizationKeys(
                    'configureSSO.configureStep.samlOkta.completeSamlIntegration.step2',
                  )}
                />
              </Text>
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
          <Col sx={theme => ({ gap: theme.space.$3 })}>
            <Heading
              as='h3'
              textVariant='subtitle'
              localizationKey={localizationKeys('configureSSO.configureStep.attributeMapping.title')}
            />

            <Table
              sx={theme => ({
                'tr > th:first-of-type': {
                  paddingInlineStart: theme.space.$4,
                },
              })}
            >
              <Thead>
                <Tr>
                  <Th>
                    <Text
                      sx={theme => ({ fontSize: theme.fontSizes.$xs })}
                      localizationKey={localizationKeys(
                        'configureSSO.configureStep.attributeMapping.columns.attribute',
                      )}
                    />
                  </Th>

                  <Th>
                    <Text
                      sx={theme => ({ fontSize: theme.fontSizes.$xs })}
                      localizationKey={localizationKeys(
                        'configureSSO.configureStep.attributeMapping.columns.claimName',
                      )}
                    />
                  </Th>
                </Tr>
              </Thead>

              <Tbody>
                {ATTRIBUTE_ROWS.map(row => (
                  <Tr key={row.id}>
                    <Td>
                      <Flex
                        as='span'
                        align='center'
                        sx={theme => ({ gap: theme.space.$2 })}
                      >
                        <Text
                          colorScheme='secondary'
                          localizationKey={row.attribute}
                        />

                        <Badge
                          colorScheme={row.isRequired ? 'warning' : undefined}
                          localizationKey={localizationKeys(
                            row.isRequired
                              ? 'configureSSO.configureStep.attributeMapping.badges.required'
                              : 'configureSSO.configureStep.attributeMapping.badges.optional',
                          )}
                        />
                      </Flex>
                    </Td>

                    <Td>
                      <Text
                        as='span'
                        sx={{ fontFamily: 'monospace' }}
                        localizationKey={row.claim}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Col>

          <Col sx={theme => ({ gap: theme.space.$3 })}>
            <Text
              as='p'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.configureStep.attributeMapping.paragraph')}
            />

            <Col
              as='ol'
              sx={theme => ({
                gap: theme.space.$1x5,
                margin: 0,
                paddingInlineStart: theme.space.$5,
                listStyleType: 'decimal',
              })}
            >
              <Text
                as='li'
                colorScheme='secondary'
              >
                <RichText
                  localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.configureAttributes.step1')}
                />
              </Text>
              <Text
                as='li'
                colorScheme='secondary'
              >
                <RichText
                  localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.configureAttributes.step2')}
                />
                <Col
                  as='ul'
                  sx={theme => ({
                    gap: theme.space.$1x5,
                    margin: 0,
                    marginTop: theme.space.$1x5,
                    paddingInlineStart: theme.space.$5,
                    listStyleType: '"- "',
                  })}
                >
                  {ATTRIBUTE_PAIRS.map(pair => (
                    <Text
                      key={pair.id}
                      as='li'
                      colorScheme='secondary'
                    >
                      <RichText localizationKey={pair.value} />
                    </Text>
                  ))}
                </Col>
              </Text>
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
    label: localizationKeys('configureSSO.configureStep.samlOkta.metadataUrl.label'),
    placeholder: localizationKeys('configureSSO.configureStep.samlOkta.metadataUrl.placeholder'),
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
            colorScheme='secondary'
            localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.metadataUrl.description')}
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

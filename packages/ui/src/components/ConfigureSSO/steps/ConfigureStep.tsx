import { __internal_useUserEnterpriseConnections, useReverification } from '@clerk/shared/react';
import type { UpdateMeEnterpriseConnectionParams } from '@clerk/shared/types';
import React from 'react';

import {
  Badge,
  Col,
  descriptors,
  Flex,
  Flow,
  Heading,
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
import { SegmentedControl } from '@/elements/SegmentedControl';
import { Check, ClipboardOutline } from '@/icons';
import { useFormControl } from '@/ui/utils/useFormControl';
import { handleError } from '@/utils/errorHandler';

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
    name: localizationKeys('configureSSO.configureStep.samlOkta.configureAttributes.pairs.email.name'),
    expression: localizationKeys('configureSSO.configureStep.samlOkta.configureAttributes.pairs.email.expression'),
  },
  {
    id: 'firstName',
    name: localizationKeys('configureSSO.configureStep.samlOkta.configureAttributes.pairs.firstName.name'),
    expression: localizationKeys('configureSSO.configureStep.samlOkta.configureAttributes.pairs.firstName.expression'),
  },
  {
    id: 'lastName',
    name: localizationKeys('configureSSO.configureStep.samlOkta.configureAttributes.pairs.lastName.name'),
    expression: localizationKeys('configureSSO.configureStep.samlOkta.configureAttributes.pairs.lastName.expression'),
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
  const spEntityIdField = useFormControl('spEntityId', spEntityId, {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.spFields.spEntityId.label'),
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
                localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.createApp.step1')}
              />
              <Text
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.createApp.step2')}
              />
              <Text
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.createApp.step3')}
              />
              <Text
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.createApp.step4')}
              />
              <Text
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.createApp.step5')}
              />
            </Col>
          </Col>

          <Col sx={theme => ({ gap: theme.space.$1x5 })}>
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

          <Form.ControlRow elementId={spEntityIdField.id}>
            <Form.CommonInputWrapper {...spEntityIdField.props}>
              <ClipboardInput
                value={spEntityId}
                readOnly
                copyIcon={ClipboardOutline}
                copiedIcon={Check}
              />
            </Form.CommonInputWrapper>
          </Form.ControlRow>

          <Col sx={theme => ({ gap: theme.space.$1x5 })}>
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
                localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.completeSamlIntegration.step1')}
              />
              <Text
                as='li'
                colorScheme='secondary'
                localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.completeSamlIntegration.step2')}
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
        <Step.Section sx={theme => ({ gap: theme.space.$3 })}>
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
                    localizationKey={localizationKeys('configureSSO.configureStep.attributeMapping.columns.attribute')}
                  />
                </Th>

                <Th>
                  <Text
                    sx={theme => ({ fontSize: theme.fontSizes.$xs })}
                    localizationKey={localizationKeys('configureSSO.configureStep.attributeMapping.columns.claimName')}
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
                        colorScheme={row.isRequired ? 'warning' : 'primary'}
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
              localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.configureAttributes.step1')}
            />
            <Text
              as='li'
              colorScheme='secondary'
            >
              <Text
                as='span'
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
                  >
                    <Badge
                      localizationKey={pair.name}
                      sx={{ fontFamily: 'monospace' }}
                    />

                    <Text
                      as='span'
                      localizationKey={localizationKeys(
                        'configureSSO.configureStep.samlOkta.configureAttributes.pairs.conjunction',
                      )}
                    />

                    <Badge
                      localizationKey={pair.expression}
                      sx={{ fontFamily: 'monospace' }}
                    />
                  </Text>
                ))}
              </Col>
            </Text>
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
        <Step.Section sx={theme => ({ gap: theme.space.$3 })}>
          <Heading
            as='h3'
            textVariant='subtitle'
            localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.assignUsers.title')}
          />
          <Text
            as='p'
            colorScheme='secondary'
            localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.assignUsers.paragraph')}
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
              localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.assignUsers.step1')}
            />
            <Text
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.assignUsers.step2')}
            />
            <Text
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.assignUsers.step3')}
            />
            <Text
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.assignUsers.step4')}
            />
            <Text
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.assignUsers.step5')}
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

export const SubmitSamlConfigSubStep = (): JSX.Element => {
  const card = useCardState();
  const { t } = useLocalizations();
  const { goNext, goPrev, isFirstStep } = useWizard();
  const { enterpriseConnection } = useConfigureSSO();
  const { updateEnterpriseConnection } = __internal_useUserEnterpriseConnections();

  const [mode, setMode] = React.useState<'metadataUrl' | 'manual'>('metadataUrl');

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

  const metadataUrlField = useFormControl('idpMetadataUrl', '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.samlOkta.metadataUrl.label'),
    placeholder: localizationKeys('configureSSO.configureStep.samlOkta.metadataUrl.placeholder'),
    isRequired: true,
  });

  const trimmedMetadataUrl = metadataUrlField.value.trim();
  const canSubmit = mode === 'metadataUrl' && trimmedMetadataUrl.length > 0 && !card.isLoading;

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
          <Heading
            as='h3'
            textVariant='subtitle'
            localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.submitSamlConfig.title')}
          />
          <SegmentedControl.Root
            aria-label={t(localizationKeys('configureSSO.configureStep.samlOkta.modes.ariaLabel'))}
            value={mode}
            onChange={value => setMode(value as 'metadataUrl' | 'manual')}
            fullWidth
          >
            <SegmentedControl.Button
              value='metadataUrl'
              text={localizationKeys('configureSSO.configureStep.samlOkta.modes.metadataUrl')}
            />
            <SegmentedControl.Button
              value='manual'
              text={localizationKeys('configureSSO.configureStep.samlOkta.modes.manual')}
            />
          </SegmentedControl.Root>

          {mode === 'metadataUrl' && (
            <>
              <Text
                as='p'
                colorScheme='secondary'
                localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.metadataUrl.description')}
              />
              <Form.ControlRow elementId={metadataUrlField.id}>
                <Form.PlainInput {...metadataUrlField.props} />
              </Form.ControlRow>
            </>
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

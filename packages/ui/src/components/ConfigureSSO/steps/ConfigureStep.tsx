import { isClerkAPIResponseError } from '@clerk/shared/error';
import { useReverification } from '@clerk/shared/react';
import type { FieldId, UpdateMeEnterpriseConnectionParams } from '@clerk/shared/types';
import React, { type JSX } from 'react';

import {
  Badge,
  Box,
  Button,
  Col,
  descriptors,
  Flex,
  Flow,
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
import { Field } from '@/elements/FieldControl';
import { Form } from '@/elements/Form';
import { SegmentedControl } from '@/elements/SegmentedControl';
import { Checkmark, Clipboard, Close, ArrowUpTray } from '@/icons';
import type { FormControlState } from '@/ui/utils/useFormControl';
import { useFormControl } from '@/ui/utils/useFormControl';
import { handleError } from '@/utils/errorHandler';

import { useConfigureSSO } from '../ConfigureSSOContext';
import { Step } from '../elements/Step';
import { useWizard, Wizard } from '../elements/Wizard';
import type { ProviderType } from '../types';
import { useConfigureStepTranslations } from './configureStepTranslations';

export const ConfigureStep = (): JSX.Element => {
  const { key } = useConfigureStepTranslations();

  return (
    <Flow.Part part='configureCreateApp'>
      <Step
        elementDescriptor={descriptors.configureSSOStep}
        elementId={descriptors.configureSSOStep.setId('configure')}
      >
        <Wizard>
          <Wizard.Step id='create-app'>
            <Step.Header
              title={localizationKeys(key('headerTitle'))}
              description={localizationKeys(key('createApp.headerSubtitle'))}
            >
              <InnerStepCounter />
            </Step.Header>

            <CreateAppSubStep />
          </Wizard.Step>

          <Wizard.Step id='configure-attributes'>
            <Step.Header
              title={localizationKeys(key('headerTitle'))}
              description={localizationKeys(key('configureAttributes.headerSubtitle'))}
            >
              <InnerStepCounter />
            </Step.Header>

            <ConfigureAttributesSubStep />
          </Wizard.Step>

          <Wizard.Step id='assign-users'>
            <Step.Header
              title={localizationKeys(key('headerTitle'))}
              description={localizationKeys(key('assignUsers.headerSubtitle'))}
            >
              <InnerStepCounter />
            </Step.Header>

            <AssignUsersSubStep />
          </Wizard.Step>

          <Wizard.Step id='submit-saml-config'>
            <Step.Header
              title={localizationKeys(key('headerTitle'))}
              description={localizationKeys(key('metadataUrl.headerSubtitle'))}
            >
              <InnerStepCounter />
            </Step.Header>

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

/**
 * Per-provider attribute mapping table descriptor
 */
type AttributeMappingTableConfig = {
  columns: { first: LocalizationKey; second: LocalizationKey };
  monoFirst?: boolean;
  rows: ReadonlyArray<{
    id: string;
    isRequired: boolean;
    first: LocalizationKey;
    second: LocalizationKey;
  }>;
};

const SAML_OKTA_ATTRIBUTE_MAPPING: AttributeMappingTableConfig = {
  columns: {
    first: localizationKeys('configureSSO.configureStep.samlOkta.attributeMapping.columns.name'),
    second: localizationKeys('configureSSO.configureStep.samlOkta.attributeMapping.columns.value'),
  },
  monoFirst: true,
  rows: [
    {
      id: 'email',
      isRequired: true,
      first: localizationKeys('configureSSO.configureStep.samlOkta.attributeMapping.rows.email.name'),
      second: localizationKeys('configureSSO.configureStep.samlOkta.attributeMapping.rows.email.value'),
    },
    {
      id: 'firstName',
      isRequired: false,
      first: localizationKeys('configureSSO.configureStep.samlOkta.attributeMapping.rows.firstName.name'),
      second: localizationKeys('configureSSO.configureStep.samlOkta.attributeMapping.rows.firstName.value'),
    },
    {
      id: 'lastName',
      isRequired: false,
      first: localizationKeys('configureSSO.configureStep.samlOkta.attributeMapping.rows.lastName.name'),
      second: localizationKeys('configureSSO.configureStep.samlOkta.attributeMapping.rows.lastName.value'),
    },
  ],
};

const SAML_CUSTOM_ATTRIBUTE_MAPPING: AttributeMappingTableConfig = {
  columns: {
    first: localizationKeys('configureSSO.configureStep.samlCustom.attributeMapping.columns.userProfile'),
    second: localizationKeys('configureSSO.configureStep.samlCustom.attributeMapping.columns.attributeName'),
  },
  rows: [
    {
      id: 'id',
      isRequired: true,
      first: localizationKeys('configureSSO.configureStep.samlCustom.attributeMapping.rows.id.userProfile'),
      second: localizationKeys('configureSSO.configureStep.samlCustom.attributeMapping.rows.id.attributeName'),
    },
    {
      id: 'email',
      isRequired: true,
      first: localizationKeys('configureSSO.configureStep.samlCustom.attributeMapping.rows.email.userProfile'),
      second: localizationKeys('configureSSO.configureStep.samlCustom.attributeMapping.rows.email.attributeName'),
    },
    {
      id: 'firstName',
      isRequired: false,
      first: localizationKeys('configureSSO.configureStep.samlCustom.attributeMapping.rows.firstName.userProfile'),
      second: localizationKeys('configureSSO.configureStep.samlCustom.attributeMapping.rows.firstName.attributeName'),
    },
    {
      id: 'lastName',
      isRequired: false,
      first: localizationKeys('configureSSO.configureStep.samlCustom.attributeMapping.rows.lastName.userProfile'),
      second: localizationKeys('configureSSO.configureStep.samlCustom.attributeMapping.rows.lastName.attributeName'),
    },
  ],
};

const ATTRIBUTE_MAPPING_BY_PROVIDER: Partial<Record<ProviderType, AttributeMappingTableConfig>> = {
  saml_okta: SAML_OKTA_ATTRIBUTE_MAPPING,
  saml_custom: SAML_CUSTOM_ATTRIBUTE_MAPPING,
};

export const CreateAppSubStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  const { enterpriseConnection, provider } = useConfigureSSO();
  const { key } = useConfigureStepTranslations();

  const acsUrl = enterpriseConnection?.samlConnection?.acsUrl ?? '';
  const spEntityId = enterpriseConnection?.samlConnection?.spEntityId ?? '';

  const acsUrlField = useFormControl('acsUrl', acsUrl, {
    type: 'text',
    label: localizationKeys(key('spFields.acsUrl.label')),
    isRequired: false,
  });
  const spEntityIdField = useFormControl('spEntityId', spEntityId, {
    type: 'text',
    label: localizationKeys(key('spFields.spEntityId.label')),
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
              localizationKey={localizationKeys(key('createApp.title'))}
            />

            {provider === 'saml_okta' && <OktaCreateAppStepContent />}

            {provider === 'saml_custom' && (
              <Text
                as='p'
                colorScheme='secondary'
                localizationKey={localizationKeys('configureSSO.configureStep.samlCustom.createApp.subtitle')}
              />
            )}
          </Col>

          {provider === 'saml_okta' && <OktaServiceProviderStepContent />}

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

          {provider === 'saml_okta' && <OktaCompleteSamlIntegrationStepContent />}
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

// TODO - Move IdP specific content to separate modules
const OktaServiceProviderStepContent = (): JSX.Element => {
  return (
    <Col sx={theme => ({ gap: theme.space.$1x5 })}>
      <Heading
        elementDescriptor={descriptors.configureSSOInstructionsHeading}
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
  );
};

const OktaCreateAppStepContent = (): JSX.Element => {
  return (
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
        localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.createApp.step1')}
      />
      <Text
        elementDescriptor={descriptors.configureSSOInstructionsListItem}
        as='li'
        colorScheme='secondary'
        localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.createApp.step2')}
      />
      <Text
        elementDescriptor={descriptors.configureSSOInstructionsListItem}
        as='li'
        colorScheme='secondary'
        localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.createApp.step3')}
      />
      <Text
        elementDescriptor={descriptors.configureSSOInstructionsListItem}
        as='li'
        colorScheme='secondary'
        localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.createApp.step4')}
      />
      <Text
        elementDescriptor={descriptors.configureSSOInstructionsListItem}
        as='li'
        colorScheme='secondary'
        localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.createApp.step5')}
      />
    </Col>
  );
};

const OktaCompleteSamlIntegrationStepContent = (): JSX.Element => {
  return (
    <Col sx={theme => ({ gap: theme.space.$1x5 })}>
      <Heading
        elementDescriptor={descriptors.configureSSOInstructionsHeading}
        as='h3'
        textVariant='subtitle'
        localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.completeSamlIntegration.title')}
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
          localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.completeSamlIntegration.step1')}
        />
        <Text
          elementDescriptor={descriptors.configureSSOInstructionsListItem}
          as='li'
          colorScheme='secondary'
          localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.completeSamlIntegration.step2')}
        />
      </Col>
    </Col>
  );
};

export const ConfigureAttributesSubStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  const { provider } = useConfigureSSO();
  const mappingConfig = provider ? ATTRIBUTE_MAPPING_BY_PROVIDER[provider] : undefined;

  return (
    <>
      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$3 })}>
          {provider === 'saml_custom' && (
            <Heading
              elementDescriptor={descriptors.configureSSOInstructionsHeading}
              as='h3'
              textVariant='subtitle'
              localizationKey={localizationKeys('configureSSO.configureStep.samlCustom.configureAttributes.title')}
            />
          )}

          {provider === 'saml_okta' && <OktaConfigureAttributesStepContent />}

          {mappingConfig && <AttributeMappingTable config={mappingConfig} />}
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

const OktaConfigureAttributesStepContent = (): JSX.Element => (
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
      localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.configureAttributes.step1')}
    />
    {/*
     * The actual name/expression pairs that step 2 refers to are rendered
     * by the `AttributeMappingTable` immediately below this component —
     * keeping them in a single tabular surface instead of an inline badge
     * list matches the design (see Okta screenshot: "Create the following
     * attribute mapping statements:" + table).
     */}
    <Text
      elementDescriptor={descriptors.configureSSOInstructionsListItem}
      as='li'
      colorScheme='secondary'
      localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.configureAttributes.step2')}
    />
  </Col>
);

const AttributeMappingTable = ({ config }: { config: AttributeMappingTableConfig }): JSX.Element => (
  <Table
    elementDescriptor={descriptors.configureSSOAttributeMappingTable}
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
            localizationKey={config.columns.first}
          />
        </Th>
        <Th>
          <Text
            sx={theme => ({ fontSize: theme.fontSizes.$xs })}
            localizationKey={config.columns.second}
          />
        </Th>
      </Tr>
    </Thead>

    <Tbody>
      {config.rows.map(row => (
        <Tr key={row.id}>
          <Td>
            <Flex
              as='span'
              align='center'
              sx={theme => ({ gap: theme.space.$2 })}
            >
              <Text
                as='span'
                colorScheme={config.monoFirst ? undefined : 'secondary'}
                sx={config.monoFirst ? { fontFamily: 'monospace' } : undefined}
                localizationKey={row.first}
              />
              <Badge
                elementDescriptor={descriptors.configureSSOAttributeMappingBadge}
                elementId={descriptors.configureSSOAttributeMappingBadge.setId(
                  row.isRequired ? 'required' : 'optional',
                )}
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
              localizationKey={row.second}
            />
          </Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
);

export const AssignUsersSubStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  const { provider } = useConfigureSSO();

  if (provider === 'saml_custom') {
    return (
      <>
        <Step.Body>
          <Step.Section sx={theme => ({ gap: theme.space.$3 })}>
            <Heading
              elementDescriptor={descriptors.configureSSOInstructionsHeading}
              as='h3'
              textVariant='subtitle'
              localizationKey={localizationKeys('configureSSO.configureStep.samlCustom.assignUsers.title')}
            />
            <Text
              as='p'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.configureStep.samlCustom.assignUsers.paragraph')}
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
  }

  return (
    <>
      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$3 })}>
          <Heading
            elementDescriptor={descriptors.configureSSOInstructionsHeading}
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
              localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.assignUsers.step1')}
            />
            <Text
              elementDescriptor={descriptors.configureSSOInstructionsListItem}
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.assignUsers.step2')}
            />
            <Text
              elementDescriptor={descriptors.configureSSOInstructionsListItem}
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.assignUsers.step3')}
            />
            <Text
              elementDescriptor={descriptors.configureSSOInstructionsListItem}
              as='li'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.configureStep.samlOkta.assignUsers.step4')}
            />
            <Text
              elementDescriptor={descriptors.configureSSOInstructionsListItem}
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
  const { enterpriseConnection, updateEnterpriseConnection } = useConfigureSSO();
  const { key } = useConfigureStepTranslations();

  const samlConnection = enterpriseConnection?.samlConnection;
  const hasExistingConfig = Boolean(
    samlConnection?.idpSsoUrl ||
    samlConnection?.idpEntityId ||
    samlConnection?.idpCertificate ||
    samlConnection?.idpMetadataUrl,
  );
  const existingCertPresent = Boolean(samlConnection?.idpCertificate);

  const [mode, setMode] = React.useState<'metadataUrl' | 'manual'>(hasExistingConfig ? 'manual' : 'metadataUrl');
  const [certFile, setCertFile] = React.useState<File | null>(null);

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

  const metadataUrlField = useFormControl('idpMetadataUrl', samlConnection?.idpMetadataUrl ?? '', {
    type: 'text',
    label: localizationKeys(key('metadataUrl.label')),
    placeholder: localizationKeys(key('metadataUrl.placeholder')),
    isRequired: true,
  });

  const signOnUrlField = useFormControl('idpSsoUrl', samlConnection?.idpSsoUrl ?? '', {
    type: 'text',
    label: localizationKeys(key('manual.signOnUrl.label')),
    placeholder: localizationKeys(key('manual.signOnUrl.placeholder')),
    isRequired: true,
  });

  const issuerField = useFormControl('idpEntityId', samlConnection?.idpEntityId ?? '', {
    type: 'text',
    label: localizationKeys(key('manual.issuer.label')),
    placeholder: localizationKeys(key('manual.issuer.placeholder')),
    isRequired: true,
  });

  const certFileField = useFormControl('idpCertificate', '', {
    type: 'text',
    label: localizationKeys(key('manual.signingCertificate.label')),
    isRequired: true,
  });

  const trimmedMetadataUrl = metadataUrlField.value.trim();
  const trimmedSignOnUrl = signOnUrlField.value.trim();
  const trimmedIssuer = issuerField.value.trim();

  const hasCert = certFile !== null || existingCertPresent;
  const canSubmit =
    !card.isLoading &&
    ((mode === 'metadataUrl' && trimmedMetadataUrl.length > 0) ||
      (mode === 'manual' && trimmedSignOnUrl.length > 0 && trimmedIssuer.length > 0 && hasCert));

  const handleContinue = async () => {
    if (!enterpriseConnection || !canSubmit) {
      return;
    }

    card.setError(undefined);
    card.setLoading();

    try {
      if (mode === 'metadataUrl') {
        await updateConnection({ saml: { idpMetadataUrl: trimmedMetadataUrl } });
      } else {
        const samlPayload: NonNullable<UpdateMeEnterpriseConnectionParams['saml']> = {
          idpSsoUrl: trimmedSignOnUrl,
          idpEntityId: trimmedIssuer,
        };

        if (certFile !== null) {
          samlPayload.idpCertificate = await certFile.text();
        }

        await updateConnection({ saml: samlPayload });
      }

      void goNext();
    } catch (err) {
      const fields = mode === 'metadataUrl' ? [metadataUrlField] : [signOnUrlField, issuerField, certFileField];

      handleError(err as Error, fields, card.setError);

      if (isClerkAPIResponseError(err)) {
        const unscopedSamlError = err.errors.find(e => e.code?.startsWith('saml_') && !e.meta?.paramName);

        if (unscopedSamlError) {
          const primaryField = mode === 'metadataUrl' ? metadataUrlField : signOnUrlField;
          primaryField.setError(unscopedSamlError);
          card.setError(undefined);
        }
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
            localizationKey={localizationKeys(key('submitSamlConfig.title'))}
          />
          <SegmentedControl.Root
            aria-label={t(localizationKeys(key('modes.ariaLabel')))}
            value={mode}
            onChange={value => {
              card.setError(undefined);
              setMode(value as 'metadataUrl' | 'manual');
            }}
            fullWidth
          >
            <SegmentedControl.Button
              value='metadataUrl'
              text={localizationKeys(key('modes.metadataUrl'))}
            />
            <SegmentedControl.Button
              value='manual'
              text={localizationKeys(key('modes.manual'))}
            />
          </SegmentedControl.Root>

          {mode === 'metadataUrl' ? (
            <MetadataUrlPanel field={metadataUrlField} />
          ) : (
            <ManualEntryPanel
              signOnUrlField={signOnUrlField}
              issuerField={issuerField}
              certFileField={certFileField}
              certFile={certFile}
              setCertFile={setCertFile}
              existingCertPresent={existingCertPresent}
            />
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

type FormControl = FormControlState<FieldId>;

type MetadataUrlPanelProps = {
  field: FormControl;
};

type ManualEntryPanelProps = {
  signOnUrlField: FormControl;
  issuerField: FormControl;
  certFileField: FormControl;
  certFile: File | null;
  setCertFile: React.Dispatch<React.SetStateAction<File | null>>;
  existingCertPresent: boolean;
};

const MetadataUrlPanel = ({ field }: MetadataUrlPanelProps): JSX.Element => {
  const { key } = useConfigureStepTranslations();

  return (
    <>
      <Text
        as='p'
        colorScheme='secondary'
        localizationKey={localizationKeys(key('metadataUrl.description'))}
      />
      <Form.ControlRow elementId={field.id}>
        <Form.PlainInput {...field.props} />
      </Form.ControlRow>
    </>
  );
};

const ManualEntryPanel = ({
  signOnUrlField,
  issuerField,
  certFileField,
  certFile,
  setCertFile,
  existingCertPresent,
}: ManualEntryPanelProps): JSX.Element => {
  const { t } = useLocalizations();
  const certInputRef = React.useRef<HTMLInputElement>(null);
  const { key } = useConfigureStepTranslations();

  return (
    <>
      <Text
        as='p'
        colorScheme='secondary'
        localizationKey={localizationKeys(key('manual.description'))}
      />

      <Form.ControlRow elementId={signOnUrlField.id}>
        <Form.PlainInput {...signOnUrlField.props} />
      </Form.ControlRow>

      <Form.ControlRow elementId={issuerField.id}>
        <Form.PlainInput {...issuerField.props} />
      </Form.ControlRow>

      <Box>
        <Field.Root {...certFileField.props}>
          <Col gap={2}>
            <Field.LabelRow>
              <Field.Label />
            </Field.LabelRow>

            <input
              ref={certInputRef}
              type='file'
              accept='.pem,.key,.crt,.cer,.cert'
              multiple={false}
              style={{ display: 'none' }}
              onChange={e => {
                setCertFile(e.target.files?.[0] ?? null);
                certFileField.clearFeedback();
              }}
            />

            {certFile === null ? (
              <Flex
                align='center'
                gap={2}
                sx={{ alignSelf: 'flex-start', flexWrap: 'wrap' }}
              >
                {existingCertPresent && (
                  <Badge
                    elementDescriptor={descriptors.configureSSOCertificateFileBadge}
                    localizationKey={localizationKeys(
                      'configureSSO.configureStep.samlOkta.manual.signingCertificate.fileUploaded',
                    )}
                  />
                )}
                <Button
                  elementDescriptor={descriptors.configureSSOCertificateUploadButton}
                  size='xs'
                  variant='outline'
                  onClick={() => certInputRef.current?.click()}
                >
                  <Icon
                    icon={ArrowUpTray}
                    size='sm'
                    colorScheme='neutral'
                    sx={t => ({ marginInlineEnd: t.space.$1 })}
                  />

                  <Text
                    as='span'
                    localizationKey={localizationKeys(
                      existingCertPresent
                        ? 'configureSSO.configureStep.samlOkta.manual.signingCertificate.replaceFile'
                        : 'configureSSO.configureStep.samlOkta.manual.signingCertificate.uploadFile',
                    )}
                  />
                </Button>
              </Flex>
            ) : (
              <Flex
                align='center'
                gap={2}
                sx={theme => ({ paddingTop: theme.space.$1, paddingBottom: theme.space.$1 })}
              >
                <Text
                  elementDescriptor={descriptors.configureSSOCertificateFileName}
                  as='span'
                  colorScheme='secondary'
                  variant='buttonSmall'
                >
                  {certFile.name}
                </Text>

                <Button
                  elementDescriptor={descriptors.configureSSOCertificateRemoveButton}
                  variant='ghost'
                  colorScheme='neutral'
                  aria-label={t(
                    localizationKeys('configureSSO.configureStep.samlOkta.manual.signingCertificate.removeFile'),
                  )}
                  onClick={() => {
                    setCertFile(null);
                    certFileField.clearFeedback();
                    if (certInputRef.current) {
                      certInputRef.current.value = '';
                    }
                  }}
                  sx={t => ({ padding: t.space.$1 })}
                >
                  <Icon
                    icon={Close}
                    size='xs'
                  />
                </Button>
              </Flex>
            )}
          </Col>
          <Field.Feedback />
        </Field.Root>
      </Box>
    </>
  );
};

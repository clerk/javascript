import React, { type JSX } from 'react';

import {
  Badge,
  Box,
  Button,
  Col,
  descriptors,
  Flex,
  Icon,
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
import { Field } from '@/elements/FieldControl';
import { Form } from '@/elements/Form';
import { Checkmark, Clipboard, Close } from '@/icons';
import { useFormControl } from '@/ui/utils/useFormControl';
import { handleError } from '@/utils/errorHandler';

import { useConfigureSSO } from '../../../ConfigureSSOContext';
import { Step } from '../../../elements/Step';
import { useWizard, Wizard, type WizardStepConfig } from '../../../elements/Wizard';
import { InnerStepCounter } from '../../../elements/Wizard/InnerStepCounter';
import { ActiveConnectionAlert } from '../saml/shared/ActiveConnectionAlert';
import {
  IdentityProviderConfigurationModes,
  type IdpConfigurationMode,
} from '../saml/shared/IdentityProviderConfigurationModes';

const OIDC_STEPS: WizardStepConfig[] = [
  { id: 'redirect-uri' },
  { id: 'claims' },
  { id: 'endpoints' },
  { id: 'credentials' },
];

export const OidcCustomConfigureSteps = (): JSX.Element => {
  return (
    // Linear, guard-less sub-flow: mount on the first step, mirroring the SAML custom inner wizard.
    <Wizard
      steps={OIDC_STEPS}
      initialStepId={OIDC_STEPS[0].id}
    >
      <Wizard.Match id='redirect-uri'>
        <OidcRedirectUriStep />
      </Wizard.Match>

      <Wizard.Match id='claims'>
        <OidcClaimsStep />
      </Wizard.Match>

      <Wizard.Match id='endpoints'>
        <OidcEndpointsStep />
      </Wizard.Match>

      <Wizard.Match id='credentials'>
        <OidcCredentialsStep />
      </Wizard.Match>
    </Wizard>
  );
};

const OidcRedirectUriStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  const { enterpriseConnection } = useConfigureSSO();
  const redirectUri = enterpriseConnection?.oauthConfig?.redirectUri ?? '';
  const redirectUriField = useFormControl('redirectUri', redirectUri, {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.redirectUriStep.redirectUri.label'),
    isRequired: false,
  });

  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.oidcCustom.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.oidcCustom.redirectUriStep.headerSubtitle')}
      >
        <InnerStepCounter />
      </Step.Header>

      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$5 })}>
          <Col sx={theme => ({ gap: theme.space.$1x5 })}>
            <Text
              as='p'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.configureStep.oidcCustom.redirectUriStep.paragraph')}
            />
          </Col>

          <Form.ControlRow elementId={redirectUriField.id}>
            <Form.CommonInputWrapper {...redirectUriField.props}>
              <ClipboardInput
                value={redirectUri}
                readOnly
                copyIcon={Clipboard}
                copiedIcon={Checkmark}
              />
            </Form.CommonInputWrapper>
          </Form.ControlRow>
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

const OidcClaimsStep = (): JSX.Element => {
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();

  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.oidcCustom.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.oidcCustom.claimsStep.headerSubtitle')}
      >
        <InnerStepCounter />
      </Step.Header>

      <Step.Body>
        <Step.Section sx={theme => ({ gap: theme.space.$3 })}>
          <Text
            as='p'
            colorScheme='secondary'
            localizationKey={localizationKeys('configureSSO.configureStep.oidcCustom.claimsStep.paragraph')}
          />

          <OidcClaimsTable />
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

type OidcClaimRow = {
  id: 'subject' | 'email' | 'firstName' | 'lastName';
  isRequired: boolean;
};

const OIDC_CLAIM_ROWS: ReadonlyArray<OidcClaimRow> = [
  { id: 'subject', isRequired: true },
  { id: 'email', isRequired: true },
  { id: 'firstName', isRequired: false },
  { id: 'lastName', isRequired: false },
];

const OidcClaimsTable = (): JSX.Element => (
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
              'configureSSO.configureStep.oidcCustom.claimsStep.attributeMappingTable.columns.attributeName',
            )}
          />
        </Th>
        <Th>
          <Text
            sx={theme => ({ fontSize: theme.fontSizes.$xs })}
            localizationKey={localizationKeys(
              'configureSSO.configureStep.oidcCustom.claimsStep.attributeMappingTable.columns.userAttribute',
            )}
          />
        </Th>
      </Tr>
    </Thead>
    <Tbody>
      {OIDC_CLAIM_ROWS.map(row => (
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
                sx={{ fontFamily: 'monospace' }}
                localizationKey={localizationKeys(
                  `configureSSO.configureStep.oidcCustom.claimsStep.attributeMappingTable.rows.${row.id}.userAttribute`,
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
              localizationKey={localizationKeys(
                `configureSSO.configureStep.oidcCustom.claimsStep.attributeMappingTable.rows.${row.id}.attributeName`,
              )}
            />
          </Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
);

const OIDC_ENDPOINT_MODES = ['discoveryUrl', 'manual'] as const satisfies readonly IdpConfigurationMode[];

const OidcEndpointsStep = (): JSX.Element => {
  const card = useCardState();
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  const {
    enterpriseConnection,
    enterpriseConnectionMutations: { updateConnection },
  } = useConfigureSSO();
  const oauthConfig = enterpriseConnection?.oauthConfig;
  const [mode, setMode] = React.useState<IdpConfigurationMode>('discoveryUrl');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const discoveryUrlField = useFormControl('discoveryUrl', oauthConfig?.discoveryUrl ?? '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.discoveryUrl.label'),
    placeholder: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.discoveryUrl.placeholder'),
    isRequired: true,
  });
  const authUrlField = useFormControl('authUrl', oauthConfig?.authUrl ?? '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.authUrl.label'),
    placeholder: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.authUrl.placeholder'),
    isRequired: true,
  });
  const tokenUrlField = useFormControl('tokenUrl', oauthConfig?.tokenUrl ?? '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.tokenUrl.label'),
    placeholder: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.tokenUrl.placeholder'),
    isRequired: true,
  });
  const userInfoUrlField = useFormControl('userInfoUrl', oauthConfig?.userInfoUrl ?? '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.userInfoUrl.label'),
    placeholder: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.userInfoUrl.placeholder'),
    isRequired: true,
  });

  const isValid =
    mode === 'discoveryUrl'
      ? discoveryUrlField.value.trim().length > 0
      : authUrlField.value.trim().length > 0 &&
        tokenUrlField.value.trim().length > 0 &&
        userInfoUrlField.value.trim().length > 0;

  const canSubmit = isValid && !isSubmitting;

  const handleContinue = async (): Promise<void> => {
    if (!enterpriseConnection || !canSubmit) {
      return;
    }

    card.setError(undefined);
    setIsSubmitting(true);

    try {
      await updateConnection(
        enterpriseConnection.id,
        mode === 'discoveryUrl'
          ? { oidc: { discoveryUrl: discoveryUrlField.value.trim() } }
          : {
              oidc: {
                authUrl: authUrlField.value.trim(),
                tokenUrl: tokenUrlField.value.trim(),
                userInfoUrl: userInfoUrlField.value.trim(),
              },
            },
      );
      void goNext();
    } catch (err) {
      handleError(
        err as Error,
        mode === 'discoveryUrl' ? [discoveryUrlField] : [authUrlField, tokenUrlField, userInfoUrlField],
        card.setError,
      );
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.oidcCustom.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.headerSubtitle')}
      >
        <InnerStepCounter />
      </Step.Header>

      <Step.Body>
        <Step.Section
          fill
          gap={5}
        >
          <IdentityProviderConfigurationModes
            modes={OIDC_ENDPOINT_MODES}
            value={mode}
            onChange={setMode}
            labels={{
              ariaLabel: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.modes.ariaLabel'),
              discoveryUrl: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.modes.discoveryUrl'),
              manual: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.modes.manual'),
            }}
          />

          {mode === 'discoveryUrl' ? (
            <>
              <Text
                as='p'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.oidcCustom.endpointsStep.discoveryUrl.description',
                )}
              />
              <Form.ControlRow elementId={discoveryUrlField.id}>
                <Form.PlainInput {...discoveryUrlField.props} />
              </Form.ControlRow>
            </>
          ) : (
            <>
              <Text
                as='p'
                colorScheme='secondary'
                localizationKey={localizationKeys(
                  'configureSSO.configureStep.oidcCustom.endpointsStep.manual.description',
                )}
              />
              <Form.ControlRow elementId={authUrlField.id}>
                <Form.PlainInput {...authUrlField.props} />
              </Form.ControlRow>
              <Form.ControlRow elementId={tokenUrlField.id}>
                <Form.PlainInput {...tokenUrlField.props} />
              </Form.ControlRow>
              <Form.ControlRow elementId={userInfoUrlField.id}>
                <Form.PlainInput {...userInfoUrlField.props} />
              </Form.ControlRow>
            </>
          )}

          <ActiveConnectionAlert />
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
          isDisabled={!canSubmit || isLastStep}
        />
      </Step.Footer>
    </>
  );
};

const OidcCredentialsStep = (): JSX.Element => {
  const card = useCardState();
  const { goNext, goPrev, isFirstStep } = useWizard();
  const {
    enterpriseConnection,
    enterpriseConnectionMutations: { updateConnection },
  } = useConfigureSSO();
  const clientIdField = useFormControl('clientId', enterpriseConnection?.oauthConfig?.clientId ?? '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.credentialsStep.clientId.label'),
    placeholder: localizationKeys('configureSSO.configureStep.oidcCustom.credentialsStep.clientId.placeholder'),
    isRequired: true,
  });
  const clientSecretField = useFormControl('clientSecret', '', {
    type: 'password',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.credentialsStep.clientSecret.label'),
    placeholder: localizationKeys('configureSSO.configureStep.oidcCustom.credentialsStep.clientSecret.placeholder'),
    isRequired: true,
  });
  const scopeField = useFormControl('scopes', '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.credentialsStep.scopes.label'),
    placeholder: localizationKeys('configureSSO.configureStep.oidcCustom.credentialsStep.scopes.placeholder'),
    isRequired: false,
  });
  const [scopes, setScopes] = React.useState(['openid', 'profile']);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const canSubmit = clientIdField.value.trim().length > 0 && clientSecretField.value.trim().length > 0 && !isSubmitting;

  const addScope = (): void => {
    const scope = scopeField.value.trim();
    if (!scope || scopes.includes(scope)) {
      return;
    }

    setScopes(previousScopes => [...previousScopes, scope]);
    scopeField.setValue('');
  };

  const handleContinue = async (): Promise<void> => {
    if (!enterpriseConnection || !canSubmit) {
      return;
    }

    card.setError(undefined);
    setIsSubmitting(true);

    try {
      await updateConnection(enterpriseConnection.id, {
        oidc: {
          clientId: clientIdField.value.trim(),
          clientSecret: clientSecretField.value.trim(),
        },
      });
      void goNext();
    } catch (err) {
      handleError(err as Error, [clientIdField, clientSecretField], card.setError);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.oidcCustom.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.oidcCustom.credentialsStep.headerSubtitle')}
      >
        <InnerStepCounter />
      </Step.Header>

      <Step.Body>
        <Step.Section
          fill
          gap={5}
        >
          <Text
            as='p'
            colorScheme='secondary'
            localizationKey={localizationKeys('configureSSO.configureStep.oidcCustom.credentialsStep.paragraph')}
          />

          <Form.ControlRow elementId={clientIdField.id}>
            <Form.PlainInput {...clientIdField.props} />
          </Form.ControlRow>

          <Form.ControlRow elementId={clientSecretField.id}>
            <Form.PasswordInput {...clientSecretField.props} />
          </Form.ControlRow>

          <Form.ControlRow elementId={scopeField.id}>
            <Field.Root {...scopeField.props}>
              <Col sx={theme => ({ flex: 1, gap: theme.space.$2 })}>
                <Field.LabelRow>
                  <Flex
                    align='center'
                    sx={theme => ({ gap: theme.space.$2 })}
                  >
                    <Field.Label />
                    <Badge
                      colorScheme='primary'
                      localizationKey={localizationKeys(
                        'configureSSO.configureStep.oidcCustom.credentialsStep.scopes.optional',
                      )}
                    />
                  </Flex>
                </Field.LabelRow>
                <Flex
                  align='start'
                  sx={theme => ({ gap: theme.space.$2 })}
                >
                  <Box sx={{ flex: 1 }}>
                    <Field.Input />
                  </Box>
                  <Button
                    type='button'
                    variant='bordered'
                    colorScheme='secondary'
                    isDisabled={!scopeField.value.trim() || scopes.includes(scopeField.value.trim())}
                    onClick={addScope}
                    localizationKey={localizationKeys(
                      'configureSSO.configureStep.oidcCustom.credentialsStep.scopes.addButton',
                    )}
                    sx={{ flexShrink: 0 }}
                  />
                </Flex>
              </Col>
            </Field.Root>
          </Form.ControlRow>

          <Flex
            wrap='wrap'
            sx={theme => ({ gap: theme.space.$2 })}
          >
            {scopes.map(scope => (
              <Badge
                key={scope}
                colorScheme='primary'
              >
                <Flex
                  align='center'
                  sx={theme => ({ gap: theme.space.$1 })}
                >
                  <Text
                    as='span'
                    sx={{ fontFamily: 'monospace' }}
                  >
                    {scope}
                  </Text>
                  <Button
                    type='button'
                    variant='ghost'
                    colorScheme='neutral'
                    aria-label={`Remove ${scope}`}
                    onClick={() => setScopes(previousScopes => previousScopes.filter(value => value !== scope))}
                    sx={theme => ({ minHeight: 'auto', minWidth: 'auto', padding: theme.space.$0x5 })}
                  >
                    <Icon
                      icon={Close}
                      size='xs'
                    />
                  </Button>
                </Flex>
              </Badge>
            ))}
          </Flex>

          <ActiveConnectionAlert />
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

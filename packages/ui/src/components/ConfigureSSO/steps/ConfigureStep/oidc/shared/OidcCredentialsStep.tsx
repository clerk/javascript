import React, { type JSX } from 'react';

import { Badge, Box, Button, Col, Flex, Icon, localizationKeys, Text } from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { Field } from '@/elements/FieldControl';
import { Form } from '@/elements/Form';
import { Close } from '@/icons';
import { useFormControl } from '@/ui/utils/useFormControl';
import { handleError } from '@/utils/errorHandler';

import { useConfigureSSO } from '../../../../ConfigureSSOContext';
import { Step } from '../../../../elements/Step';
import { useWizard } from '../../../../elements/Wizard';
import { InnerStepCounter } from '../../../../elements/Wizard/InnerStepCounter';
import { ActiveConnectionAlert } from '../../saml/shared/ActiveConnectionAlert';

export const OidcCredentialsStep = (): JSX.Element => {
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

import { useReverification, useUser } from '@clerk/shared/react';
import { useState } from 'react';

import { Badge, Col, descriptors, Flex, Flow, Grid, Link, localizationKeys, Text } from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { Form } from '@/elements/Form';
import { ProfileSection } from '@/elements/Section';
import { Switch } from '@/elements/Switch';
import { handleError } from '@/utils/errorHandler';
import { useFormControl } from '@/utils/useFormControl';

import { useConfigureSSOFlow } from '../ConfigureSSOContext';
import { Step } from '../elements/Step';
import { useWizard } from '../elements/Wizard';

const truncateSx = {
  minWidth: 0,
  display: 'block',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
} as const;

export const ConfirmationStep = (): JSX.Element => {
  return (
    <Flow.Part part='ssoConfirmation'>
      <Step
        elementDescriptor={descriptors.configureSSOStep}
        elementId={descriptors.configureSSOStep.setId('confirmation')}
      >
        <Step.Body sx={t => ({ paddingInline: t.space.$8, paddingBlock: t.space.$4 })}>
          <SsoStatusSection />
          <EnableSsoSection />
          <ConfigurationDetailsSection />
          <ResetConnectionSection />
        </Step.Body>

        <Step.Footer />
      </Step>
    </Flow.Part>
  );
};

const SsoStatusSection = (): JSX.Element => {
  const { enterpriseConnection } = useConfigureSSOFlow();
  const isActive = !!enterpriseConnection?.active;

  return (
    <ProfileSection.Root
      title={localizationKeys('configureSSO.confirmation.statusSection.title')}
      id='ssoStatus'
      sx={{ border: 0 }}
    >
      <Flex justify='start'>
        <Badge
          colorScheme={isActive ? 'success' : 'danger'}
          localizationKey={
            isActive
              ? localizationKeys('configureSSO.confirmation.statusSection.activeBadge')
              : localizationKeys('configureSSO.confirmation.statusSection.inactiveBadge')
          }
        />
      </Flex>
    </ProfileSection.Root>
  );
};

const EnableSsoSection = (): JSX.Element => {
  const { enterpriseConnection } = useConfigureSSOFlow();
  const { user } = useUser();
  const card = useCardState();

  const [isChecked, setIsChecked] = useState(!!enterpriseConnection?.active);

  const updateEnterpriseConnection = useReverification((id: string, active: boolean) =>
    user?.updateEnterpriseConnection(id, { active }),
  );

  const onChange = async (active: boolean) => {
    if (!enterpriseConnection || card.isLoading) {
      return;
    }

    card.setError(undefined);
    card.setLoading();
    setIsChecked(active);

    try {
      const updated = await updateEnterpriseConnection(enterpriseConnection.id, active);
      if (updated) {
        setIsChecked(updated.active);
      }
    } catch (err) {
      setIsChecked(!active);
      handleError(err as Error, [], card.setError);
    } finally {
      card.setIdle();
    }
  };

  return (
    <ProfileSection.Root
      title={localizationKeys('configureSSO.confirmation.enableSection.title')}
      id='enableSso'
      centered
    >
      <Flex justify='start'>
        <Switch
          isChecked={isChecked}
          isDisabled={card.isLoading || !enterpriseConnection}
          onChange={active => void onChange(active)}
          aria-label='Enable SSO'
        />
      </Flex>
    </ProfileSection.Root>
  );
};

const ConfigurationDetailsSection = (): JSX.Element => {
  const { enterpriseConnection } = useConfigureSSOFlow();
  const samlConnection = enterpriseConnection?.samlConnection;

  return (
    <ProfileSection.Root
      title={localizationKeys('configureSSO.confirmation.configurationSection.title')}
      id='ssoConfiguration'
      centered
    >
      <Col gap={3}>
        <Grid
          gap={3}
          sx={{ width: '100%', alignItems: 'center', gridTemplateColumns: '150px 1fr' }}
        >
          <Text
            colorScheme='secondary'
            localizationKey={localizationKeys('configureSSO.confirmation.configurationSection.ssoUrlLabel')}
          />
          <Link
            href={samlConnection?.idpSsoUrl ?? ''}
            isExternal
            title={samlConnection?.idpSsoUrl}
            sx={truncateSx}
          >
            {samlConnection?.idpSsoUrl ?? '—'}
          </Link>

          <Text
            colorScheme='secondary'
            localizationKey={localizationKeys('configureSSO.confirmation.configurationSection.issuerLabel')}
          />
          <Text
            title={samlConnection?.idpEntityId}
            sx={truncateSx}
          >
            {samlConnection?.idpEntityId ?? '—'}
          </Text>

          <Text
            colorScheme='secondary'
            localizationKey={localizationKeys('configureSSO.confirmation.configurationSection.certificateLabel')}
          />
          <Text
            title={samlConnection?.idpCertificate}
            sx={truncateSx}
          >
            {samlConnection?.idpCertificate ?? '—'}
          </Text>
        </Grid>

        <Flex
          justify='start'
          sx={t => ({ marginTop: t.space.$2 })}
        >
          <Link
            href='#'
            localizationKey={localizationKeys('configureSSO.confirmation.configurationSection.configureAgainLink')}
          />
        </Flex>
      </Col>
    </ProfileSection.Root>
  );
};

const ResetConnectionSection = (): JSX.Element => {
  const { enterpriseConnection } = useConfigureSSOFlow();
  const { user } = useUser();
  const card = useCardState();
  const { goToStep } = useWizard();

  const deleteEnterpriseConnection = useReverification((id: string) => user?.deleteEnterpriseConnection(id));

  const confirmationField = useFormControl('deleteConfirmation', '', {
    type: 'text',
    label: localizationKeys('configureSSO.confirmation.resetSection.confirmationFieldLabel', {
      name: enterpriseConnection?.name ?? '',
    }),
    isRequired: true,
    placeholder: enterpriseConnection?.name,
  });

  const canSubmit = Boolean(enterpriseConnection?.name && confirmationField.value === enterpriseConnection.name);

  const onSubmit = async () => {
    if (!enterpriseConnection || !canSubmit) {
      return;
    }

    try {
      await deleteEnterpriseConnection(enterpriseConnection.id);
      await goToStep('select-provider');
    } catch (err) {
      handleError(err as Error, [confirmationField], card.setError);
    }
  };

  return (
    <ProfileSection.Root
      title={localizationKeys('configureSSO.confirmation.resetSection.title')}
      id='resetSso'
      centered
    >
      <Form.Root onSubmit={onSubmit}>
        <Col gap={3}>
          <Text
            colorScheme='danger'
            localizationKey={localizationKeys('configureSSO.confirmation.resetSection.warning')}
          />
          <Form.ControlRow elementId={confirmationField.id}>
            <Form.PlainInput
              {...confirmationField.props}
              ignorePasswordManager
            />
          </Form.ControlRow>
          <Flex justify='start'>
            <Form.SubmitButton
              block={false}
              colorScheme='danger'
              isDisabled={!canSubmit}
              localizationKey={localizationKeys('configureSSO.confirmation.resetSection.submitButton')}
            />
          </Flex>
        </Col>
      </Form.Root>
    </ProfileSection.Root>
  );
};

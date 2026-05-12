import { useReverification, useUser } from '@clerk/shared/react';
import { useState } from 'react';

import { Badge, Col, descriptors, Flex, Flow, Grid, Link, localizationKeys, Text } from '@/customizables';
import { Action } from '@/elements/Action';
import { useActionContext } from '@/elements/Action/ActionRoot';
import { useCardState, withCardStateProvider } from '@/elements/contexts';
import { Form } from '@/elements/Form';
import { FormButtons } from '@/elements/FormButtons';
import type { FormProps } from '@/elements/FormContainer';
import { FormContainer } from '@/elements/FormContainer';
import { ProfileSection } from '@/elements/Section';
import { Switch } from '@/elements/Switch';
import { mqu } from '@/styledSystem';
import { handleError } from '@/utils/errorHandler';
import { useFormControl } from '@/utils/useFormControl';

import { useConfigureSSOFlow } from '../ConfigureSSOContext';
import { Step } from '../elements/Step';
import { useWizard } from '../elements/Wizard';

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
          <DomainSection />
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
      sx={{ border: 0 }}
    >
      <Switch
        isChecked={isChecked}
        isDisabled={card.isLoading}
        onChange={active => void onChange(active)}
        aria-label='Enable SSO'
      />
    </ProfileSection.Root>
  );
};

const DomainSection = (): JSX.Element | null => {
  const { enterpriseConnection } = useConfigureSSOFlow();
  const domain = enterpriseConnection?.domains?.[0];

  if (!domain) {
    return null;
  }

  return (
    <ProfileSection.Root
      title={localizationKeys('configureSSO.confirmation.domainSection.title')}
      id='ssoDomain'
      sx={{ border: 0 }}
    >
      <Link
        href={`https://${domain}`}
        isExternal
        title={domain}
        sx={{ display: 'block', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
      >
        {domain}
      </Link>
    </ProfileSection.Root>
  );
};

const ConfigurationDetailsSection = (): JSX.Element => {
  const { enterpriseConnection } = useConfigureSSOFlow();
  const samlConnection = enterpriseConnection?.samlConnection;
  const { goToStep } = useWizard();

  return (
    <ProfileSection.Root
      title={localizationKeys('configureSSO.confirmation.configurationSection.title')}
      id='ssoConfiguration'
      centered={false}
    >
      <Col gap={3}>
        <Grid
          gap={3}
          sx={{ width: '100%', alignItems: 'center', gridTemplateColumns: '150px minmax(0, 1fr)' }}
        >
          <Text
            colorScheme='secondary'
            localizationKey={localizationKeys('configureSSO.confirmation.configurationSection.ssoUrlLabel')}
          />
          <Link
            href={samlConnection?.idpSsoUrl ?? ''}
            isExternal
            title={samlConnection?.idpSsoUrl}
            sx={{ display: 'block', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
          >
            {samlConnection?.idpSsoUrl}
          </Link>

          <Text
            colorScheme='secondary'
            localizationKey={localizationKeys('configureSSO.confirmation.configurationSection.issuerLabel')}
          />
          <Text
            truncate
            title={samlConnection?.idpEntityId}
          >
            {samlConnection?.idpEntityId}
          </Text>

          <Text
            colorScheme='secondary'
            localizationKey={localizationKeys('configureSSO.confirmation.configurationSection.certificateLabel')}
          />
          <Text
            truncate
            title={samlConnection?.idpCertificate}
          >
            {samlConnection?.idpCertificate}
          </Text>
        </Grid>

        <Flex
          justify='start'
          sx={t => ({ marginTop: t.space.$2, paddingInlineStart: 0, marginInline: '-10px' })}
        >
          <ProfileSection.Button
            id='configureAgain'
            onClick={() => goToStep('select-provider')}
            variant='ghost'
            colorScheme='primary'
            localizationKey={localizationKeys('configureSSO.confirmation.configurationSection.configureAgainLink')}
          />
        </Flex>
      </Col>
    </ProfileSection.Root>
  );
};

const ResetConnectionForm = withCardStateProvider((props: FormProps) => {
  const { onReset, onSuccess } = props;
  const card = useCardState();
  const { enterpriseConnection } = useConfigureSSOFlow();
  const { user } = useUser();
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
      onSuccess();
      await goToStep('select-provider');
    } catch (err) {
      handleError(err as Error, [confirmationField], card.setError);
    }
  };

  return (
    <FormContainer
      headerTitle={localizationKeys('configureSSO.confirmation.resetSection.title')}
      sx={t => ({ gap: t.space.$0x5 })}
    >
      <Form.Root onSubmit={onSubmit}>
        <Col gap={1}>
          <Text
            colorScheme='danger'
            localizationKey={localizationKeys('configureSSO.confirmation.resetSection.warning')}
          />
        </Col>
        <Form.ControlRow elementId={confirmationField.id}>
          <Form.PlainInput
            {...confirmationField.props}
            ignorePasswordManager
          />
        </Form.ControlRow>
        <FormButtons
          submitLabel={localizationKeys('configureSSO.confirmation.resetSection.submitButton')}
          colorScheme='danger'
          isDisabled={!canSubmit}
          onReset={onReset}
        />
      </Form.Root>
    </FormContainer>
  );
});

const ResetConnectionScreen = (): JSX.Element => {
  const { close } = useActionContext();
  return (
    <ResetConnectionForm
      onSuccess={close}
      onReset={close}
    />
  );
};

const ResetConnectionSection = (): JSX.Element => {
  return (
    <ProfileSection.Root
      title={localizationKeys('configureSSO.confirmation.resetSection.title')}
      id='resetSso'
      sx={{ alignItems: 'center', [mqu.md]: { alignItems: 'flex-start' } }}
    >
      <Action.Root>
        <Action.Closed value='reset'>
          <ProfileSection.Item
            id='resetSso'
            sx={{ paddingInlineStart: 0, marginInline: '-10px' }}
          >
            <Action.Trigger value='reset'>
              <ProfileSection.Button
                id='resetSso'
                variant='ghost'
                colorScheme='danger'
                localizationKey={localizationKeys('configureSSO.confirmation.resetSection.title')}
              />
            </Action.Trigger>
          </ProfileSection.Item>
        </Action.Closed>

        <Action.Open value='reset'>
          <Action.Card variant='destructive'>
            <ResetConnectionScreen />
          </Action.Card>
        </Action.Open>
      </Action.Root>
    </ProfileSection.Root>
  );
};

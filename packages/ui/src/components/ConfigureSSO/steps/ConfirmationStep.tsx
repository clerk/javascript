import { useOrganization, useReverification } from '@clerk/shared/react';
import { useState } from 'react';

import { Badge, Col, descriptors, Flex, Flow, Grid, Link, localizationKeys, Text } from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { ProfileSection } from '@/elements/Section';
import { Switch } from '@/elements/Switch';
import { mqu } from '@/styledSystem';
import { handleError } from '@/utils/errorHandler';

import { useConfigureSSO } from '../ConfigureSSOContext';
import { Step } from '../elements/Step';
import { useWizard } from '../elements/Wizard';
import { ResetConnectionDialog } from '../ResetConnectionDialog';

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
          <ResetConnectionRow />
        </Step.Body>

        <Step.Footer />
      </Step>
    </Flow.Part>
  );
};

const SsoStatusSection = (): JSX.Element => {
  const { enterpriseConnection } = useConfigureSSO();
  const isActive = !!enterpriseConnection?.active;

  return (
    <ProfileSection.Root
      title={localizationKeys('configureSSO.confirmation.statusSection.title')}
      id='ssoStatus'
      sx={{ border: 0 }}
    >
      <Flex justify='start'>
        <Badge
          elementDescriptor={descriptors.configureSSOConfirmationStatusBadge}
          elementId={descriptors.configureSSOConfirmationStatusBadge.setId(isActive ? 'active' : 'inactive')}
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
  const { enterpriseConnection, updateEnterpriseConnection } = useConfigureSSO();
  const card = useCardState();

  const [isChecked, setIsChecked] = useState(!!enterpriseConnection?.active);

  const updateActive = useReverification((id: string, active: boolean) => updateEnterpriseConnection(id, { active }));

  const onActiveChange = async (active: boolean) => {
    if (card.isLoading) {
      return;
    }

    card.setError(undefined);
    card.setLoading();
    setIsChecked(active);

    try {
      // Enterprise connection is guaranteed to be set at this point
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const updated = await updateActive(enterpriseConnection!.id, active);
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
      sx={t => ({ border: 0, paddingBlock: t.space.$2 })}
    >
      <Switch
        isChecked={isChecked}
        isDisabled={card.isLoading}
        onChange={active => void onActiveChange(active)}
        aria-label='Enable SSO'
      />
    </ProfileSection.Root>
  );
};

const DomainSection = (): JSX.Element | null => {
  const { enterpriseConnection } = useConfigureSSO();
  const domain = enterpriseConnection?.domains?.[0];

  // A type guard only, domains are guaranteed to be set at this point
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
        elementDescriptor={descriptors.configureSSOConfirmationDomainLink}
        href={`https://${domain}`}
        isExternal
        title={domain}
        sx={{
          display: 'block',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          textDecoration: 'underline',
        }}
      >
        {domain}
      </Link>
    </ProfileSection.Root>
  );
};

const ConfigurationDetailsSection = (): JSX.Element => {
  const { enterpriseConnection } = useConfigureSSO();
  const { goToStep } = useWizard();

  // This will later be expanded to support OIDC connections as well
  const samlConnection = enterpriseConnection?.samlConnection;

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
            elementDescriptor={descriptors.configureSSOConfirmationConfigDetailsLabel}
            colorScheme='secondary'
            localizationKey={localizationKeys('configureSSO.confirmation.configurationSection.ssoUrlLabel')}
          />
          <Link
            elementDescriptor={descriptors.configureSSOConfirmationConfigDetailsLink}
            href={samlConnection?.idpSsoUrl ?? ''}
            isExternal
            title={samlConnection?.idpSsoUrl}
            sx={{ display: 'block', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
          >
            {samlConnection?.idpSsoUrl}
          </Link>

          <Text
            elementDescriptor={descriptors.configureSSOConfirmationConfigDetailsLabel}
            colorScheme='secondary'
            localizationKey={localizationKeys('configureSSO.confirmation.configurationSection.issuerLabel')}
          />
          <Text
            elementDescriptor={descriptors.configureSSOConfirmationConfigDetailsValue}
            truncate
            title={samlConnection?.idpEntityId}
          >
            {samlConnection?.idpEntityId}
          </Text>

          <Text
            elementDescriptor={descriptors.configureSSOConfirmationConfigDetailsLabel}
            colorScheme='secondary'
            localizationKey={localizationKeys('configureSSO.confirmation.configurationSection.certificateLabel')}
          />
          <Text
            elementDescriptor={descriptors.configureSSOConfirmationConfigDetailsValue}
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
            elementDescriptor={descriptors.configureSSOConfirmationReconfigureButton}
            id='configureAgain'
            onClick={() => goToStep('configure')}
            variant='ghost'
            colorScheme='primary'
            localizationKey={localizationKeys('configureSSO.confirmation.configurationSection.configureAgainLink')}
          />
        </Flex>
      </Col>
    </ProfileSection.Root>
  );
};

const ResetConnectionRow = (): JSX.Element => {
  const { organization } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ProfileSection.Root
      title={localizationKeys('configureSSO.confirmation.resetSection.title')}
      id='resetSso'
      sx={{ alignItems: 'center', [mqu.md]: { alignItems: 'flex-start' } }}
    >
      <ProfileSection.Item
        id='resetSso'
        sx={{ paddingInlineStart: 0, marginInline: '-10px' }}
      >
        <ProfileSection.Button
          elementDescriptor={descriptors.configureSSOConfirmationResetButton}
          id='resetSso'
          variant='ghost'
          colorScheme='danger'
          localizationKey={localizationKeys('configureSSO.confirmation.resetSection.title')}
          onClick={() => setIsOpen(true)}
        />
      </ProfileSection.Item>
      <ResetConnectionDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        confirmationValue={organization?.name ?? ''}
      />
    </ProfileSection.Root>
  );
};

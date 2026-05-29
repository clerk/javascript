import { useOrganization, useReverification } from '@clerk/shared/react';
import { useState } from 'react';

import { AlertIcon, Badge, Button, descriptors, Flex, Flow, Grid, Link, localizationKeys, Text } from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { ProfileSection } from '@/elements/Section';
import { Switch } from '@/elements/Switch';
import { handleError } from '@/utils/errorHandler';

import { useConfigureSSO } from '../ConfigureSSOContext';
import { Step } from '../elements/Step';
import { useWizard } from '../elements/Wizard';
import { ResetConnectionDialog } from '../ResetConnectionDialog';

export const ConfirmationStep = (): JSX.Element => {
  const { enterpriseConnection } = useConfigureSSO();
  const isActive = !!enterpriseConnection?.active;

  return (
    <Flow.Part part='ssoConfirmation'>
      <Step
        elementDescriptor={descriptors.configureSSOStep}
        elementId={descriptors.configureSSOStep.setId('confirmation')}
      >
        <Step.Header
          title={localizationKeys('configureSSO.confirmation.statusSection.title')}
          badge={
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
          }
        />

        <Step.Body sx={t => ({ paddingInline: t.space.$6, paddingBlock: t.space.$5, gap: t.space.$5 })}>
          <EnableSsoSection />
          <DomainSection />
          <ConfigurationDetailsSection />
          <ResetConnectionSection />
        </Step.Body>

        <Step.Footer>
          {!isActive && (
            <Flex
              sx={{ flex: 1 }}
              align='center'
            >
              <AlertIcon
                variant='info'
                colorScheme='info'
                sx={t => ({ marginInlineEnd: t.space.$2 })}
              />

              <Text
                colorScheme='secondary'
                localizationKey={localizationKeys('configureSSO.confirmation.inactiveBanner.title')}
              />
            </Flex>
          )}
        </Step.Footer>
      </Step>
    </Flow.Part>
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
          minWidth: 0,
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
      <Grid
        sx={t => ({
          width: '100%',
          rowGap: t.space.$3,
          columnGap: t.space.$3,
          alignItems: 'center',
          gridTemplateColumns: 'minmax(120px, 160px) minmax(0, 1fr)',
        })}
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
          sx={{ display: 'block', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', minWidth: 0 }}
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

      <Flex justify='start'>
        <Button
          elementDescriptor={descriptors.configureSSOConfirmationReconfigureButton}
          variant='outline'
          size='sm'
          onClick={() => goToStep('configure')}
          localizationKey={localizationKeys('configureSSO.confirmation.configurationSection.configureAgainLink')}
        />
      </Flex>
    </ProfileSection.Root>
  );
};

const ResetConnectionSection = (): JSX.Element => {
  const { organization } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ProfileSection.Root
      title={localizationKeys('configureSSO.confirmation.resetSection.title')}
      id='resetSso'
    >
      <Flex justify='start'>
        <Button
          elementDescriptor={descriptors.configureSSOConfirmationResetButton}
          variant='solid'
          colorScheme='danger'
          size='sm'
          onClick={() => setIsOpen(true)}
          localizationKey={localizationKeys('configureSSO.confirmation.resetSection.title')}
        />
      </Flex>

      <ResetConnectionDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        confirmationValue={organization?.name ?? ''}
      />
    </ProfileSection.Root>
  );
};

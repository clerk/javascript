import { useOrganization, useReverification } from '@clerk/shared/react';
import { useState } from 'react';

import {
  Badge,
  Button,
  Col,
  descriptors,
  Flex,
  Flow,
  Grid,
  Heading,
  Link,
  localizationKeys,
  Text,
} from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { Switch } from '@/elements/Switch';
import { Alert } from '@/ui/elements/Alert';
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
        <Step.Body sx={t => ({ paddingInline: t.space.$6, paddingBlock: t.space.$5, gap: t.space.$5 })}>
          <StatusHeader isActive={isActive} />
          <DetailsGrid />
        </Step.Body>

        <Step.Footer>
          {!isActive && (
            <Alert
              variant='info'
              title={localizationKeys('configureSSO.confirmation.inactiveBanner.title')}
              sx={{ flex: 1 }}
            />
          )}
        </Step.Footer>
      </Step>
    </Flow.Part>
  );
};

type StatusHeaderProps = {
  isActive: boolean;
};

const StatusHeader = ({ isActive }: StatusHeaderProps): JSX.Element => {
  return (
    <Flex
      align='center'
      sx={t => ({
        gap: t.space.$3,
        paddingBlockEnd: t.space.$4,
        borderBottomWidth: t.borderWidths.$normal,
        borderBottomStyle: t.borderStyles.$solid,
        borderBottomColor: t.colors.$borderAlpha100,
      })}
    >
      <Heading
        textVariant='h2'
        localizationKey={localizationKeys('configureSSO.confirmation.statusSection.title')}
      />
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
  );
};

const DetailsGrid = (): JSX.Element => {
  return (
    <Grid
      sx={t => ({
        width: '100%',
        rowGap: t.space.$4,
        columnGap: t.space.$4,
        alignItems: 'center',
        gridTemplateColumns: 'minmax(160px, 220px) minmax(0, 1fr)',
      })}
    >
      <EnableSsoRow />
      <DomainRow />
      <ConfigurationDetailsRow />
      <ConfigureAgainRow />
      <ResetConnectionRow />
    </Grid>
  );
};

const RowLabel = ({ localizationKey }: { localizationKey: ReturnType<typeof localizationKeys> }): JSX.Element => (
  <Text
    as='label'
    variant='subtitle'
    localizationKey={localizationKey}
  />
);

const EnableSsoRow = (): JSX.Element => {
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
    <>
      <RowLabel localizationKey={localizationKeys('configureSSO.confirmation.enableSection.title')} />
      <Switch
        isChecked={isChecked}
        isDisabled={card.isLoading}
        onChange={active => void onActiveChange(active)}
        aria-label='Enable SSO'
      />
    </>
  );
};

const DomainRow = (): JSX.Element | null => {
  const { enterpriseConnection } = useConfigureSSO();
  const domain = enterpriseConnection?.domains?.[0];

  // A type guard only, domains are guaranteed to be set at this point
  if (!domain) {
    return null;
  }

  return (
    <>
      <RowLabel localizationKey={localizationKeys('configureSSO.confirmation.domainSection.title')} />
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
    </>
  );
};

const ConfigurationDetailsRow = (): JSX.Element => {
  const { enterpriseConnection } = useConfigureSSO();

  // This will later be expanded to support OIDC connections as well
  const samlConnection = enterpriseConnection?.samlConnection;

  return (
    <>
      <RowLabel localizationKey={localizationKeys('configureSSO.confirmation.configurationSection.title')} />
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
    </>
  );
};

const ConfigureAgainRow = (): JSX.Element => {
  const { goToStep } = useWizard();

  return (
    <>
      <span aria-hidden />
      <Col
        sx={t => ({
          paddingBlock: t.space.$2,
          borderBottomWidth: t.borderWidths.$normal,
          borderBottomStyle: t.borderStyles.$solid,
          borderBottomColor: t.colors.$borderAlpha100,
          gridColumn: '2 / -1',
        })}
      >
        <Flex justify='start'>
          <Button
            elementDescriptor={descriptors.configureSSOConfirmationReconfigureButton}
            variant='outline'
            size='sm'
            onClick={() => goToStep('configure')}
            localizationKey={localizationKeys('configureSSO.confirmation.configurationSection.configureAgainLink')}
          />
        </Flex>
      </Col>
    </>
  );
};

const ResetConnectionRow = (): JSX.Element => {
  const { organization } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <RowLabel localizationKey={localizationKeys('configureSSO.confirmation.resetSection.title')} />
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
    </>
  );
};

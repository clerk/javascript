import { useOrganization } from '@clerk/shared/react';
import React, { useState } from 'react';

import { Header } from '@/ui/elements/Header';
import { ProfileCard } from '@/ui/elements/ProfileCard';

import {
  Badge,
  Box,
  Button,
  Col,
  descriptors,
  Flex,
  Grid,
  Icon,
  localizationKeys,
  SimpleButton,
  Spinner,
  Text,
} from '../../customizables';
import { Checkmark, ChevronLeft } from '../../icons';
import { mqu } from '../../styledSystem';
import { ConfigureDirectorySyncWizard } from '../ConfigureDirectorySync/ConfigureDirectorySyncWizard';
import { isDirectorySyncActivated } from '../ConfigureDirectorySync/prototype';
import { ConfigureDomainsWizard } from '../ConfigureDomains/ConfigureDomainsWizard';
import { ConfigureIdentityProviderWizard } from '../ConfigureIdentityProvider/ConfigureIdentityProviderWizard';
import { providerDisplayName } from '../ConfigureIdentityProvider/SetupCompleteStep';
import { ConfigureSSOWizard } from '../ConfigureSSO/ConfigureSSOWizard';
import { areAllOrganizationDomainsVerified } from '../ConfigureSSO/domain/organizationEnterpriseConnection';
import { useOrganizationEnterpriseConnection } from '../ConfigureSSO/hooks/useOrganizationEnterpriseConnection';

type OrganizationSecurityPageProps = {
  contentRef: React.RefObject<HTMLDivElement>;
};

export const OrganizationSecurityPage = ({ contentRef }: OrganizationSecurityPageProps) => {
  const { organization } = useOrganization();

  if (!organization) {
    // We should never reach this point, but we'll return null to make TS happy
    return null;
  }

  return <OrganizationSecurityPageContent contentRef={contentRef} />;
};

const OrganizationSecurityPageContent = ({ contentRef }: OrganizationSecurityPageProps) => {
  const {
    isLoading,
    enterpriseConnection,
    organizationEnterpriseConnection,
    testRuns,
    enterpriseConnectionMutations,
    organizationDomains,
    organizationDomainMutations,
  } = useOrganizationEnterpriseConnection();

  const [view, setView] = useState<'overview' | 'wizard' | 'directorySync' | 'domains' | 'idpSelect'>('overview');
  const [forceFirstStep, setForceFirstStep] = useState(false);

  const exitWizard = () => setView('overview');

  const openWizard = (forceInitialStep = false) => {
    setForceFirstStep(forceInitialStep);
    setView('wizard');
  };

  // Gate the page-level loading overview to the overview view only. A wizard is
  // only ever opened after the overview has settled (it gates on `isLoading`),
  // so once a wizard view is active the connection data is present and stays
  // warm; a later `isLoading` flip (e.g. the test-runs query cold-loading after
  // a configure write) must not tear the open wizard down and reseat it — each
  // wizard step owns its own loading UI.
  if (isLoading && view === 'overview') {
    return (
      <SecurityPageOverview fillHeight>
        <Flex
          align='center'
          justify='center'
          sx={t => ({ flex: 1, paddingBlock: t.space.$5 })}
        >
          <Spinner
            size='xs'
            colorScheme='neutral'
            elementDescriptor={descriptors.spinner}
          />
        </Flex>
      </SecurityPageOverview>
    );
  }

  const backControl = (
    <SimpleButton
      elementDescriptor={descriptors.configureSSOHeaderBackButton}
      variant='unstyled'
      onClick={exitWizard}
      sx={t => ({
        gap: t.space.$1,
        padding: 0,
        color: t.colors.$colorMutedForeground,
        '&:hover': { color: t.colors.$colorForeground },
      })}
    >
      <Icon icon={ChevronLeft} />
      <Text
        as='span'
        variant='body'
        localizationKey={localizationKeys('organizationProfile.navbar.security')}
      />
    </SimpleButton>
  );

  if (view === 'directorySync') {
    return (
      <ConfigureDirectorySyncWizard
        title={backControl}
        onExit={exitWizard}
      />
    );
  }

  const wizardHostProps = {
    organizationEnterpriseConnection,
    testRuns,
    enterpriseConnection,
    contentRef,
    enterpriseConnectionMutations,
    organizationDomainMutations,
    organizationDomains,
    title: backControl,
    onExit: exitWizard,
  };

  if (view === 'domains') {
    return <ConfigureDomainsWizard {...wizardHostProps} />;
  }

  if (view === 'idpSelect') {
    return <ConfigureIdentityProviderWizard {...wizardHostProps} />;
  }

  if (view === 'wizard') {
    return (
      <ConfigureSSOWizard
        {...wizardHostProps}
        forceInitialStep={forceFirstStep}
      />
    );
  }

  // PROTOTYPE ONLY: the restructured IA — domains → provider selection →
  // {SSO, Directory Sync}. Prerequisites render as an ordered checklist; the
  // dependent features render as side-by-side cards gated on the checklist.
  const c = organizationEnterpriseConnection;
  const domains = organizationDomains ?? [];
  const verifiedDomainCount = domains.filter(domain => domain.ownershipVerification?.status === 'verified').length;
  const domainsReady = areAllOrganizationDomainsVerified(organizationDomains);
  const providerSelected = c.hasConnection;
  const prerequisitesMet = domainsReady && providerSelected;
  const providerName = providerSelected ? providerDisplayName(c.provider) : undefined;
  const isSsoActive = c.isActive;
  const isDirSyncActive = isDirectorySyncActivated();

  const configuredCount = [domainsReady, providerSelected, isSsoActive, isDirSyncActive].filter(Boolean).length;

  const domainsSubtitle =
    domains.length === 0
      ? 'No domains added yet'
      : `${domains[0].name}${domains.length > 1 ? ` +${domains.length - 1}` : ''} · ${verifiedDomainCount} of ${domains.length} ${domains.length === 1 ? 'domain' : 'domains'} verified`;

  const ssoStatusBadge =
    c.status === 'active'
      ? { colorScheme: 'success' as const, label: 'Active' }
      : c.status === 'inactive'
        ? { colorScheme: 'danger' as const, label: 'Inactive' }
        : c.status === 'in_progress'
          ? { colorScheme: 'warning' as const, label: 'In progress' }
          : { colorScheme: 'primary' as const, label: 'Not configured' };

  const ssoButtonLabel =
    c.status === 'active' || c.status === 'inactive'
      ? 'Manage SSO'
      : c.status === 'in_progress'
        ? 'Continue configuration'
        : 'Start configuration';

  return (
    <SecurityPageOverview progress={{ completed: configuredCount, total: 4 }}>
      <Col sx={t => ({ gap: t.space.$6 })}>
        <Col sx={t => ({ gap: t.space.$4 })}>
          <Text
            as='p'
            colorScheme='secondary'
            sx={t => ({ fontSize: t.fontSizes.$sm })}
          >
            Required first · complete in order
          </Text>

          <ChecklistRow
            isComplete={domainsReady}
            title='Domains'
            badge={
              domainsReady
                ? { colorScheme: 'success', label: 'Verified' }
                : domains.length > 0
                  ? { colorScheme: 'warning', label: 'In progress' }
                  : { colorScheme: 'primary', label: 'Not configured' }
            }
            subtitle={domainsSubtitle}
            buttonLabel={domainsReady ? 'Manage domains' : domains.length > 0 ? 'Continue setup' : 'Add domains'}
            onClick={() => setView('domains')}
          />

          <ChecklistRow
            isComplete={providerSelected}
            title='Identity provider'
            badge={
              providerSelected
                ? { colorScheme: 'success', label: 'Connected' }
                : { colorScheme: 'primary', label: 'Not selected' }
            }
            subtitle={providerName ?? 'Select the identity provider your organization uses'}
            buttonLabel={providerSelected ? 'Change provider' : 'Select provider'}
            isDisabled={!domainsReady}
            disabledHint='Verify a domain first'
            onClick={() => setView('idpSelect')}
          />
        </Col>

        <Grid
          gap={4}
          sx={{
            gridTemplateColumns: 'repeat(2, 1fr)',
            alignItems: 'stretch',
            [mqu.md]: { gridTemplateColumns: '1fr' },
          }}
        >
          <FeatureCard
            requirementsMet={prerequisitesMet}
            title='SSO'
            badge={ssoStatusBadge}
            description={`Require members with a matching email domain to sign in through ${providerName ?? 'your identity provider'}.`}
            buttonLabel={ssoButtonLabel}
            isPrimaryAction={prerequisitesMet && !isSsoActive}
            onClick={() => openWizard(c.status === 'unconfigured')}
          />

          <FeatureCard
            requirementsMet={prerequisitesMet}
            title='Directory Sync'
            badge={
              isDirSyncActive
                ? { colorScheme: 'success', label: 'Active' }
                : { colorScheme: 'primary', label: 'Not configured' }
            }
            description={`Automatically add, update, and remove members from ${providerName ?? 'your identity provider'}'s directory.`}
            buttonLabel={isDirSyncActive ? 'Manage Directory Sync' : 'Set up Directory Sync'}
            isPrimaryAction={false}
            onClick={() => setView('directorySync')}
          />
        </Grid>
      </Col>
    </SecurityPageOverview>
  );
};

type SectionBadge = { colorScheme: 'success' | 'warning' | 'danger' | 'primary'; label: string };

/**
 * PROTOTYPE ONLY — one prerequisite row in the ordered setup checklist:
 * completion tick, title + status badge, context line, and the flow's action.
 */
const ChecklistRow = ({
  isComplete,
  title,
  badge,
  subtitle,
  buttonLabel,
  isDisabled = false,
  disabledHint,
  onClick,
}: {
  isComplete: boolean;
  title: string;
  badge: SectionBadge;
  subtitle: string;
  buttonLabel: string;
  isDisabled?: boolean;
  disabledHint?: string;
  onClick: () => void;
}): JSX.Element => (
  <Flex
    align='start'
    sx={t => ({ gap: t.space.$4 })}
  >
    <Flex
      align='center'
      justify='center'
      sx={t => ({
        width: t.sizes.$7,
        height: t.sizes.$7,
        flexShrink: 0,
        borderRadius: t.radii.$circle,
        borderWidth: t.borderWidths.$normal,
        borderStyle: t.borderStyles.$solid,
        borderColor: isComplete ? t.colors.$success500 : t.colors.$borderAlpha150,
        color: t.colors.$success500,
      })}
      aria-hidden
    >
      {isComplete && (
        <Icon
          icon={Checkmark}
          sx={t => ({ width: t.sizes.$3x5, height: t.sizes.$3x5 })}
        />
      )}
    </Flex>

    <Col sx={t => ({ gap: t.space.$2, minWidth: 0, opacity: isDisabled ? 0.6 : 1 })}>
      <Flex
        align='center'
        sx={t => ({ gap: t.space.$2 })}
      >
        <Text
          as='p'
          variant='h3'
        >
          {title}
        </Text>
        <Badge colorScheme={badge.colorScheme}>{badge.label}</Badge>
      </Flex>

      <Text
        as='p'
        colorScheme='secondary'
        sx={t => ({ fontSize: t.fontSizes.$sm })}
      >
        {isDisabled && disabledHint ? disabledHint : subtitle}
      </Text>

      <Button
        variant='bordered'
        colorScheme='secondary'
        size='sm'
        isDisabled={isDisabled}
        onClick={onClick}
        sx={{ alignSelf: 'flex-start' }}
      >
        {buttonLabel}
      </Button>
    </Col>
  </Flex>
);

/**
 * PROTOTYPE ONLY — one dependent-feature card (SSO / Directory Sync), gated on
 * the prerequisite checklist above it.
 */
const FeatureCard = ({
  requirementsMet,
  title,
  badge,
  description,
  buttonLabel,
  isPrimaryAction,
  onClick,
}: {
  requirementsMet: boolean;
  title: string;
  badge: SectionBadge;
  description: string;
  buttonLabel: string;
  isPrimaryAction: boolean;
  onClick: () => void;
}): JSX.Element => (
  <Col
    sx={t => ({
      gap: t.space.$3,
      padding: t.space.$5,
      borderRadius: t.radii.$lg,
      borderWidth: t.borderWidths.$normal,
      borderStyle: t.borderStyles.$solid,
      borderColor: t.colors.$borderAlpha150,
      opacity: requirementsMet ? 1 : 0.7,
    })}
  >
    <Flex
      align='center'
      sx={t => ({ gap: t.space.$1x5 })}
    >
      <Text
        as='span'
        sx={t => ({
          fontSize: t.fontSizes.$sm,
          color: requirementsMet ? t.colors.$success500 : t.colors.$colorMutedForeground,
        })}
      >
        Requires domains + identity provider {requirementsMet ? '✓ met' : '· not met'}
      </Text>
    </Flex>

    <Flex
      align='center'
      sx={t => ({ gap: t.space.$2 })}
    >
      <Text
        as='p'
        variant='h3'
      >
        {title}
      </Text>
      <Badge colorScheme={badge.colorScheme}>{badge.label}</Badge>
    </Flex>

    <Text
      as='p'
      colorScheme='secondary'
      sx={{ flex: 1 }}
    >
      {description}
    </Text>

    <Button
      variant={isPrimaryAction ? 'solid' : 'bordered'}
      colorScheme={isPrimaryAction ? 'primary' : 'secondary'}
      size='sm'
      isDisabled={!requirementsMet}
      onClick={onClick}
      sx={{ alignSelf: 'flex-start' }}
    >
      {buttonLabel}
    </Button>
  </Col>
);

/**
 * The overview's stable page chrome — the security `ProfileCard.Page` and its
 * "Security" header. Both the settled overview and the on-mount loading state
 * render through this, so the section body is the only thing that swaps in.
 *
 * `fillHeight` grows the page to the scroll box so the loading state's spinner
 * can center in the remaining height beneath the header.
 */
const SecurityPageOverview = ({
  children,
  fillHeight = false,
  progress,
}: {
  children: React.ReactNode;
  fillHeight?: boolean;
  /** PROTOTYPE ONLY — "N of M configured" counter + progress track. */
  progress?: { completed: number; total: number };
}): JSX.Element => (
  <ProfileCard.Page sx={fillHeight ? { flex: 1 } : undefined}>
    <Col
      elementDescriptor={descriptors.page}
      sx={t => ({ gap: t.space.$8, ...(fillHeight && { flex: 1 }) })}
    >
      <Col
        elementDescriptor={descriptors.profilePage}
        elementId={descriptors.profilePage.setId('organizationSecurity')}
        sx={fillHeight ? { flex: 1 } : undefined}
      >
        <Header.Root>
          <Flex
            align='center'
            sx={t => ({ gap: t.space.$3, marginBottom: progress ? t.space.$2 : t.space.$4 })}
          >
            <Header.Title
              localizationKey={localizationKeys('organizationProfile.securityPage.title')}
              textVariant='h2'
            />
            {progress && (
              <>
                <Text
                  as='span'
                  colorScheme='secondary'
                  sx={t => ({ fontSize: t.fontSizes.$sm })}
                >
                  {progress.completed} of {progress.total} configured
                </Text>
                <Badge colorScheme='warning'>Prototype</Badge>
              </>
            )}
          </Flex>

          {progress && (
            <Box
              sx={t => ({
                height: t.sizes.$1,
                borderRadius: t.radii.$sm,
                backgroundColor: t.colors.$neutralAlpha100,
                overflow: 'hidden',
                marginBottom: t.space.$6,
              })}
              aria-hidden
            >
              <Box
                sx={t => ({
                  height: '100%',
                  width: `${Math.round((progress.completed / progress.total) * 100)}%`,
                  borderRadius: t.radii.$sm,
                  backgroundColor: t.colors.$colorForeground,
                  transition: 'width 200ms ease',
                })}
              />
            </Box>
          )}
        </Header.Root>
        {children}
      </Col>
    </Col>
  </ProfileCard.Page>
);

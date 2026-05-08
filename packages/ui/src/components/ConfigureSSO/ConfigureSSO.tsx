import { __internal_useUserEnterpriseConnections, useSession, useUser } from '@clerk/shared/react';
import type { __experimental_ConfigureSSOProps } from '@clerk/shared/types';
import React from 'react';

import { useProtect } from '@/common';
import { useEnvironment, withCoreUserGuard } from '@/contexts';
import {
  Box,
  Col,
  descriptors,
  Flex,
  Flow,
  Heading,
  Icon,
  localizationKeys,
  Text,
  useAppearance,
} from '@/customizables';
import { ApplicationLogo } from '@/elements/ApplicationLogo';
import { withCardStateProvider } from '@/elements/contexts';
import { NavBar, NavbarContextProvider } from '@/elements/Navbar';
import { ProfileCard } from '@/elements/ProfileCard';
import { BoxIcon, ExclamationTriangle } from '@/icons';
import { Route, Switch } from '@/router';

import { ConfigureSSOFlowProvider, useConfigureSSOFlow } from './ConfigureSSOContext';
import {
  ConfigureCreateApp,
  ConfirmationStep,
  ProvideEmail,
  SelectProviderStep,
  TestConfigurationStep,
  VerifyDomainStep,
} from './steps';
import { ConfigureSSOWizard } from './wizard';

const ConfigureSSOInternal = () => {
  return (
    <Flow.Root flow='configureSSO'>
      <Switch>
        <Route>
          <AuthenticatedContent />
        </Route>
      </Switch>
    </Flow.Root>
  );
};

const AuthenticatedContent = withCoreUserGuard(() => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const { applicationName, logoImageUrl } = useEnvironment().displayConfig;
  const { organizationSettings } = useEnvironment();
  const { parsedOptions } = useAppearance();
  const hasLogo = Boolean(parsedOptions.logoImageUrl || logoImageUrl);

  const { session } = useSession();
  const hasActiveOrganization = Boolean(session?.lastActiveOrganizationId);

  // Gate the entire wizard behind the org-level permission. `useProtect`
  // must be called unconditionally to satisfy the rules of hooks; we
  // combine its result with `hasActiveOrganization` afterwards
  const hasManagePermission = useProtect({
    permission: 'org:sys_enterprise_connections:manage',
  });
  const canManageEnterpriseConnections = hasActiveOrganization && hasManagePermission;

  const {
    data: enterpriseConnections,
    isLoading: isLoadingEnterpriseConnections,
    createEnterpriseConnection,
    updateEnterpriseConnection,
    deleteEnterpriseConnection,
    revalidate: revalidateEnterpriseConnections,
  } = __internal_useUserEnterpriseConnections({
    enabled: true,
  });
  // Currently FAPI only supports one enterprise connection per user
  const enterpriseConnection = enterpriseConnections?.[0];

  return (
    <ProfileCard.Root
      sx={t => ({ display: 'grid', gridTemplateColumns: '1fr 3fr', height: t.sizes.$176, overflow: 'hidden' })}
    >
      <NavbarContextProvider contentRef={contentRef}>
        <NavBar
          headerAboveTitle={
            <Flex
              align='center'
              sx={t => ({
                gap: t.space.$2,
                padding: `${t.space.$none} ${t.space.$3}`,
                maxWidth: '100%',
              })}
            >
              {hasLogo ? (
                <ApplicationLogo
                  sx={t => ({ width: t.space.$9, height: t.space.$9, borderRadius: t.radii.$md, overflow: 'hidden' })}
                />
              ) : (
                <Box
                  sx={t => ({
                    width: t.space.$9,
                    height: t.space.$9,
                    flexShrink: 0,
                    borderRadius: t.radii.$md,
                    backgroundColor: t.colors.$primary500,
                    color: t.colors.$colorPrimaryForeground,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  })}
                  aria-hidden
                >
                  <Icon
                    icon={BoxIcon}
                    sx={t => ({ width: t.sizes.$4, height: t.sizes.$4 })}
                  />
                </Box>
              )}

              <Col sx={{ minWidth: 0 }}>
                <Text
                  as='p'
                  truncate
                >
                  {applicationName}
                </Text>
                {organizationSettings.enabled && <OrganizationSidebarSubtitle />}
              </Col>
            </Flex>
          }
          titleSx={t => ({ fontSize: t.fontSizes.$lg })}
          title={localizationKeys('configureSSO.navbar.title')}
          routes={[]}
          contentRef={contentRef}
        />
        <Col
          ref={contentRef}
          elementDescriptor={descriptors.scrollBox}
          sx={t => ({
            backgroundColor: t.colors.$colorBackground,
            position: 'relative',
            borderRadius: t.radii.$lg,
            width: '100%',
            overflow: 'hidden',
            borderWidth: t.borderWidths.$normal,
            borderStyle: t.borderStyles.$solid,
            borderColor: t.colors.$borderAlpha150,
            marginBlock: '-1px',
            marginInlineEnd: '-1px',
            flex: 1,
          })}
        >
          {canManageEnterpriseConnections || !hasActiveOrganization ? (
            <ConfigureSSOFlowProvider
              enterpriseConnection={enterpriseConnection}
              isLoading={isLoadingEnterpriseConnections}
              createEnterpriseConnection={createEnterpriseConnection}
              updateEnterpriseConnection={updateEnterpriseConnection}
              deleteEnterpriseConnection={deleteEnterpriseConnection}
              revalidate={revalidateEnterpriseConnections}
            >
              <ConfigureSSOSteps />
            </ConfigureSSOFlowProvider>
          ) : (
            <NoPermission />
          )}
        </Col>
      </NavbarContextProvider>
    </ProfileCard.Root>
  );
});

const ConfigureSSOSteps = () => {
  const { user } = useUser();
  const { enterpriseConnection } = useConfigureSSOFlow();

  const hasEmailAddress = Boolean(user?.emailAddresses?.length);
  // The provider can only be picked once; if a connection already
  // exists for this user we drop the step from the wizard entirely
  // so it never shows in the breadcrumb and is not routable
  const hasEnterpriseConnection = Boolean(enterpriseConnection);

  return (
    <ConfigureSSOWizard>
      {!hasEnterpriseConnection && (
        <ConfigureSSOWizard.Step
          id='select-provider'
          path='select-provider'
          label='Select provider'
          hideFromBreadcrumb
        >
          <SelectProviderStep />
        </ConfigureSSOWizard.Step>
      )}
      <ConfigureSSOWizard.Step
        id='verify-email-domain'
        path='verify-email-domain'
        label='Verify domain'
      >
        <ConfigureSSOWizard>
          {!hasEmailAddress && (
            <ConfigureSSOWizard.Step
              id='provide-email'
              path='provide-email'
            >
              <ProvideEmail />
            </ConfigureSSOWizard.Step>
          )}
          <ConfigureSSOWizard.Step
            id='verify-domain'
            path='verify-domain'
          >
            <VerifyDomainStep />
          </ConfigureSSOWizard.Step>
        </ConfigureSSOWizard>
      </ConfigureSSOWizard.Step>
      <ConfigureSSOWizard.Step
        id='configure'
        path='configure'
        label='Configure'
      >
        <ConfigureCreateApp />
      </ConfigureSSOWizard.Step>
      <ConfigureSSOWizard.Step
        id='test'
        path='test'
        label='Test'
      >
        <TestConfigurationStep />
      </ConfigureSSOWizard.Step>
      <ConfigureSSOWizard.Step
        id='confirmation'
        path='confirmation'
        label='Confirmation'
      >
        <ConfirmationStep />
      </ConfigureSSOWizard.Step>
    </ConfigureSSOWizard>
  );
};

const OrganizationSidebarSubtitle = () => {
  // Resolve the active org's name without `useOrganization()` (which
  // would subscribe to the organization resource). The active id lives
  // on the session, and the user already carries the matching
  // membership eagerly, so we can join the two without an extra fetch
  const { user } = useUser();
  const { session } = useSession();
  const activeOrganizationId = session?.lastActiveOrganizationId ?? null;
  const activeOrganization = activeOrganizationId
    ? user?.organizationMemberships.find(m => m.organization.id === activeOrganizationId)?.organization
    : undefined;

  if (!activeOrganization) {
    return null;
  }

  return (
    <Text
      as='span'
      truncate
      sx={t => ({ color: t.colors.$colorMutedForeground })}
    >
      {activeOrganization.name}
    </Text>
  );
};

/**
 * Rendered in place of the wizard when the user lacks the
 * `org:sys_enterprise_connections:manage` permission. The outer
 * sidebar / title chrome stays the same; only the body changes
 */
const NoPermission = () => (
  <Flex
    align='center'
    justify='center'
    sx={t => ({ flex: 1, padding: t.space.$8 })}
  >
    <Col
      align='center'
      sx={t => ({ gap: t.space.$2, textAlign: 'center', maxWidth: t.sizes.$66 })}
    >
      <Icon
        icon={ExclamationTriangle}
        sx={t => ({ width: t.sizes.$8, height: t.sizes.$8, color: t.colors.$neutralAlpha600 })}
      />
      <Heading
        textVariant='h1'
        sx={t => ({ color: t.colors.$colorForeground, fontSize: t.fontSizes.$sm })}
      >
        You do not have permission to manage enterprise connections
      </Heading>
      <Text
        as='p'
        variant='body'
        sx={t => ({ color: t.colors.$colorMutedForeground })}
      >
        Contact your organization administrator in order to have permissions to manage enterprise connections.
      </Text>
    </Col>
  </Flex>
);

export const ConfigureSSO: React.ComponentType<__experimental_ConfigureSSOProps> =
  withCardStateProvider(ConfigureSSOInternal);

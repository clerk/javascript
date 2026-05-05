import { __internal_useUserEnterpriseConnections, useOrganization } from '@clerk/shared/react';
import type { __experimental_ConfigureSSOProps } from '@clerk/shared/types';
import React from 'react';

import { useEnvironment, withCoreUserGuard } from '@/contexts';
import {
  Box,
  Col,
  descriptors,
  Flex,
  Flow,
  Icon,
  localizationKeys,
  Spinner,
  Text,
  useAppearance,
} from '@/customizables';
import { ApplicationLogo } from '@/elements/ApplicationLogo';
import { withCardStateProvider } from '@/elements/contexts';
import { NavBar, NavbarContextProvider } from '@/elements/Navbar';
import { ProfileCard } from '@/elements/ProfileCard';
import { Wizard } from '@/elements/Wizard';
import { BoxIcon } from '@/icons';
import { Route, Switch } from '@/router';

import { ConfigureSSOFlowProvider, useConfigureSSOFlow } from './ConfigureSSOContext';
import { CONFIGURE_SSO_STEPS } from './constants';

const ConfigureSSOInternal = () => {
  return (
    <Flow.Root flow='configureSSO'>
      <Flow.Part>
        <Switch>
          <Route>
            <AuthenticatedContent />
          </Route>
        </Switch>
      </Flow.Part>
    </Flow.Root>
  );
};

const AuthenticatedContent = withCoreUserGuard(() => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const { applicationName, logoImageUrl } = useEnvironment().displayConfig;
  const { organizationSettings } = useEnvironment();
  const { parsedOptions } = useAppearance();
  const hasLogo = Boolean(parsedOptions.logoImageUrl || logoImageUrl);

  const { data: enterpriseConnections, isLoading: isLoadingEnterpriseConnections } =
    __internal_useUserEnterpriseConnections({ enabled: true });
  // Currently FAPI only supports one enterprise connection per user
  const enterpriseConnection = enterpriseConnections?.[0];

  return (
    <ProfileCard.Root
      sx={t => ({ display: 'grid', gridTemplateColumns: '1fr 3fr', height: t.sizes.$176, overflow: 'hidden' })}
    >
      <NavbarContextProvider contentRef={contentRef}>
        <NavBar
          header={
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
          {isLoadingEnterpriseConnections ? (
            <Flex
              align='center'
              justify='center'
              sx={{ flex: 1 }}
            >
              <Spinner
                size='lg'
                colorScheme='primary'
                elementDescriptor={descriptors.spinner}
              />
            </Flex>
          ) : (
            <ConfigureSSOFlowProvider enterpriseConnection={enterpriseConnection}>
              <ConfigureSSOWizardPanel />
            </ConfigureSSOFlowProvider>
          )}
        </Col>
      </NavbarContextProvider>
    </ProfileCard.Root>
  );
});

const ConfigureSSOWizardPanel = () => {
  const data = useConfigureSSOFlow();

  return (
    <Wizard.Root
      steps={CONFIGURE_SSO_STEPS}
      data={data}
    >
      <Wizard.Header />
      <Wizard.Content />
      <Wizard.Footer />
    </Wizard.Root>
  );
};

const OrganizationSidebarSubtitle = () => {
  const { organization } = useOrganization();

  if (!organization) {
    return null;
  }

  return (
    <Text
      as='span'
      truncate
      sx={t => ({ color: t.colors.$colorMutedForeground })}
    >
      {organization?.name}
    </Text>
  );
};

export const ConfigureSSO: React.ComponentType<__experimental_ConfigureSSOProps> =
  withCardStateProvider(ConfigureSSOInternal);

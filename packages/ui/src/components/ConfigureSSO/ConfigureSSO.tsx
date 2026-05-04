import type { __experimental_ConfigureSSOProps } from '@clerk/shared/types';
import React from 'react';

import { useEnvironment, withCoreUserGuard } from '@/contexts';
import { Col, Flex, Flow, localizationKeys, Text } from '@/customizables';
import { ApplicationLogo } from '@/elements/ApplicationLogo';
import { withCardStateProvider } from '@/elements/contexts';
import { NavBar, NavbarContextProvider } from '@/elements/Navbar';
import { ProfileCard } from '@/elements/ProfileCard';
import { Route, Switch } from '@/router';
import { useOrganization } from '@clerk/shared/react/index';

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
  const { applicationName } = useEnvironment().displayConfig;
  const { organizationSettings } = useEnvironment();

  return (
    <ProfileCard.Root
      sx={t => ({ display: 'grid', gridTemplateColumns: '1fr 3fr', height: t.sizes.$176, overflow: 'hidden' })}
    >
      <NavbarContextProvider contentRef={contentRef}>
        <NavBar
          header={
            <Flex
              sx={t => ({
                gap: t.space.$2,
                padding: `${t.space.$none} ${t.space.$3}`,
                maxWidth: '100%',
              })}
            >
              <ApplicationLogo
                sx={t => ({ width: t.space.$9, height: t.space.$9, borderRadius: t.radii.$md, overflow: 'hidden' })}
              />

              <Col sx={t => ({ gap: t.space.$0x5, minWidth: 0 })}>
                <Text
                  as='p'
                  truncate
                >
                  {applicationName}
                </Text>
                {organizationSettings.enabled && <OrganizationSubtitle />}
              </Col>
            </Flex>
          }
          titleSx={t => ({ fontSize: t.fontSizes.$lg })}
          title={localizationKeys('configureSSO.navbar.title')}
          routes={[]}
          contentRef={contentRef}
        />
        <ProfileCard.Content contentRef={contentRef} />
      </NavbarContextProvider>
    </ProfileCard.Root>
  );
});

const OrganizationSubtitle = () => {
  const { organization } = useOrganization();
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

import { useSession } from '@clerk/shared/react';
import type { ConfigureSSOProps } from '@clerk/shared/types';
import React from 'react';

import { useProtect } from '@/common';
import { withCoreUserGuard } from '@/contexts';
import { Col, Flex, Flow, Heading, Icon, localizationKeys, Text } from '@/customizables';
import { withCardStateProvider } from '@/elements/contexts';
import { ProfileCard } from '@/elements/ProfileCard';
import { ExclamationTriangle } from '@/icons';
import { Route, Switch } from '@/router';

import { ConfigureSSOProvider, useConfigureSSO } from './ConfigureSSOContext';
import { ConfigureSSOHeader } from './ConfigureSSOHeader';
import { ConfigureSSONavbar } from './ConfigureSSONavbar';
import { ConfigureSSOSkeleton } from './ConfigureSSOSkeleton';
import { useConfigureSSOData } from './data/useConfigureSSOData';
import { ProfileCardFooter, ProfileCardHeader } from './elements/ProfileCard';
import { Step } from './elements/Step';
import { useMachine } from './elements/useMachine';
import { WizardMachineProvider } from './elements/WizardMachineContext';
import { STEP_BODIES } from './machine/stepBodies';

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

  return (
    <ProfileCard.Root
      sx={t => ({ display: 'grid', gridTemplateColumns: '1fr 3fr', height: t.sizes.$176, overflow: 'hidden' })}
    >
      <ConfigureSSONavbar contentRef={contentRef}>
        <ConfigureSSOContent contentRef={contentRef} />
      </ConfigureSSONavbar>
    </ProfileCard.Root>
  );
});

export const ConfigureSSOContent = ({ contentRef }: { contentRef: React.RefObject<HTMLDivElement> }) => {
  const { isLoading, enterpriseConnection, facts, refreshTestRuns, mutations, primaryEmailAddress } =
    useConfigureSSOData();

  // Gate loading one level above the provider so the context never observes a
  // loading state.
  if (isLoading) {
    return <ConfigureSSOSkeleton />;
  }

  return (
    <ConfigureSSOProtect>
      <ConfigureSSOProvider
        facts={facts}
        refreshTestRuns={refreshTestRuns}
        enterpriseConnection={enterpriseConnection}
        contentRef={contentRef}
        mutations={mutations}
        primaryEmailAddress={primaryEmailAddress}
      >
        <ConfigureSSOSteps />
      </ConfigureSSOProvider>
    </ConfigureSSOProtect>
  );
};

/**
 * The wizard surface, driven by the pure state machine.
 *
 * `useMachine(facts)` owns where we are (`machine.current`) and how we got
 * there; the only view edge is `STEP_BODIES[machine.current]`, which mounts the
 * body for the active step. The machine is published via `WizardMachineProvider`
 * (a sibling to `ConfigureSSOProvider`, mounted at the same level — no inner
 * provider) so the header, footer, and steps read it.
 *
 * Steps no longer own routing: simple steps advance via `Step.Footer.Submit` ->
 * `useSubmitRunner` -> `dispatch`, and the nested-delegating steps
 * (verify-domain, configure) bubble their inner terminal step into the machine
 * through an injected `onComplete`.
 */
const ConfigureSSOSteps = () => {
  const { facts } = useConfigureSSO();
  const machine = useMachine(facts);

  const Body = STEP_BODIES[machine.current];

  return (
    <WizardMachineProvider machine={machine}>
      <ConfigureSSOHeader />
      <Body />
    </WizardMachineProvider>
  );
};

const ConfigureSSOProtect = ({ children }: { children: React.ReactNode }) => {
  const { session } = useSession();
  const isPersonalWorkspace = !session?.lastActiveOrganizationId;
  const canManageEnterpriseConnections = useProtect(
    has => isPersonalWorkspace || has({ permission: 'org:sys_entconns:manage' }),
  );

  if (!canManageEnterpriseConnections) {
    return <MissingManageEnterpriseConnectionsPermission />;
  }

  return children;
};

const MissingManageEnterpriseConnectionsPermission = () => (
  <>
    <ProfileCardHeader />

    <Step.Body>
      <Step.Section
        sx={{ flex: 1 }}
        align='center'
        justify='center'
      >
        <Flex
          align='center'
          justify='center'
          sx={t => ({ flex: 1, padding: t.space.$8 })}
        >
          <Col
            align='center'
            sx={t => ({ gap: t.space.$2, textAlign: 'center', maxWidth: t.sizes.$94 })}
          >
            <Icon
              icon={ExclamationTriangle}
              sx={t => ({ width: t.sizes.$8, height: t.sizes.$8, color: t.colors.$neutralAlpha600 })}
            />
            <Heading
              localizationKey={localizationKeys('configureSSO.missingManageEnterpriseConnectionsPermission.title')}
              textVariant='h1'
              sx={t => ({ fontSize: t.fontSizes.$lg, textWrap: 'balance' })}
            />
            <Text
              as='p'
              variant='body'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.missingManageEnterpriseConnectionsPermission.subtitle')}
              sx={{ textWrap: 'balance' }}
            />
          </Col>
        </Flex>
      </Step.Section>
    </Step.Body>

    <ProfileCardFooter />
  </>
);

export const ConfigureSSO: React.ComponentType<ConfigureSSOProps> = withCardStateProvider(ConfigureSSOInternal);

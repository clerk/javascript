import {
  __internal_useEnterpriseConnectionTestRuns,
  __internal_useUserEnterpriseConnections,
  useSession,
} from '@clerk/shared/react';
import type { __experimental_ConfigureSSOProps, EnterpriseConnectionResource } from '@clerk/shared/types';
import React from 'react';

import { useProtect } from '@/common';
import { withCoreUserGuard } from '@/contexts';
import { Col, descriptors, Flex, Flow, Heading, Icon, localizationKeys, Text } from '@/customizables';
import { useCardState, withCardStateProvider } from '@/elements/contexts';
import { ProfileCard } from '@/elements/ProfileCard';
import { ExclamationTriangle } from '@/icons';
import { Route, Switch } from '@/router';

import { ConfigureSSOProvider, useConfigureSSO } from './ConfigureSSOContext';
import { ConfigureSSOHeader } from './ConfigureSSOHeader';
import { ConfigureSSONavbar } from './ConfigureSSONavbar';
import { ConfigureSSOSkeleton } from './ConfigureSSOSkeleton';
import { ProfileCardFooter, ProfileCardHeader } from './elements/ProfileCard';
import { Step } from './elements/Step';
import { useWizard, Wizard } from './elements/Wizard';
import { ConfigureStep, ConfirmationStep, SelectProviderStep, TestConfigurationStep, VerifyDomainStep } from './steps';

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
            flex: 1,
          })}
        >
          <ConfigureSSOCardProtect>
            <ConfigureSSOCardContent contentRef={contentRef} />
          </ConfigureSSOCardProtect>
        </Col>
      </ConfigureSSONavbar>
    </ProfileCard.Root>
  );
});

const ConfigureSSOCardContent = ({ contentRef }: { contentRef: React.RefObject<HTMLDivElement> }) => {
  const {
    data: enterpriseConnections,
    isLoading: isLoadingEnterpriseConnections,
    createEnterpriseConnection,
    updateEnterpriseConnection,
    deleteEnterpriseConnection,
  } = __internal_useUserEnterpriseConnections({ enabled: true });
  // Currently FAPI only supports one enterprise connection per user
  const enterpriseConnection = enterpriseConnections?.[0];

  const { hasSuccessfulTestRun, isLoading: isLoadingTestRuns } = useHasSuccessfulTestRun(enterpriseConnection);

  const isLoading = isLoadingEnterpriseConnections || isLoadingTestRuns;
  if (isLoading) {
    return <ConfigureSSOSkeleton />;
  }

  return (
    <ConfigureSSOProvider
      hasSuccessfulTestRun={hasSuccessfulTestRun}
      enterpriseConnection={enterpriseConnection}
      contentRef={contentRef}
      createEnterpriseConnection={createEnterpriseConnection}
      updateEnterpriseConnection={updateEnterpriseConnection}
      deleteEnterpriseConnection={deleteEnterpriseConnection}
    >
      <ConfigureSSOSteps />
    </ConfigureSSOProvider>
  );
};

const ConfigureSSOSteps = () => {
  const { initialStepId } = useConfigureSSO();

  return (
    <Wizard initialStepId={initialStepId}>
      <ResetCardErrorOnStepChange />
      <ConfigureSSOHeader />

      <Wizard.Step id='select-provider'>
        <SelectProviderStep />
      </Wizard.Step>

      <Wizard.Step
        id='verify-domain'
        label='Verify domain'
      >
        <VerifyDomainStep />
      </Wizard.Step>

      <Wizard.Step
        id='configure'
        label='Configure'
      >
        <ConfigureStep />
      </Wizard.Step>

      <Wizard.Step
        id='test'
        label='Test'
      >
        <TestConfigurationStep />
      </Wizard.Step>

      <Wizard.Step
        id='confirmation'
        label='Confirmation'
      >
        <ConfirmationStep />
      </Wizard.Step>
    </Wizard>
  );
};

const ConfigureSSOCardProtect = ({ children }: { children: React.ReactNode }) => {
  const { session } = useSession();
  const isPersonalWorkspace = !session?.lastActiveOrganizationId;
  const canManageEnterpriseConnections = useProtect(
    has => isPersonalWorkspace || has({ permission: 'org:sys_enterprise_connections:manage' }),
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

/**
 * Sentinel component rendered inside `<Wizard>`
 *
 * Clears any card-level error whenever the active step transitions, so a stale failure from one step
 * doesn't leak into the next
 */
const ResetCardErrorOnStepChange = (): null => {
  const { currentStep } = useWizard();
  const card = useCardState();
  const previousStepIdRef = React.useRef(currentStep?.id);

  React.useEffect(() => {
    if (previousStepIdRef.current === currentStep?.id) {
      return;
    }

    previousStepIdRef.current = currentStep?.id;
    card.setError(undefined);
  }, [currentStep?.id, card]);

  return null;
};

/**
 * Fetches a single successful test run for the given connection on mount
 */
const useHasSuccessfulTestRun = (
  enterpriseConnection: EnterpriseConnectionResource | undefined,
): { hasSuccessfulTestRun: boolean; isLoading: boolean } => {
  const { data: successfulTestRuns, isLoading } = __internal_useEnterpriseConnectionTestRuns({
    enterpriseConnectionId: enterpriseConnection?.id ?? null,
    params: { initialPage: 1, pageSize: 1, status: ['success'] },
  });

  return {
    hasSuccessfulTestRun: (successfulTestRuns?.length ?? 0) > 0,
    isLoading,
  };
};

export const ConfigureSSO: React.ComponentType<__experimental_ConfigureSSOProps> =
  withCardStateProvider(ConfigureSSOInternal);

import { __internal_useUserEnterpriseConnections } from '@clerk/shared/react';
import type { __experimental_ConfigureSSOProps } from '@clerk/shared/types';
import React from 'react';

import { withCoreUserGuard } from '@/contexts';
import { Col, descriptors, Flow } from '@/customizables';
import { withCardStateProvider } from '@/elements/contexts';
import { ProfileCard } from '@/elements/ProfileCard';
import { Route, Switch } from '@/router';

import { ConfigureSSOFlowProvider } from './ConfigureSSOContext';
import { ConfigureSSOHeader } from './ConfigureSSOHeader';
import { ConfigureSSONavbar } from './ConfigureSSONavbar';
import { ConfigureSSOSkeleton } from './ConfigureSSOSkeleton';
import { Wizard } from './elements/Wizard';
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
          <ConfigureSSOCardContent />
        </Col>
      </ConfigureSSONavbar>
    </ProfileCard.Root>
  );
});

const ConfigureSSOCardContent = () => {
  const { data: enterpriseConnections, isLoading } = __internal_useUserEnterpriseConnections({ enabled: true });
  // Currently FAPI only supports one enterprise connection per user
  const enterpriseConnection = enterpriseConnections?.[0];

  // Initial-load gate at root — wizard never sees isLoading
  if (isLoading && !enterpriseConnection) {
    return <ConfigureSSOSkeleton />;
  }

  return (
    <ConfigureSSOFlowProvider enterpriseConnection={enterpriseConnection}>
      <Wizard initialStepId='configure'>
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
    </ConfigureSSOFlowProvider>
  );
};

export const ConfigureSSO: React.ComponentType<__experimental_ConfigureSSOProps> =
  withCardStateProvider(ConfigureSSOInternal);

import { __internal_useUserEnterpriseConnections, useUser } from '@clerk/shared/react';
import type { __experimental_ConfigureSSOProps } from '@clerk/shared/types';
import React from 'react';

import { withCoreUserGuard } from '@/contexts';
import { descriptors, Flex, Flow, Spinner } from '@/customizables';
import { withCardStateProvider } from '@/elements/contexts';
import { Route, Switch } from '@/router';

import { ConfigureSSOFlowProvider } from './ConfigureSSOContext';
import { ConfigureSSOFooter } from './ConfigureSSOFooter';
import { ConfigureSSOHeader } from './ConfigureSSOHeader';
import { ConfigureSSOLayout } from './ConfigureSSOLayout';
import { FooterActionsProvider, Wizard } from './elements/Wizard';
import { ConfigureCreateApp, ConfirmationStep, ProvideEmail, TestConfigurationStep, VerifyDomainStep } from './steps';

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
  const { data: enterpriseConnections, isLoading } = __internal_useUserEnterpriseConnections({ enabled: true });
  // Currently FAPI only supports one enterprise connection per user
  const enterpriseConnection = enterpriseConnections?.[0];

  // Initial-load gate at root — wizard never sees isLoading
  if (isLoading && !enterpriseConnections) {
    return (
      <ConfigureSSOLayout>
        <Flex
          align='center'
          justify='center'
          sx={{ flex: 1 }}
        >
          <Spinner
            size='xs'
            colorScheme='neutral'
            elementDescriptor={descriptors.spinner}
          />
        </Flex>
      </ConfigureSSOLayout>
    );
  }

  return (
    <ConfigureSSOFlowProvider enterpriseConnection={enterpriseConnection}>
      <FooterActionsProvider>
        <ConfigureSSOLayout>
          <ConfigureSSOHeader />
          <ConfigureSSOSteps />
          <ConfigureSSOFooter />
        </ConfigureSSOLayout>
      </FooterActionsProvider>
    </ConfigureSSOFlowProvider>
  );
});

const ConfigureSSOSteps = () => {
  const { user } = useUser();

  const primaryEmailAddress = user?.primaryEmailAddress;

  return (
    <Wizard>
      <Wizard.Step
        id='verify-email-domain'
        path='verify-email-domain'
        label='Verify domain'
      >
        <Wizard>
          {!primaryEmailAddress && (
            <Wizard.Step
              id='provide-email'
              path='provide-email'
            >
              <ProvideEmail />
            </Wizard.Step>
          )}
          <Wizard.Step
            id='verify-domain'
            path='verify-domain'
          >
            <VerifyDomainStep />
          </Wizard.Step>
        </Wizard>
      </Wizard.Step>
      <Wizard.Step
        id='configure'
        path='configure'
        label='Configure'
      >
        <Wizard>
          {/* TODO: Implement configure steps */}
          <Wizard.Step
            id='create-app'
            path='create-app'
          >
            <ConfigureCreateApp />
          </Wizard.Step>
        </Wizard>
      </Wizard.Step>
      <Wizard.Step
        id='test'
        path='test'
        label='Test'
      >
        <TestConfigurationStep />
      </Wizard.Step>
      <Wizard.Step
        id='confirmation'
        path='confirmation'
        label='Confirmation'
      >
        <ConfirmationStep />
      </Wizard.Step>
    </Wizard>
  );
};

export const ConfigureSSO: React.ComponentType<__experimental_ConfigureSSOProps> =
  withCardStateProvider(ConfigureSSOInternal);

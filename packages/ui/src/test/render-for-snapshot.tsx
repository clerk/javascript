// @ts-nocheck
import { __createClerkTestQueryClient, ClerkInstanceContext } from '@clerk/shared/react';
import { render } from '@testing-library/react';
import React from 'react';

import { Environment } from '@/core/resources';
import { EnvironmentProvider, ModuleManagerProvider, OptionsProvider } from '@/ui/contexts';
import { AppearanceProvider } from '@/ui/customizables';
import { CardStateProvider, FlowMetadataProvider } from '@/ui/elements/contexts';
import { RouteContext } from '@/ui/router';
import { InternalThemeProvider } from '@/ui/styledSystem';
import type { FlowMetadata } from '@/ui/elements/contexts';

import { createBaseEnvironmentJSON } from './fixtures';
import { mockRouteContextValue } from './mock-helpers';

const stubClerk = {
  frontendApi: 'clerk.test.lcl.dev',
  client: null,
  user: null,
  session: null,
  organization: null,
  __internal_last_error: null,
  loaded: true,
} as const;

const stubModuleManager = { import: () => Promise.resolve(undefined) };

let environmentInstance: InstanceType<typeof Environment> | null = null;

function getEnvironment() {
  if (!environmentInstance) {
    environmentInstance = new Environment(createBaseEnvironmentJSON());
  }
  return environmentInstance;
}

const routeContextValue = mockRouteContextValue({});

type SnapshotOptions = {
  flow?: FlowMetadata['flow'];
};

export function renderForSnapshot(ui: React.ReactElement, options: SnapshotOptions = {}) {
  const { flow = 'signIn' } = options;

  __createClerkTestQueryClient();

  return render(
    <ClerkInstanceContext.Provider value={{ value: stubClerk as any }}>
      <ModuleManagerProvider moduleManager={stubModuleManager as any}>
        <EnvironmentProvider value={getEnvironment()}>
          <OptionsProvider value={{}}>
            <RouteContext.Provider value={routeContextValue}>
              <AppearanceProvider appearanceKey={flow}>
                <FlowMetadataProvider flow={flow}>
                  <InternalThemeProvider>
                    <CardStateProvider>{ui}</CardStateProvider>
                  </InternalThemeProvider>
                </FlowMetadataProvider>
              </AppearanceProvider>
            </RouteContext.Provider>
          </OptionsProvider>
        </EnvironmentProvider>
      </ModuleManagerProvider>
    </ClerkInstanceContext.Provider>,
  );
}

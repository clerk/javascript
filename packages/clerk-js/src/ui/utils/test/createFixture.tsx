import { EnvironmentJSON, SignInStatus } from '@clerk/types';
import { jest } from '@jest/globals';
import React from 'react';

import { Environment } from '../../../core/resources';
import { ComponentContext, EnvironmentProvider } from '../../contexts';
import { CoreClerkContextWrapper } from '../../contexts/CoreClerkContextWrapper';
import { AppearanceProvider } from '../../customizables';
import { FlowMetadataProvider } from '../../elements';
import { RouteContext } from '../../router';
import { InternalThemeProvider } from '../../styledSystem';
import { createClerkMockContexts } from './createClerkMockContexts';
import {
  createAuthConfigFixtureHelpers,
  createDisplayConfigFixtureHelpers,
  createOrganizationSettingsFixtureHelpers,
  createUserSettingsFixtureHelpers,
} from './fixtureHelpers';
import { createBaseEnvironmentJSON } from './fixtures';
import { getInitialFixtureConfig } from './mockConfigs';

type UnpackContext<T> = NonNullable<T extends React.Context<infer U> ? U : T>;

const createConfigFParam = (config: any, baseEnvironment: EnvironmentJSON) => {
  return {
    ...createAuthConfigFixtureHelpers(baseEnvironment),
    ...createDisplayConfigFixtureHelpers(baseEnvironment),
    ...createOrganizationSettingsFixtureHelpers(baseEnvironment),
    ...createUserSettingsFixtureHelpers(baseEnvironment),
    ...createUserSettingsFixtureHelpers(baseEnvironment),
    mockSignInCreate: (opts?: { responseStatus: SignInStatus }) => {
      const mockCreate = jest.fn(() => Promise.resolve({ status: opts?.responseStatus }));
      config.client.signIn.create = mockCreate;
      return mockCreate;
    },
    mockRouteNavigate: () => {
      const mockNavigate = jest.fn();
      config.routeContext.navigate = mockNavigate;
      return mockNavigate;
    },
  };
};

type FParam = ReturnType<typeof createConfigFParam>;
type ConfigFn = (f: FParam) => void;

export const createFixture = (componentName: UnpackContext<typeof ComponentContext>['componentName']) => {
  return (configFn?: ConfigFn) => {
    const config = getInitialFixtureConfig();
    const baseEnvironment = createBaseEnvironmentJSON();

    if (configFn) {
      configFn(createConfigFParam(config, baseEnvironment));
    }

    const environmentMock = new Environment(baseEnvironment);

    const { mockedRouteContext, mockedClerk, updateClerkMock } = createClerkMockContexts(config);

    const MockClerkProvider = (props: any) => {
      const { children } = props;
      return (
        <CoreClerkContextWrapper clerk={mockedClerk}>
          <EnvironmentProvider value={environmentMock}>
            <RouteContext.Provider value={mockedRouteContext}>
              <AppearanceProvider appearanceKey={'signIn'}>
                <FlowMetadataProvider flow={componentName as any}>
                  <InternalThemeProvider>
                    <ComponentContext.Provider value={{ componentName }}>{children}</ComponentContext.Provider>
                  </InternalThemeProvider>
                </FlowMetadataProvider>
              </AppearanceProvider>
            </RouteContext.Provider>
          </EnvironmentProvider>
        </CoreClerkContextWrapper>
      );
    };

    return { wrapper: MockClerkProvider, fixtures: config, mockedClerk };
  };
};

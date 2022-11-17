import { EnvironmentJSON, LoadedClerk } from '@clerk/types';
import { jest } from '@jest/globals';
import React from 'react';

import { default as ClerkCtor } from '../../../core/clerk';
import { Client, Environment } from '../../../core/resources';
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
    mockRouteNavigate: () => {
      const mockNavigate = jest.fn();
      config.routeContext.navigate = mockNavigate;
      return mockNavigate;
    },
  };
};

type FParam = ReturnType<typeof createConfigFParam>;
type ConfigFn = (f: FParam) => void;

type DeepJestMocked<T> = T extends object
  ? {
      [k in keyof T]: T[k] extends object ? jest.Mocked<T[k]> : T[k];
    }
  : T;

const mockClerkMethods = (clerk: LoadedClerk): DeepJestMocked<LoadedClerk> => {
  const mockProp = <T,>(obj: T, k: keyof T) => {
    if (typeof obj[k] === 'function') {
      // @ts-ignore
      obj[k] = jest.fn();
    }
  };

  const mockMethodsOf = (obj: any) => {
    Object.keys(obj).forEach(k => mockProp(obj, k));
  };
  mockMethodsOf(clerk.client.signIn);
  mockMethodsOf(clerk.client.signUp);
  mockProp(clerk, 'navigate');
  return clerk as any as DeepJestMocked<LoadedClerk>;
};

export const createFixture = (componentName: UnpackContext<typeof ComponentContext>['componentName']) => {
  return async (configFn?: ConfigFn) => {
    const config = getInitialFixtureConfig();
    const baseEnvironment = createBaseEnvironmentJSON();

    if (configFn) {
      configFn(createConfigFParam(config, baseEnvironment));
    }

    const environmentMock = new Environment(baseEnvironment);
    Environment.getInstance().fetch = jest.fn(() => Promise.resolve(environmentMock));

    // @ts-expect-error
    const clientMock = new Client(null);
    Client.getInstance().fetch = jest.fn(() => Promise.resolve(clientMock));

    // Use a FAPI value for local production instances to avoid triggering the devInit flow during testing
    const frontendApi = 'clerk.abcef.12345.prod.lclclerk.com';
    const tempClerk = new ClerkCtor(frontendApi);
    await tempClerk.load();
    const clerkMock = mockClerkMethods(tempClerk as LoadedClerk);
    const { mockedRouteContext } = createClerkMockContexts(config);

    const fixtures = {
      clerk: clerkMock,
      signIn: clerkMock.client.signIn,
      signUp: clerkMock.client.signUp,
    };

    const MockClerkProvider = (props: any) => {
      const { children } = props;
      return (
        <CoreClerkContextWrapper clerk={clerkMock}>
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

    return { wrapper: MockClerkProvider, fixtures };
  };
};

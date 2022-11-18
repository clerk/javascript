import { ClientJSON, EnvironmentJSON, LoadedClerk } from '@clerk/types';
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
import { createClientFixtureHelpers, createEnvironmentFixtureHelpers } from './fixtureHelpers';
import { createBaseClientJSON, createBaseEnvironmentJSON } from './fixtures';
import { mockClerkMethods, mockRouteContextValue } from './mockHelpers';

type UnpackContext<T> = NonNullable<T extends React.Context<infer U> ? U : T>;

const createInitialStateConfigParam = (baseEnvironment: EnvironmentJSON, baseClient: ClientJSON) => {
  return {
    ...createEnvironmentFixtureHelpers(baseEnvironment),
    ...createClientFixtureHelpers(baseClient),
  };
};

type FParam = ReturnType<typeof createInitialStateConfigParam>;
type ConfigFn = (f: FParam) => void;

export const createFixture = (componentName: UnpackContext<typeof ComponentContext>['componentName']) => {
  return async (configFn?: ConfigFn) => {
    const baseEnvironment = createBaseEnvironmentJSON();
    const baseClient = createBaseClientJSON();

    if (configFn) {
      configFn(createInitialStateConfigParam(baseEnvironment, baseClient));
    }

    const environmentMock = new Environment(baseEnvironment);
    Environment.getInstance().fetch = jest.fn(() => Promise.resolve(environmentMock));

    // @ts-expect-error
    const clientMock = new Client(baseClient);
    Client.getInstance().fetch = jest.fn(() => Promise.resolve(clientMock));

    // Use a FAPI value for local production instances to avoid triggering the devInit flow during testing
    const frontendApi = 'clerk.abcef.12345.prod.lclclerk.com';
    const tempClerk = new ClerkCtor(frontendApi);
    await tempClerk.load();
    const clerkMock = mockClerkMethods(tempClerk as LoadedClerk);

    const routerMock = mockRouteContextValue();

    const fixtures = {
      clerk: clerkMock,
      signIn: clerkMock.client.signIn,
      signUp: clerkMock.client.signUp,
      router: routerMock,
    };

    const MockClerkProvider = (props: any) => {
      const { children } = props;
      return (
        <CoreClerkContextWrapper clerk={clerkMock}>
          <EnvironmentProvider value={environmentMock}>
            <RouteContext.Provider value={routerMock}>
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

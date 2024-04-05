import type { ClerkOptions, ClientJSON, EnvironmentJSON, LoadedClerk } from '@clerk/types';
import { jest } from '@jest/globals';
import React from 'react';

import { Clerk as ClerkCtor } from '../../../core/clerk';
import { Client, Environment } from '../../../core/resources';
import { ComponentContext, CoreClerkContextWrapper, EnvironmentProvider, OptionsProvider } from '../../contexts';
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

class ClerkMap extends Map {
  name = 'clerk-test-map';

  constructor() {
    super();
  }
}

export const bindCreateFixtures = (
  componentName: Parameters<typeof unboundCreateFixtures>[0],
  mockOpts?: {
    router?: Parameters<typeof mockRouteContextValue>[0];
  },
) => {
  const cache = new ClerkMap();

  return {
    createFixtures: unboundCreateFixtures(componentName, mockOpts, cache),
    clearCache: () => {
      cache.clear();
    },
  };
};

const unboundCreateFixtures = <N extends UnpackContext<typeof ComponentContext>['componentName']>(
  componentName: N,
  mockOpts?: {
    router?: Parameters<typeof mockRouteContextValue>[0];
  },
  cache?: Map<any, any>,
) => {
  const createFixtures = async (...configFns: ConfigFn[]) => {
    const baseEnvironment = createBaseEnvironmentJSON();
    const baseClient = createBaseClientJSON();
    configFns = configFns.filter(Boolean);

    if (configFns.length) {
      const fParam = createInitialStateConfigParam(baseEnvironment, baseClient);
      configFns.forEach(configFn => configFn(fParam));
    }

    const environmentMock = new Environment(baseEnvironment);
    Environment.getInstance().fetch = jest.fn(() => Promise.resolve(environmentMock));

    // @ts-expect-error
    const clientMock = new Client(baseClient);
    Client.getInstance().fetch = jest.fn(() => Promise.resolve(clientMock));

    // Use a FAPI value for local production instances to avoid triggering the devInit flow during testing
    const productionPublishableKey = 'pk_live_Y2xlcmsuYWJjZWYuMTIzNDUucHJvZC5sY2xjbGVyay5jb20k';
    const tempClerk = new ClerkCtor(productionPublishableKey);
    await tempClerk.load({
      // @ts-ignore
      cache,
    });
    const clerkMock = mockClerkMethods(tempClerk as LoadedClerk);
    const optionsMock = {} as ClerkOptions;
    const routerMock = mockRouteContextValue(mockOpts?.router || {});

    const fixtures = {
      clerk: clerkMock,
      signIn: clerkMock.client.signIn,
      signUp: clerkMock.client.signUp,
      environment: environmentMock,
      router: routerMock,
      options: optionsMock,
    };

    let componentContextProps: Partial<UnpackContext<typeof ComponentContext> & { componentName: N }>;
    const props = {
      setProps: (props: typeof componentContextProps) => {
        componentContextProps = props;
      },
    };

    const MockClerkProvider = (props: any) => {
      const { children } = props;
      return (
        <CoreClerkContextWrapper
          // @ts-ignore
          clerk={clerkMock}
          // Clear swr cache
          swrConfig={{ provider: () => new Map() }}
        >
          <EnvironmentProvider value={environmentMock}>
            <OptionsProvider value={optionsMock}>
              <RouteContext.Provider value={routerMock}>
                <AppearanceProvider appearanceKey={'signIn'}>
                  <FlowMetadataProvider flow={componentName as any}>
                    <InternalThemeProvider>
                      <ComponentContext.Provider value={{ ...componentContextProps, componentName }}>
                        {children}
                      </ComponentContext.Provider>
                    </InternalThemeProvider>
                  </FlowMetadataProvider>
                </AppearanceProvider>
              </RouteContext.Provider>
            </OptionsProvider>
          </EnvironmentProvider>
        </CoreClerkContextWrapper>
      );
    };

    return { wrapper: MockClerkProvider, fixtures, props };
  };
  createFixtures.config = (fn: ConfigFn) => fn;
  return createFixtures;
};

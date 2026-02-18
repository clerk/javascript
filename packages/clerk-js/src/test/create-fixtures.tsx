import type { ClerkOptions, ClientJSON, EnvironmentJSON, LoadedClerk } from '@clerk/shared/types';
import { useState } from 'react';
import { vi } from 'vitest';

import { Clerk as ClerkCtor } from '@/core/clerk';
import { Client, Environment } from '@/core/resources';
import { ComponentContextProvider, CoreClerkContextWrapper, EnvironmentProvider, OptionsProvider } from '@/ui/contexts';
import { AppearanceProvider } from '@/ui/customizables';
import { FlowMetadataProvider } from '@/ui/elements/contexts';
import { RouteContext } from '@/ui/router';
import { InternalThemeProvider } from '@/ui/styledSystem';
import type { AvailableComponentName, AvailableComponentProps } from '@/ui/types';

import { createClientFixtureHelpers, createEnvironmentFixtureHelpers } from './fixture-helpers';
import { createBaseClientJSON, createBaseEnvironmentJSON } from './fixtures';
import { mockClerkMethods, mockRouteContextValue } from './mock-helpers';

const createInitialStateConfigParam = (baseEnvironment: EnvironmentJSON, baseClient: ClientJSON) => {
  return {
    ...createEnvironmentFixtureHelpers(baseEnvironment),
    ...createClientFixtureHelpers(baseClient),
  };
};

type FParam = ReturnType<typeof createInitialStateConfigParam>;
type ConfigFn = (f: FParam) => void;

export const bindCreateFixtures = (
  componentName: Parameters<typeof unboundCreateFixtures>[0],
  mockOpts?: {
    router?: Parameters<typeof mockRouteContextValue>[0];
  },
) => {
  return { createFixtures: unboundCreateFixtures(componentName, mockOpts) };
};

const unboundCreateFixtures = (
  componentName: AvailableComponentName,
  mockOpts?: {
    router?: Parameters<typeof mockRouteContextValue>[0];
  },
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
    Environment.getInstance().fetch = vi.fn(() => Promise.resolve(environmentMock));

    // @ts-expect-error We cannot mess with the singleton when tests are running in parallel
    const clientMock = new Client(baseClient);
    Client.getOrCreateInstance().fetch = vi.fn(() => Promise.resolve(clientMock));

    // Use a FAPI value for local production instances to avoid triggering the devInit flow during testing
    const productionPublishableKey = 'pk_live_Y2xlcmsuYWJjZWYuMTIzNDUucHJvZC5sY2xjbGVyay5jb20k';
    const tempClerk = new ClerkCtor(productionPublishableKey);
    await tempClerk.load();
    const clerkMock = mockClerkMethods(tempClerk as LoadedClerk);
    const optionsMock = {} as ClerkOptions;
    const routerMock = mockRouteContextValue(mockOpts?.router || {});

    const fixtures = {
      clerk: clerkMock,
      session: clerkMock.session,
      signIn: clerkMock.client.signIn,
      signUp: clerkMock.client.signUp,
      environment: environmentMock,
      router: routerMock,
      options: optionsMock,
    };

    let componentContextProps: AvailableComponentProps;
    const props = {
      setProps: (props: typeof componentContextProps) => {
        componentContextProps = props;
      },
    };

    const MockClerkProvider = (props: any) => {
      const { children } = props;
      const [swrConfig] = useState(() => ({ provider: () => new Map() }));

      const componentsWithoutContext = [
        'UsernameSection',
        'UserProfileSection',
        'SubscriptionDetails',
        'PlanDetails',
        'Checkout',
        'KeylessPrompt',
      ];
      const contextWrappedChildren = !componentsWithoutContext.includes(componentName) ? (
        <ComponentContextProvider
          componentName={componentName}
          props={componentContextProps}
        >
          {children}
        </ComponentContextProvider>
      ) : (
        <>{children}</>
      );

      return (
        <CoreClerkContextWrapper
          clerk={clerkMock}
          // Clear swr cache
          swrConfig={swrConfig}
        >
          <EnvironmentProvider value={environmentMock}>
            <OptionsProvider value={optionsMock}>
              <RouteContext.Provider value={routerMock}>
                <AppearanceProvider appearanceKey={'signIn'}>
                  <FlowMetadataProvider flow={componentName as any}>
                    <InternalThemeProvider>{contextWrappedChildren}</InternalThemeProvider>
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

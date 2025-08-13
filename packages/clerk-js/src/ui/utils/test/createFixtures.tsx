import type { ClerkOptions, ClientJSON, EnvironmentJSON, LoadedClerk } from '@clerk/types';
import { jest } from '@jest/globals';

import { FlowMetadataProvider } from '@/ui/elements/contexts';

import { Clerk as ClerkCtor } from '../../../core/clerk';
import { Client, Environment } from '../../../core/resources';
import {
  ComponentContextProvider,
  CoreClerkContextWrapper,
  EnvironmentProvider,
  OptionsProvider,
} from '../../contexts';
import { AppearanceProvider } from '../../customizables';
import { RouteContext } from '../../router';
import { InternalThemeProvider } from '../../styledSystem';
import type { AvailableComponentName, AvailableComponentProps } from '../../types';
import { createClientFixtureHelpers, createEnvironmentFixtureHelpers } from './fixtureHelpers';
import { createBaseClientJSON, createBaseEnvironmentJSON } from './fixtures';
import { mockClerkMethods, mockRouteContextValue } from './mockHelpers';

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
    Environment.getInstance().fetch = jest.fn(() => Promise.resolve(environmentMock));

    // @ts-expect-error We cannot mess with the singleton when tests are running in parallel
    const clientMock = new Client(baseClient);
    Client.getOrCreateInstance().fetch = jest.fn(() => Promise.resolve(clientMock));

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
      billing: clerkMock.billing,
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

      const componentsWithoutContext = [
        'UsernameSection',
        'UserProfileSection',
        'SubscriptionDetails',
        'PlanDetails',
        'Checkout',
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
          swrConfig={{ provider: () => new Map() }}
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

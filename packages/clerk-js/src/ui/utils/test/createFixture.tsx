import { SignInFactorStrategy } from '@clerk/backend-core/src';
import { getOAuthProviderData, OAuthProvider, SignInStatus } from '@clerk/types';
import { jest } from '@jest/globals';
import React from 'react';

import { ComponentContext, EnvironmentProvider } from '../../contexts';
import { CoreClerkContextWrapper } from '../../contexts/CoreClerkContextWrapper';
import { AppearanceProvider } from '../../customizables';
import { FlowMetadataProvider } from '../../elements';
import { RouteContext } from '../../router';
import { InternalThemeProvider } from '../../styledSystem';
import { createClerkMockContexts } from './createClerkMockContexts';
import { getInitialFixtureConfig } from './mockConfigs';

type FParam = {
  withUsername: () => void;
  withEmailAddress: () => void;
  withPhoneNumber: () => void;
  mockSignInCreate: (opts?: { responseStatus: SignInStatus }) => typeof jest.fn;
  mockRouteNavigate: () => typeof jest.fn;
  withSocialOAuth: (provider: OAuthProvider) => void;
  withAuthFirstFactor: (firstFactorStrategy: SignInFactorStrategy) => void;
};

type ConfigFn = (f: FParam) => void;

type UnpackContext<T> = NonNullable<T extends React.Context<infer U> ? U : T>;

export const createFixture =
  (componentName: UnpackContext<typeof ComponentContext>['componentName']) => (configFn?: ConfigFn) => {
    const config = getInitialFixtureConfig();

    const f = {
      withSocialOAuth: (provider: OAuthProvider) => {
        config.environment.social.push(getOAuthProviderData({ provider }));
      },
      withAuthFirstFactor: (firstFactorStrategy: SignInFactorStrategy) => {
        config.client.signIn.supportedFirstFactors.push({
          strategy: firstFactorStrategy,
        });
      },
      withUsername: () => {
        config.environment.enabledFirstFactorIdentifiers.push({
          identifier: 'username',
          enabled: true,
          required: true,
        });
      },
      withEmailAddress: () => {
        config.environment.enabledFirstFactorIdentifiers.push({
          identifier: 'email_address',
          enabled: true,
          required: true,
        });
      },
      withPhoneNumber: () => {
        config.environment.enabledFirstFactorIdentifiers.push({
          identifier: 'phone_number',
          enabled: true,
          required: true,
        });
      },
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
    } as any as FParam;

    if (configFn) {
      configFn(f);
    }

    const { mockedEnvironment, mockedClerk, mockedRouteContext, updateClerkMock } = createClerkMockContexts(config);

    const MockClerkProvider = (props: any) => {
      const { children } = props;
      return (
        <CoreClerkContextWrapper clerk={mockedClerk}>
          <EnvironmentProvider value={mockedEnvironment}>
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

    return { wrapper: MockClerkProvider, fixtures: config };
  };

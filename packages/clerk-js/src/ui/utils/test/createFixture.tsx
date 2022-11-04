import { SignInStatus } from '@clerk/types';
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
  withGoogleOAuth: () => void;
  withDiscordOAuth: () => void;
  withInstagramOAuth: () => void;
  withAllOAuth: () => void;
  withPhoneCode: () => void;
  mockSignInCreate: (opts?: { responseStatus: SignInStatus }) => typeof jest.fn;
  mockRouteNavigate: () => typeof jest.fn;
};

type ConfigFn = (f: FParam) => void;

export const createFixture = (configFn?: ConfigFn) => {
  const config = getInitialFixtureConfig();
  const f = {
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
    withGoogleOAuth: () => {
      config.environment.social.push({
        oauthProvider: 'oauth_google',
        enabled: true,
        required: true,
      });
    },
    withDiscordOAuth: () => {
      config.environment.social.push({
        oauthProvider: 'oauth_discord',
        enabled: true,
        required: true,
      });
    },
    withInstagramOAuth: () => {
      config.environment.social.push({
        oauthProvider: 'oauth_instagram',
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
              <FlowMetadataProvider flow={'test' as any}>
                <InternalThemeProvider>
                  <ComponentContext.Provider value={{ componentName: 'SignIn' }}>{children}</ComponentContext.Provider>
                </InternalThemeProvider>
              </FlowMetadataProvider>
            </AppearanceProvider>
          </RouteContext.Provider>
        </EnvironmentProvider>
      </CoreClerkContextWrapper>
    );
  };

  return { MockClerkProvider, updateClerkMock };
};

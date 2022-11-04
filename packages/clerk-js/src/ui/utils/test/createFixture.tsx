import React from 'react';

import { ComponentContext, EnvironmentProvider } from '../../contexts';
import { CoreClerkContextWrapper } from '../../contexts/CoreClerkContextWrapper';
import { AppearanceProvider } from '../../customizables';
import { FlowMetadataProvider } from '../../elements';
import { RouteContext } from '../../router';
import { InternalThemeProvider } from '../../styledSystem';
import { createClerkFixture } from './createClerkFeature';
import { getInitialFixtureConfig, initialRouteContextValue } from './mockConfigs';

type FParam = {
  withUsername: () => void;
  withEmailAddress: () => void;
  withPhoneNumber: () => void;
  withGoogleOAuth: () => void;
  withDiscordOAuth: () => void;
  withInstagramOAuth: () => void;
  withAllOAuth: () => void;
  withPhoneCode: () => void;
};

type ConfigFn = (f: FParam) => void;

export const createFixture = (configFn?: ConfigFn) => {
  const routeContextValue = initialRouteContextValue;
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
      // @ts-ignore
      config.environment.social.push({
        oauthProvider: 'oauth_google',
        enabled: true,
        required: true,
      });
    },
    withDiscordOAuth: () => {
      // @ts-ignore
      config.environment.social.push({
        oauthProvider: 'oauth_discord',
        enabled: true,
        required: true,
      });
    },
    withInstagramOAuth: () => {
      // @ts-ignore
      config.environment.social.push({
        oauthProvider: 'oauth_instagram',
        enabled: true,
        required: true,
      });
    },
  } as any as FParam;
  if (configFn) {
    configFn(f);
  }

  const { mockedEnvironment, mockedClerk, updateClerkMock } = createClerkFixture(config);

  const MockClerkProvider = (props: any) => {
    const { children } = props;
    return (
      <CoreClerkContextWrapper clerk={mockedClerk}>
        <EnvironmentProvider value={mockedEnvironment}>
          <RouteContext.Provider value={initialRouteContextValue}>
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

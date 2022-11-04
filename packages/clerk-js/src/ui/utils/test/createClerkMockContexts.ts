import { Clerk } from '@clerk/types';

import { getInitialEnvironmentResource, getInitialMockClerkConfig, getInitialRouteContextValue } from './mockConfigs';

const applyOptionsToInitialMockConfig = (fixtureConfig: any) => {
  const mockClerkConfig = getInitialMockClerkConfig();
  const mockEnvironmentResource = getInitialEnvironmentResource();
  const mockRouteContextValue = getInitialRouteContextValue();

  fixtureConfig.environment.social.forEach((s: any) => {
    mockEnvironmentResource.userSettings.authenticatableSocialStrategies.push(s.oauthProvider);
    mockEnvironmentResource.userSettings.socialProviderStrategies.push(s.oauthProvider);
  });
  fixtureConfig.environment.enabledFirstFactorIdentifiers.forEach((identifier: any) => {
    mockEnvironmentResource.userSettings.enabledFirstFactorIdentifiers.push(identifier.identifier);
  });
  mockClerkConfig.client.signIn.create = fixtureConfig.client.signIn.create;
  mockRouteContextValue.navigate = fixtureConfig.routeContext.navigate;

  return { mockClerkConfig, mockEnvironmentResource, mockRouteContextValue };
};

export const createClerkMockContexts = (fixtureConfig: any) => {
  const { mockClerkConfig, mockEnvironmentResource, mockRouteContextValue } =
    applyOptionsToInitialMockConfig(fixtureConfig);
  const listeners: any[] = [];

  const client = mockClerkConfig.client;
  const session = mockClerkConfig.session;
  const user = mockClerkConfig.user;
  const organization = mockClerkConfig.organization;
  const resources = { client, session, user, organization };
  const addListener = (listener: any) => {
    listeners.push(listener);
    listener(resources);
  };
  const updateMock = () => {
    // how do we create new state?
    const newState = { ...resources };
    listeners.forEach(listener => listener(newState));
  };

  return {
    mockedEnvironment: mockEnvironmentResource,
    mockedRouteContext: mockRouteContextValue,
    mockedClerk: { ...resources, addListener } as Clerk,
    updateClerkMock: updateMock,
  };
};

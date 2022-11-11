import { Clerk, SignInFirstFactor } from '@clerk/types';

import { getInitialEnvironmentResource, getInitialMockClerkConfig, getInitialRouteContextValue } from './mockConfigs';

const applyOptionsToInitialMockContext = (fixtureConfig: any) => {
  const mockClerkContext = getInitialMockClerkConfig();
  const mockEnvironmentResource = getInitialEnvironmentResource();
  const mockRouteContextValue = getInitialRouteContextValue();

  fixtureConfig.environment.social.forEach((s: any) => {
    mockEnvironmentResource.userSettings.authenticatableSocialStrategies.push(s.strategy);
    mockEnvironmentResource.userSettings.socialProviderStrategies.push(s.strategy);
  });
  fixtureConfig.environment.enabledFirstFactorIdentifiers.forEach((identifier: any) => {
    mockEnvironmentResource.userSettings.enabledFirstFactorIdentifiers.push(identifier.identifier);
  });
  fixtureConfig.client.signIn.supportedFirstFactors.forEach((factorStrategy: SignInFirstFactor) => {
    mockClerkContext.client.signIn.supportedFirstFactors.push(factorStrategy);
  });
  mockClerkContext.client.signIn.create = fixtureConfig.client.signIn.create;
  mockRouteContextValue.navigate = fixtureConfig.routeContext.navigate;

  return { mockClerkContext, mockEnvironmentResource, mockRouteContextValue };
};

export const createClerkMockContexts = (fixtureConfig: any) => {
  const { mockClerkContext, mockEnvironmentResource, mockRouteContextValue } =
    applyOptionsToInitialMockContext(fixtureConfig);
  const listeners: any[] = [];

  const client = mockClerkContext.client;
  const session = mockClerkContext.session;
  const user = mockClerkContext.user;
  const organization = mockClerkContext.organization;
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

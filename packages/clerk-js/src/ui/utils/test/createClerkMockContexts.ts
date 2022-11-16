import { Clerk, SignInFirstFactor } from '@clerk/types';

import { getInitialMockClerkConfig, getInitialRouteContextValue } from './mockConfigs';

const applyOptionsToInitialMockContext = (fixtureConfig: any) => {
  const mockClerkContext = getInitialMockClerkConfig();
  const mockRouteContextValue = getInitialRouteContextValue();

  fixtureConfig.client.signIn.supportedFirstFactors.forEach((factorStrategy: SignInFirstFactor) => {
    mockClerkContext.client.signIn.supportedFirstFactors.push(factorStrategy);
  });
  mockClerkContext.client.signIn.create = fixtureConfig.client.signIn.create;
  mockRouteContextValue.navigate = fixtureConfig.routeContext.navigate;

  return { mockClerkContext, mockRouteContextValue };
};

export const createClerkMockContexts = (fixtureConfig: any) => {
  const { mockClerkContext, mockRouteContextValue } = applyOptionsToInitialMockContext(fixtureConfig);
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
    mockedRouteContext: mockRouteContextValue,
    mockedClerk: { ...resources, addListener } as Clerk,
    updateClerkMock: updateMock,
  };
};

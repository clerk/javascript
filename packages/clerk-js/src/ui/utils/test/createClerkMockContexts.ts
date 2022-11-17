import { SignInFirstFactor } from '@clerk/types';

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
  const { mockRouteContextValue } = applyOptionsToInitialMockContext(fixtureConfig);

  return {
    mockedRouteContext: mockRouteContextValue,
  };
};

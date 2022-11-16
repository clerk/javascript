import { Clerk } from '@clerk/types';
import { jest } from '@jest/globals';

import { RouteContextValue } from '../../router';

const initialMockClerkConfig: Clerk = {
  frontendApi: 'test.host',
  organization: undefined,
  user: null,
  session: null,
  addListener: jest.fn(),
  client: {
    pathRoot: '/client',
    sessions: [],
    signUp: {
      pathRoot: '/client/sign_ups',
      status: null,
      requiredFields: [],
      optionalFields: [],
      missingFields: [],
      unverifiedFields: [],
      verifications: {
        emailAddress: {
          pathRoot: 'test.host',
          status: null,
          strategy: null,
          nonce: null,
          externalVerificationRedirectURL: null,
          attempts: null,
          expireAt: null,
          error: null,
          verifiedAtClient: null,
          nextAction: 'test.host',
          supportedStrategies: [],
        },
        phoneNumber: {
          pathRoot: 'test.host',
          status: null,
          strategy: null,
          nonce: null,
          externalVerificationRedirectURL: null,
          attempts: null,
          expireAt: null,
          error: null,
          verifiedAtClient: null,
          nextAction: 'test.host',
          supportedStrategies: [],
        },
        web3Wallet: {
          pathRoot: 'test.host',
          status: null,
          strategy: null,
          nonce: null,
          externalVerificationRedirectURL: null,
          attempts: null,
          expireAt: null,
          error: null,
          verifiedAtClient: null,
          nextAction: 'test.host',
          supportedStrategies: [],
        },
        externalAccount: {
          pathRoot: 'test.host',
          status: null,
          strategy: null,
          nonce: null,
          externalVerificationRedirectURL: null,
          attempts: null,
          expireAt: null,
          error: null,
          verifiedAtClient: null,
        },
      },
      username: null,
      firstName: null,
      lastName: null,
      emailAddress: null,
      phoneNumber: null,
      web3wallet: null,
      hasPassword: false,
      unsafeMetadata: {},
      createdSessionId: null,
      createdUserId: null,
      abandonAt: null,
    },
    signIn: {
      pathRoot: '/client/sign_ins',
      status: null,
      supportedIdentifiers: [],
      supportedFirstFactors: [],
      supportedSecondFactors: [],
      firstFactorVerification: {
        pathRoot: 'test.host',
        status: null,
        strategy: null,
        nonce: null,
        externalVerificationRedirectURL: null,
        attempts: null,
        expireAt: null,
        error: null,
        verifiedAtClient: null,
      },
      secondFactorVerification: {
        pathRoot: 'test.host',
        status: null,
        strategy: null,
        nonce: null,
        externalVerificationRedirectURL: null,
        attempts: null,
        expireAt: null,
        error: null,
        verifiedAtClient: null,
      },
      identifier: null,
      createdSessionId: null,
      userData: {},
      create: jest.fn(),
      createMagicLinkFlow: jest.fn(),
    },
    lastActiveSessionId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    id: 'client_2GLpcZTwM08TAm7RCDFrfekjbCO',
  },
} as any as Clerk;

const initialRouteContextValue: RouteContextValue = {
  basePath: 'test.host',
  startPath: 'test.host',
  fullPath: 'test.host',
  indexPath: 'test.host',
  currentPath: 'test.host',
  queryString: 'test.host',
  queryParams: {},
  getMatchData: jest.fn(),
  matches: jest.fn(),
  baseNavigate: jest.fn(),
  navigate: jest.fn(),
  resolve: jest.fn(() => ({ href: 'test.host' } as any)),
  refresh: jest.fn(),
  params: {},
} as any;

const initialFixtureConfig = {
  environment: {
    enabledFirstFactorIdentifiers: [],
    social: [],
  },
  client: {
    signIn: {
      supportedFirstFactors: [],
      create: jest.fn(),
      createMagicLinkFlow: jest.fn(),
    },
  },
  routeContext: {
    navigate: jest.fn(),
  },
};

export const getInitialFixtureConfig = () => {
  const config = JSON.parse(JSON.stringify(initialFixtureConfig));
  config.client.signIn.create = jest.fn();
  config.client.signIn.createMagicLinkFlow = jest.fn();
  config.routeContext.navigate = jest.fn();
  return config;
};

export const getInitialMockClerkConfig = () => {
  const config = JSON.parse(JSON.stringify(initialMockClerkConfig));
  config.addListener = jest.fn();
  config.createdAt = new Date().toISOString();
  config.updatedAt = new Date().toISOString();
  config.client.signIn.createMagicLinkFlow = jest.fn(() => ({
    startMagicLinkFlow: jest.fn(() => new Promise(() => {})),
    cancelMagicLinkFlow: jest.fn(() => new Promise(() => {})),
  }));
  config.client.signIn.prepareFirstFactor = jest.fn(() => new Promise(() => {}));
  return config;
};

export const getInitialRouteContextValue = () => {
  const config = JSON.parse(JSON.stringify(initialRouteContextValue));
  config.getMatchData = jest.fn();
  config.matches = jest.fn();
  config.baseNavigate = jest.fn();
  config.navigate = jest.fn();
  config.resolve = jest.fn(() => ({ href: 'test.host' } as any));
  config.refresh = jest.fn();
  return config;
};

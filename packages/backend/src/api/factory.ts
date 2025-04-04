import { Clerk as BackendApiClient } from '@clerk/backend-sdk';

import { joinPaths } from '../util/path';

export type CreateBackendApiOptions = {
  /* Secret Key */
  secretKey?: string;
  /* Backend API URL */
  apiUrl?: string;
  /* Backend API version */
  apiVersion?: string;
  /* Library/SDK name */
  userAgent?: string;
  /**
   * Allow requests without specifying a secret key. In most cases this should be set to `false`.
   * Defaults to `true`.
   */
  requireSecretKey?: boolean;
};

export type ApiClient = ReturnType<typeof createBackendApiClient>;

export function createBackendApiClient(options: CreateBackendApiOptions) {
  const serverURL = options.apiUrl ? joinPaths(options.apiUrl, options.apiVersion) : undefined;

  const client = new BackendApiClient({
    bearerAuth: options.secretKey,
    serverURL,
    // userAgent: options.userAgent, // TODO: Add dynamic user agent
  });

  return {
    get actorTokens() {
      return client.actorTokens;
    },
    get allowlistIdentifiers() {
      return client.allowlistIdentifiers;
    },
    get blocklistIdentifiers() {
      return client.blocklistIdentifiers;
    },
    get betaFeatures() {
      return client.betaFeatures;
    },
    get clients() {
      return client.clients;
    },
    get domains() {
      return client.domains;
    },
    get emailAddresses() {
      return client.emailAddresses;
    },
    get emailAndSmsTemplates() {
      // TODO: Consolidate
      return client.emailAndSmsTemplates;
    },
    get emailSMSTemplates() {
      return client.emailSMSTemplates;
    },
    get experimentalAccountlessApplications() {
      return client.experimentalAccountlessApplications;
    },
    get instanceSettings() {
      return client.instanceSettings;
    },
    get invitations() {
      return client.invitations;
    },
    get jwks() {
      return client.jwks;
    },
    get jwtTemplates() {
      return client.jwtTemplates;
    },
    get miscellaneous() {
      return client.miscellaneous;
    },
    get oauthApplications() {
      return client.oauthApplications;
    },
    get organizations() {
      return client.organizations;
    },
    get organizationDomains() {
      return client.organizationDomains;
    },
    get organizationInvitations() {
      return client.organizationInvitations;
    },
    get organizationMemberships() {
      return client.organizationMemberships;
    },
    get phoneNumbers() {
      return client.phoneNumbers;
    },
    get proxyChecks() {
      return client.proxyChecks;
    },
    get redirectUrls() {
      return client.redirectUrls;
    },
    get samlConnections() {
      return client.samlConnections;
    },
    get sessions() {
      return client.sessions;
    },
    get signInTokens() {
      return client.signInTokens;
    },
    get signUps() {
      return client.signUps;
    },
    get templates() {
      // TODO: Consolidate
      return client.templates;
    },
    get testingTokens() {
      return client.testingTokens;
    },
    get waitlistEntries() {
      return client.waitlistEntries;
    },
    get users() {
      return client.users;
    },
    get webhooks() {
      return client.webhooks;
    },
  };
}

import type {
  CreateOrganizationEnterpriseConnectionParams,
  EnterpriseConnectionResource,
  UpdateOrganizationEnterpriseConnectionParams,
} from '@clerk/shared/types';
import { useSyncExternalStore } from 'react';

/**
 * PROTOTYPE ONLY — in-memory enterprise connection for demoing on instances
 * where FAPI rejects connection writes with "Self-serve SSO is not enabled".
 * When the real create fails with exactly that error, the umbrella hook falls
 * back to this store; every later mutation targeting the fake id is served
 * from here too. Purely client-side; a reload resets it. Delete with the branch.
 */

export const PROTOTYPE_CONNECTION_ID = 'ec_prototype';

export const isPrototypeConnectionId = (id: string | undefined): boolean => id === PROTOTYPE_CONNECTION_ID;

let connection: EnterpriseConnectionResource | null = null;
let testRunSucceeded = false;
let version = 0;
const listeners = new Set<() => void>();

const notify = (): void => {
  version++;
  listeners.forEach(listener => listener());
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getVersion = (): number => version;

/** Re-renders subscribers on any fake-connection change. */
export const usePrototypeEnterpriseConnection = (): number => useSyncExternalStore(subscribe, getVersion, getVersion);

export const getPrototypeConnection = (): EnterpriseConnectionResource | null => connection;

export const hasPrototypeTestRunSucceeded = (): boolean => testRunSucceeded;

export const markPrototypeTestRunSucceeded = (): void => {
  testRunSucceeded = true;
  notify();
};

const isOidc = (provider: string): boolean => provider.startsWith('oidc_') || provider.startsWith('oauth_custom_');

export const createPrototypeConnection = (
  params: CreateOrganizationEnterpriseConnectionParams,
): EnterpriseConnectionResource => {
  const { provider, domains = [], name } = params;
  const now = new Date();

  const base = {
    pathRoot: '',
    id: PROTOTYPE_CONNECTION_ID,
    name: name ?? provider,
    active: false,
    provider,
    logoPublicUrl: null,
    domains: [...domains],
    organizationId: null,
    syncUserAttributes: false,
    disableAdditionalIdentifications: false,
    allowOrganizationAccountLinking: false,
    customAttributes: [],
    createdAt: now,
    updatedAt: now,
    oauthConfig: isOidc(provider)
      ? {
          id: 'oac_prototype',
          name: name ?? provider,
          providerKey: provider,
          clientId: '',
          redirectUri: 'https://verified.clerk.dev/v1/oauth_callback',
          discoveryUrl: '',
          authUrl: '',
          tokenUrl: '',
          userInfoUrl: '',
          logoPublicUrl: null,
          requiresPkce: false,
          createdAt: now,
          updatedAt: now,
        }
      : null,
    samlConnection: isOidc(provider)
      ? null
      : {
          id: 'samlc_prototype',
          name: name ?? provider,
          active: false,
          idpEntityId: '',
          idpSsoUrl: '',
          idpCertificate: '',
          idpCertificateIssuedAt: 0,
          idpCertificateExpiresAt: 0,
          idpMetadataUrl: '',
          idpMetadata: '',
          acsUrl: `https://verified.clerk.dev/v1/saml/acs/${PROTOTYPE_CONNECTION_ID}`,
          spEntityId: `https://verified.clerk.dev/saml/${PROTOTYPE_CONNECTION_ID}`,
          spMetadataUrl: `https://verified.clerk.dev/v1/saml/metadata/${PROTOTYPE_CONNECTION_ID}.xml`,
          allowSubdomains: false,
          allowIdpInitiated: false,
          forceAuthn: false,
        },
    reload: () => Promise.resolve(connection),
    __internal_toSnapshot: () => ({}),
  };

  connection = base as unknown as EnterpriseConnectionResource;
  testRunSucceeded = false;
  notify();
  return connection;
};

export const updatePrototypeConnection = (
  params: UpdateOrganizationEnterpriseConnectionParams,
): EnterpriseConnectionResource => {
  if (!connection) {
    throw new Error('updatePrototypeConnection called without a prototype connection.');
  }

  const mutable = connection as unknown as Record<string, unknown>;

  if (params.name != null) {
    mutable.name = params.name;
  }
  if (params.domains) {
    mutable.domains = [...params.domains];
  }
  if (params.active != null) {
    mutable.active = params.active;
  }
  if (params.syncUserAttributes != null) {
    mutable.syncUserAttributes = params.syncUserAttributes;
  }

  if (params.saml && connection.samlConnection) {
    const saml = connection.samlConnection as unknown as Record<string, unknown>;
    for (const key of ['idpEntityId', 'idpSsoUrl', 'idpCertificate', 'idpMetadataUrl', 'idpMetadata'] as const) {
      const value = params.saml[key];
      if (value !== undefined) {
        saml[key] = value ?? '';
      }
    }
  }

  if (params.oidc && connection.oauthConfig) {
    const oauth = connection.oauthConfig as unknown as Record<string, unknown>;
    for (const key of ['clientId', 'discoveryUrl', 'authUrl', 'tokenUrl', 'userInfoUrl', 'requiresPkce'] as const) {
      const value = params.oidc[key];
      if (value !== undefined) {
        oauth[key] = value ?? (key === 'requiresPkce' ? false : '');
      }
    }
  }

  mutable.updatedAt = new Date();
  // Fresh object identity so React consumers keyed on the resource re-derive.
  connection = { ...(connection as unknown as object) } as unknown as EnterpriseConnectionResource;
  notify();
  return connection;
};

export const deletePrototypeConnection = (): void => {
  connection = null;
  testRunSucceeded = false;
  notify();
};
